// import dei package necessari e definizione app
const express = require('express');
const cookieparser = require('cookie-parser');
const sha256 = require('js-sha256');
const jwt = require('njwt');
const cod_segreto = process.env.JWT_SECRET;
const app = express();
app.use(express.json());
app.use(cookieparser());