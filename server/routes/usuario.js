'use strict'

const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/usuario', function(req, res) {
    //res.send('Hola mundo');
    let desde = req.query.desde || 0; //Si hay parametros opcionales, si no 0
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    //.find({}, ' nombre email role estado google img') - lo que quiero ver
    Usuario.find({ estado: true }) //.find({ google: true })
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).send({
                    ok: false,
                    message: err
                });
            }
            //Contar
            Usuario.count({ estado: true }, (err, conteo) => { //.count({google: true}) SI CONDICION =  DE .find

                res.send({
                    ok: true,
                    usuarios,
                    total: conteo
                });

            });


        });

    // res.json('get usuario');
});

app.post('/usuario', function(req, res) { // /usuario
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).send({
                ok: false,
                message: err
            });
        }

        //NO MOSTRAR CONTRASEÑA - SE HIZO EN EL SCHEMA CON METHOD
        //usuarioDB.password = null;

        res.send({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', function(req, res) { //UPDATE
    let id = req.params.id;
    //res.json({ id });

    //PICK - OBJETO RECIBIDO Y ARREGLO DE CAMPOS QUE SE PUEDEN MODIFICAR
    //por POST
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //QUITAR CAMPOS DEL BODY PARA NO CAMBIARSE
    // delete body.password;
    // delete body.google;

    //Usuario.findById(id, (err,usuarioDB) => { }); FORMA 1
    //Forma 2 - Si se deea el objeto anterior, quitar el tercer argumento
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).send({
                ok: false,
                message: err
            });
        }

        res.send({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.delete('/usuario/:id', function(req, res) {
    //res.send('Hola mundo');
    //res.json('delete usuario');
    let id = req.params.id;

    //Eliminado fisicamente

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    //     if (err) {
    //         return res.status(400).send({
    //             ok: false,
    //             message: err
    //         });
    //     }

    //     if (!usuarioBorrado) {
    //         return res.status(400).send({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     res.send({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });
    // })

    //Eliminado lógicamente
    let cambiaEstado = {
            estado: false
        }
        // Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).send({
                ok: false,
                message: err
            });
        }

        if (usuarioBorrado.estado === false) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'Registro inexistente'
                }
            });
        }

        res.send({
            ok: true,
            usuario: usuarioBorrado
        });

    });


});

module.exports = app;