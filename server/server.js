'use strict'

require('./config/config');
const mongoose = require('mongoose');
const express = require('express');

const path = require('path');

const app = express();


//Habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

//Configuración global de ruras
app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', 3000);
});