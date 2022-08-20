// import dei package necessari per lo sviluppo e definizione app
const express = require('express');
const cookieparser = require('cookie-parser');
const sha256 = require('js-sha256');
const jwt = require('njwt');
const cod_segreto = process.env.JWT_SECRET;
const app = express();
app.use(express.json());
app.use(cookieparser());

// registrazione degli utenti
// amministratore del sistema
// username: admin
// password: masterkey
const logins = new Map();

logins.set('admin', 
   {
    id: 1,
    salt: '59603',
    hash: '59279df725b764aaebee5ad04e1fa4d6626ffa339770a27c66ee0f754115064c'
   });

// utente generico
// username: user1
// password: temppass
logins.set('user1', 
   {
    id: 2,
    salt: '68103',
    hash: 'a668069b56ed45b490d255812ab28df908d1f9e2d020fb3b97c3ec175dcc8bdf'
   });

// funzione per l'autenticazione
function authUser(req, res) {
    if (!req.headers.authorization) {
        res.sendStatus(401); // UNAUTHORIZED
        return;
    }

    console.log('Autorizzazione: ' + req.headers.authorization);

    if (!req.headers.authorization.startsWith('Basic ')) {
        res.sendStatus(401); // UNAUTHORIZED
        return;
    }

    console.log('Basic auth');

    const auth = req.headers.authorization.substr(6);
    const decoded = Buffer.from(auth, 'base64').toString();
    console.log('Decoded: ' + decoded);

    const [login, password] = decoded.split(':');

    if (!logins.has(login)) {
        res.sendStatus(401); // UNAUTHORIZED
        return false;
    }
    const user = logins.get(login);
    console.log('Login come ' + login + ', utente ' + user.id);

    const compound = user.salt + password;
    let h = sha256.create();
    h.update(compound);
    const hashed = h.hex();

    console.log('Hash: ' + hashed + ', expected: ' + user.hash);

    if (hashed == user.hash) {
        const claims = {
            sub: login,
            iss: 'meteorologia'
        };

        const token = jwt.create(claims, cod_segreto);
        token.setExpiration(new Date().getTime() + 1200000); //= 20 minuti
        console.log('New token: ' + token.compact());

        res.cookie('sessionToken', token.compact());
        res.sendStatus(200); // OK
    } else {
        res.sendStatus(401); // UNAUTHORIZED
    }
}

// POST https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/login
// metodo per effetturare il login
app.post('/meteo/login', (req, res) => {
    if (authUser(req, res)) {
        res.sendStatus(200); // OK
    } else {
        res.sendStatus(401); // UNAUTHORIZED
    }
});

// database del servizio 
const db = new Map();

db.set(1, {
    citta: 'Urbino',
    temperatura: {
        numero: 27,
        UM: 'celsius'
    },
    fenomeniAtmosferici: 'Sole',
    umidita: {
        numero: 80,
        UM: 'percento'
    }
});
db.set(2, {
    citta: 'Civitanova Marche',
    temperatura: {
        numero: 33,
        UM: 'celsius'
    },
    fenomeniAtmosferici: 'Sole',
    umidita: {
        numero: 77,
        UM: 'percento'
    }
});
db.set(3, {
    citta: 'Milano',
    temperatura: {
        numero: 20,
        UM: 'celsius'
    },
    fenomeniAtmosferici: 'Pioggia',
    umidita: {
        numero: 50,
        UM: 'percento'
    }
});

var prossimoId = 4;

// GET https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo
// restituisce tutti i dati meteo presenti nel servizio
app.get('/meteo', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401); // UNAUTHORIZED
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401); // UNAUTHORIZED

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore' || chiaveVerificata.body.sub == 'utente') {
                res.type('application/json').send(Array.from(db));
            } else {
                res.sendStatus(401); // UNAUTHORIZED
            }
        }
    });
});

// GET https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/meteoCitta/:id
// metodo che restituisce tutti i dati meteo di una data città partendo dall'id
app.get('/meteo/meteoCitta/:id', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401); // UNAUTHORIZED
        return; 
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401); // UNAUTHORIZED

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore' || chiaveVerificata.body.sub == 'utente') {
                const id = Number.parseInt(req.params.id);

                if (isNaN(id)) {
                    res.sendStatus(400); // BAD REQUEST
                    return;
                }
                if (!db.has(id)) {
                    res.sendStatus(404); // NOT FOUND
                    return;
                }

                const meteo = db.get(id);
                res.format({
                    'application/json': () => {
                        res.json({
                            citta: meteo.citta,
                            temperatura: meteo.temperatura,
                            fenomeniAtmosferici: meteo.fenomeniAtmosferici,
                            umidita: meteo.umidita
                        });
                    }
                });
            } else {
                res.sendStatus(401); // UNAUTHORIZED
            }
        }
    });
});

