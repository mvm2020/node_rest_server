// ===========
// PUERTO, PARA NO CAMBIAR NADA EN PRODUCCION EN NUBE
// ===========
process.env.PORT = process.env.PORT || 3000;

//ENTORNO (Desarrollo o producción)
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//VENCIMIENTO DEL TOKEN - 60 SEGS * 60 MINS * 24 HRS * 30DIAS
// 60 * 60 * 24 * 30

process.env.CADUCIDAD_TOKEN = 60 * 60 * 60 * 24 * 30;


//SEED DE AUTENTICACION
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo'


//BASE DE DATOS
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB; //Creamos una environtment, o variable global

//GOOGLE CLIENT ID

process.env.CLIENT_ID = process.env.CLIENT_ID || '705520164585-biocdn6lqtuqpqmb9efelgp86ecpkgr4.apps.googleusercontent.com';