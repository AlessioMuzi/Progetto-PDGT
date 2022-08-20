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

//funzione per l'autenticazione
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

//POST https://progettopdgt-alessiomuzi-meteo.glitch.me/meteo/login
//funzione per effetturare il login
app.post('/meteo/login', (req, res) => {
    if (authUser(req, res)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});