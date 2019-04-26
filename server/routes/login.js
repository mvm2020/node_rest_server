'use strict'

const express = require('express');
const bcrypt = require('bcrypt');
require('../config/config');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();


//Si mail, usuario y contraseña son correctos, genera un token
//Para que ese usuario pueda trabajar en las rutas
app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) { //Error de servidor - 500
            return res.status(500).send({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).send({
                ok: false,
                err: { //Fallo validacion con usuario - 400
                    message: 'Usuario o Contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(401).send({
                ok: false,
                err: { //Fallo validacion con contraseña - 401
                    message: 'Usuario o Contraseña incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.status(200).send({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });



});

module.exports = app;