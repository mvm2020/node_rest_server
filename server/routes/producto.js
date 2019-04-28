'use strict'

const express = require('express');
const _ = require('underscore');


let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');
const Categoria = require('../models/categoria');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Buscar Productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).send({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).send({
                    ok: false,
                    err: {
                        message: 'ID de producto invalido'
                    }
                });
            }

            res.status(200).send({
                ok: true,
                producto: productos
            });

        });
});

//Listar Productos 
app.get('/producto', verificaToken, function(req, res) {

    let desde = req.query.desde || 0; //Si hay parametros opcionales, si no 0
    desde = Number(desde);

    let limite = req.query.limite || 5; //Cuantos por página
    limite = Number(limite);
    //.find({}, ' nombre email role estado google img') - lo que quiero ver
    Producto.find({ disponible: true, }) //.find({ google: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {

            if (err) {
                return res.status(500).send({
                    ok: false,
                    err
                });
            }
            //Contar
            Producto.countDocuments({ disponible: true }, (err, conteo) => { //.count({google: true}) SI CONDICION =  DE .find

                res.send({
                    ok: true,
                    productos,
                    total: conteo
                });

            });

        });

});

//Listar productos por ID
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    // Producto.findById(id, (err, productoDB) => {
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).send({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).send({
                    ok: false,
                    err: {
                        message: 'ID de producto invalido'
                    }
                });
            }


            res.status(200).send({
                ok: true,
                productoDB
            });
        });

});

//Insertar producto
app.post('/producto', [verificaToken, verificaAdmin_Role], function(req, res) { // /producto
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria, //Se envía el _id de la categoría VERIFICARLA
        usuario: req.usuario._id, //El que inserta, logueado
        disponible: body.disponible
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }

        res.status(201).send({
            ok: true,
            producto: productoDB
        });
    });


});

//Actualizar Producto
app.put('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                message: err
            });
        }

        if (!productoDB) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save(productoDB, (err, productoGuardado) => {

            if (err) {
                return res.status(500).send({
                    ok: false,
                    err
                });
            }

            res.status(200).send({
                ok: true,
                producto: productoGuardado
            });
        });

    });

    // let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);


    // Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

    //     if (err) {
    //         return res.status(500).send({
    //             ok: false,
    //             message: err
    //         });
    //     }

    //     if (!productoDB) {
    //         return res.status(400).send({
    //             ok: false,
    //             err
    //         });
    //     }

    //     res.status(200).send({
    //         ok: true,
    //         categoria: productoDB
    //     });

    // });
});

//Eliminar Producto
app.delete('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).send({
                ok: false,
                message: err
            });
        }

        if (!productoDB) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).send({
                    ok: false,
                    message: err
                });
            }

            res.status(200).send({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });
        });

    });



    // Producto.findByIdAndRemove(id, (err, productoBorrado) => {
    //     if (err) {
    //         return res.status(500).send({
    //             ok: false,
    //             message: err
    //         });
    //     }

    //     if (!productoBorrado) {
    //         return res.status(400).send({
    //             ok: false,
    //             err: {
    //                 message: 'Producto no encontrado'
    //             }
    //         });
    //     }

    //     res.status(200).send({
    //         ok: true,
    //         producto: productoBorrado
    //     });
    // });

});

module.exports = app;