// funzione per verificare la struttura di due file JSON, restituisce true se hanno la stessa struttura, altrimenti false
function verificaJson(primoJson, secondoJson) {
    for (var i in primoJson)
        if (!secondoJson.hasOwnProperty(i))
            return false;
    return true;
}

// POST https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/aggiungiCitta
// metodo per aggiungere una nuova città nel database (JSON) del servizio. Richiede i permessi da admin.
app.post('/meteo/aggiungiCitta', (req, res) => {
  if (!req.cookies.sessionToken) {
        res.sendStatus(401); // UNAUTHORIZED
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401); // UNAUTHORIZED
 
        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore') 
            {
              // viene accettato solo un body con Content-Type application/json
              if (req.get('Content-Type') != 'application/json') {
                    res.sendStatus(415); // UNSUPPORTED MEDIA TYPE
                    return;
                }

                var baseJson = {
                    citta: 'CittàDiProva',
                    temperatura: {
                        numero: 30,
                        UM: 'celsius'
                    },
                    fenomeniAtmosferici: 'Sole',
                    umidita: {
                        numero: 80,
                        UM: 'percento'
                    }
                };
                if (verificaJson(JSON.stringify(baseJson), JSON.stringify(req.body)) != true) {
                    res.sendStatus(400); // BAD REQUEST
                    return;
                }
              
                console.log('Viene aggiunta la città ' + req.body.citta);
              
                var id = prossimoId++;
                db.set(id, {
                    citta: req.body.citta,
                    temperatura: {
                        numero: req.body.temperatura.numero,
                        UM: req.body.temperatura.UM
                    },
                    fenomeniAtmosferici: req.body.fenomeniAtmosferici,
                    umidita: {
                        numero: req.body.umidita.numero,
                        UM: req.body.umidita.UM
                    }
                });

                res.json({
                    id: id,
                    citta: req.body.citta
                });
            } 
            else 
            {
                res.sendStatus(401); // UNAUTHORIZED
            }
        }
    });
});

// DELETE https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/eliminaCitta/:id
// metodo per rimuovere una nuova città nel database (id) del servizio. Richiede i permessi da admin.
app.delete('/meteo/eliminaCitta/:id', (req, res) => {
  if (!req.cookies.sessionToken) {
        res.sendStatus(401); // UNAUTHORIZED
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401); // UNAUTHORIZED

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore') 
            {
              const id = Number.parseInt(req.params.id);
                if (isNaN(id)) {
                    res.sendStatus(400); // BAD REQUEST
                    return;
                }

                if (!db.has(id)) {
                    res.sendStatus(404); // NOT FOUND
                    return;
                }

                db.delete(id);

                res.sendStatus(200); // OK
            } 
            else 
            {
                res.sendStatus(401); // UNAUTHORIZED
            }
        }
    });
});

// POST hhttps://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/modificaDato
// metodo per modificare un qualsiasi parametro di una città del servizio.
app.post('/meteo/modificaDato', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401); // UNAUTHORIZED
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401); // UNAUTHORIZED

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore') {
                const id = Number.parseInt(req.query.id);
                const campo = req.query.campo;
                const nuovoValore = req.query.nuovoValore;

                if (isNaN(id)) {
                    res.sendStatus(400); // BAD REQUEST
                    return;
                }
                if (!db.has(id)) {
                    res.sendStatus(404); // NOT FOUND
                    return;
                }

                const riga = db.get(id);
                if (campo == 'c') {
                    riga.citta = nuovoValore;
                } else if (campo == 'tn') {
                    if (isNaN(nuovoValore)) {
                        res.sendStatus(400); // BAD REQUEST
                        return;
                    }
                    riga.temperatura.numero = nuovoValore;
                } else if (campo == 'tum') {
                    riga.temperatura.UM = nuovoValore;
                } else if (campo == 'fa') {
                    riga.fenomeniAtmosferici = nuovoValore;
                } else if (campo == 'un') {
                    if (isNaN(nuovoValore)) {
                        res.sendStatus(400); // BAD REQUEST
                        return;
                    }
                    riga.umidita.numero = nuovoValore;
                } else if (campo == 'uum') {
                    riga.umidita.UM = nuovoValore;
                } else {
                    res.sendStatus(404); // NOT FOUND
                    return;
                }
                res.sendStatus(200); // OK
            } else {
                res.sendStatus(401); // UNAUTHORIZED
            }
        }
    });
});

// definizione della porta d'ascolto per l'intero servizio
const listener = app.listen(process.env.PORT, () => {
    console.log("L'applicazione è in ascolto sulla porta " + listener.address().port);
});