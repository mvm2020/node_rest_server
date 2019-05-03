'use strict'

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario'); //Poder trabajar con el modelo
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// coloca los archivos en req.files
app.use(fileUpload({ useTempFiles: true }));

//app.post('/upload', function(req, res) {
//app.put('/upload', (req, res) => {
app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {

        return res.status(400).send({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).send({
            ok: false,
            err: {
                message: 'Los tipos validos son: ' + tiposValidos.join(', ')
            }
        });
    }


    let archivo = req.files.archivo; //nombre del input

    let nombreCortado = archivo.name.split('.');
    //console.log(nombreArchivo);
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).send({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ')
            },
            ext: extension
        });
    }

    //Cambiar el nombre del archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).send({
                ok: false,
                err
            });

        //Aqui ya se cargo la imagen

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

        // res.send({
        //     ok: true,
        //     message: 'Archivo cargado correctamente!'
        // });
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).send({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).send({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        //Si existe una imagen ya
        borraArchivo(usuarioDB.img, 'usuarios')

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, UsuarioGuardado) => {
            res.send({
                ok: true,
                producto: UsuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).send({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).send({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        //Si existe una imagen ya
        borraArchivo(productoDB.img, 'productos')

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.send({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;