const jwt = require('jsonwebtoken');

// MIDDLEWARE PERSONALIZADOS

// VERIFICAR TOKEN

//process.env.SEED - Variable de entorno de heroku o local

let verificaToken = (req, res, next) => {

    let token = req.get('token'); //variable que se manda en el header

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).send({
                ok: false,
                err: {
                    message: 'No tiene autorización para acceder a esta página'
                }
            });
        }

        req.usuario = decoded.usuario;
        next(); //Que se ejecute lo que sigue de la ruta donde se llama

    });


    // res.json({
    //     token: token
    // });
};


//SOLO UN USUARIO ADMINISTRADOR PUEDE INSERTAR
//  Y MODIFICAR. USUARIO.ROLE='ADMIN_ROLE'
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') { //Si es ADMIN_ROLE
        next();
    } else {
        return res.status(401).send({
            ok: false,
            err: {
                message: 'El usuario NO es Administrador'
            }
        });
    }

};

let verificaTokenImg = (req, res, next) => {
    //Del tipo {{url}}/imagen/productos/5cc3f046d310b931e8e0f543-811.jpg?token=!23456
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).send({
                ok: false,
                err: {
                    message: 'No tiene autorización para acceder a esta página'
                }
            });
        }

        req.usuario = decoded.usuario;
        next(); //Que se ejecute lo que sigue de la ruta donde se llama

    });

};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}