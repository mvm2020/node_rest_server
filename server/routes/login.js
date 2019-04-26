'use strict'

const express = require('express');
const bcrypt = require('bcrypt');
require('../config/config');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//CONFIGURACION DE GOOGLE

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];

    // console.log(payload.name);
    // console.log(payload.email);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//verify().catch(console.error);

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token) //VERIFICA GOOGLE
        .catch(e => {
            return res.status(403).send({
                ok: false,
                err: e
            });
        });

    // res.send({
    //     usuario: googleUser
    // });

    //Que no haya un usuario con ese mail
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            //Usuario ya autenticado con credenciales normales
            if (usuarioDB.google === false) {
                return res.status(400).send({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else { //Es de google, renuevo su token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.send({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            }
        } else { //Si es nuevo x google
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; //obligatorio en model, pero aqui no se ocupa

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).send({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.send({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });
        }

    });

});

module.exports = app;