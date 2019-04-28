'use strict'

const express = require('express');
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//MOSTRAR TODAS LAS CATEGORIAS
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        //.populate('usuario') - Se ven todos los campos
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).send({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({}, (err, conteo) => {
                res.status(200).send({
                    ok: true,
                    categorias,
                    total: conteo
                });

            });

        });
});

//MOSTRAR UNA CATEGORIA POR ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'ID invalido'
                }
            });
        }


        res.status(200).send({
            ok: true,
            categoriaDB
        });
    });

});

//CREAR NUEVA CATEGORIA
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body; //POST

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).send({
                ok: false,
                err
            });
        }


        res.status(200).send({
            ok: true,
            categoria: categoriaDB
        });
    });

});

//ACTUALIZAR CATEGORIA
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).send({
                ok: false,
                message: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).send({
                ok: false,
                err
            });
        }

        res.status(200).send({
            ok: true,
            categoria: categoriaDB
        });

    });
});

//BORRAR CATEGORIA
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                message: err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.status(200).send({
            ok: true,
            categoria: categoriaBorrada
        });
    });
});

module.exports = app;