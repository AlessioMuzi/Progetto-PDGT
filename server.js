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
    salt: '72354',
    hash: '676078535870a7fc8b536ff352a9cdd74d376467c40b4ca542b2695abe9b507a'
   });

// utente generico
// username: user1
// password: temp_pass
logins.set('user1', 
   {
    id: 2,
    salt: '69875',
    hash: 'd4aaaab9dfe83430fc06099a34996628c021d41e4e0eefc763b6b5665fcd7aa4'
   });