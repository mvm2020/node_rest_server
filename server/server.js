'use strict'

require('./config/config');

const mongoose = require('mongoose');

const app = require('./routes/usuario');


mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', 3000);
});