// import dei package necessari e definizione app
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
// password: master_key
const logins = new Map();

logins.set('admin', 
   {
    id: 1,
    salt: '59603',
    hash: '676078535870a7fc8b536ff352a9cdd74d376467c40b4ca542b2695abe9b507a'
   });

// utente generico
// username: user1
// password: temp_pass
logins.set('user1', 
   {
    id: 2,
    salt: '68103',
    hash: 'd4aaaab9dfe83430fc06099a34996628c021d41e4e0eefc763b6b5665fcd7aa4'
   });

// funzione per l'autenticazione
function authUser(req, res) {
    if (!req.headers.authorization) {
        res.sendStatus(401);
        return;
    }

    console.log('Autorizzazione: ' + req.headers.authorization);

    if (!req.headers.authorization.startsWith('Basic ')) {
        res.sendStatus(401);
        return;
    }

    console.log('Basic auth');

    const auth = req.headers.authorization.substr(6);
    const decoded = Buffer.from(auth, 'base64').toString();
    console.log('Decoded: ' + decoded);

    const [login, password] = decoded.split(':');

    if (!logins.has(login)) {
        res.sendStatus(401);
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
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
}

// POST https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/login
// metodo per effetturare il login
app.post('/meteo/login', (req, res) => {
    if (authUser(req, res)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
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
        res.sendStatus(401);
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401);

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore' || chiaveVerificata.body.sub == 'utente') {
                res.type('application/json').send(Array.from(db));
            } else {
                res.sendStatus(401);
            }
        }
    });
});

// GET https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/meteoCitta/:id
// metodo che restituisce tutti i dati meteo di una data città partendo dall'id
app.get('/meteo/meteoCitta/:id', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401);
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401);

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore' || chiaveVerificata.body.sub == 'utente') {
                const id = Number.parseInt(req.params.id);

                if (isNaN(id)) {
                    res.sendStatus(400);
                    return;
                }
                if (!db.has(id)) {
                    res.sendStatus(404);
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
                res.sendStatus(401);
            }
        }
    });
});