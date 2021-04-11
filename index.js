var fs = require('fs');
var express = require('express');
var moduloLeer = require('./modulos/modulosCrud/moduloLeer');
var moduloGuardar = require('./modulos/modulosCrud/moduloGuardar');
var moduloActualizar = require('./modulos/modulosCrud/moduloActualizar');
var moduloBorrar = require('./modulos/modulosCrud/moduloBorrar');
var moduloLeerChat = require('./modulos/moduloLeerChat');
var moduloGuardarChat = require('./modulos/moduloGuardarChat');
var app = express();
var router = express.Router();
var handlebars = require('express-handlebars');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//----------------------------------------------
var http = require('http').Server(app);
var io = require('socket.io')(http);
//------------------------
var fecha = new Date();
var fecha_actual= fecha.getDay() + "/" + fecha.getMonth() + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds() + " "
var arreglo = [];
var arreglocarrito = [];
var admin = false
// configuracion handlebars
app.engine('hbs', handlebars({
    extname: ".hbs",
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/'
}));
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(express.static("public"));



//------------------------- Agregar Producto vista------------------------------
router.get(`/productos/agregar`, function (req, res) {
if(admin){
    res.status(200).render('agregar_producto');
}
if(!admin){
    res.status(200).render('Acceso_denegado')
}
    
})
//------------------------------Guardar Producto---------------------------------------
router.post(`/productos/`, function (req, res) {
    if(admin){
    moduloGuardar.guardar(false, fecha_actual,req.body.nombre,req.body.des,req.body.cod,req.body.url, req.body.precio,req.body.stock,fs,`./datos/productos.js`,true);
    res.status(200).redirect(`/productos/listar`)}
    if(!admin){
        res.status(400).json( { error : -1, descripcion: 'ruta /productos/ método post no autorizada'})
    }
});
//-----------------------------Ver todos los productos----------------------------------------
moduloLeer.leer(fs,`./datos/productos.js`).then(function (guardados) {
    if (guardados)
        arreglo = JSON.parse(guardados);
    
        router.get(`/productos/listar`, function (req, res) {
        res.status(200).render('listar_todos_productos', { arreglo: arreglo, listExists: true });
    });
//-----------------------Producto individual vista------------------------------------    
    router.get(`/productos/listar/:id`, function (req, res) {
        var id = parseInt(req.params.id);
        var existe = false;
        if(admin){
        arreglo.forEach(function (element, index) {
            
            if (element.id == id ) {
                res.status(200).render('listar_producto', { arreglo: arreglo[index], listExists: true })
                existe = true;
            }
        });
        if (!existe) {
            return res.status(400).json({ "error": "Producto no encontrado" });
        }
    }
    if(!admin){
        res.status(200).render('Acceso_denegado')
    }
    });
});

//------------------------------Actualizar Producto---------------------------------------
router.put(`/productos/:id`, function (req, res) {
    if(admin){
    moduloActualizar.actualizar( fecha_actual,req.body.nombre,req.body.des,req.body.cod,req.body.url, req.body.precio,req.body.stock,parseInt(req.params.id),fs,`./datos/productos.js`);
    res.status(200).json("actualizado")
}
if(!admin){
    res.status(400).json( { error : -1, descripcion: 'ruta /productos/:id método put no autorizada'})
}
});
//-------------------------------Borrar Producto-------------------------------------
router["delete"](`/productos/:id`, function (req, res) {
    if(admin){
    moduloBorrar.borrar(parseInt(req.params.id), fs,`./datos/productos.js`)
    res.status(200).json("Borrado")
}if(!admin){
    res.status(400).json( { error : -1, descripcion: 'ruta /productos/:id método delete no autorizada'})
}
});


//------------------------------Guardar en Carrito---------------------------------------
router.post(`/carrito`, function (req, res) {
    moduloGuardar.guardar(req.body.id, fecha_actual,req.body.nombre,req.body.des,req.body.cod,req.body.url, req.body.precio,req.body.stock,fs,`./datos/carrito.js`,false);
    console.log(req.body.id)
    res.status(200).redirect(`/carrito/listar`);
});
//-----------------------------Ver carrito----------------------------------------
moduloLeer.leer(fs,`./datos/carrito.js`).then(function (guardados) {
    
    if (guardados)
    arreglocarrito = JSON.parse(guardados);
        router.get(`/carrito/listar`, function (req, res) {
        res.status(200).render('listar_carrito', { arreglo: arreglocarrito, listExists: true })
    });
})

   //-----------------------Producto individual vista------------------------------------
   moduloLeer.leer(fs,`./datos/productos.js`).then(function (guardados) {
    if (guardados)
    arregloc = JSON.parse(guardados);
      
   router.get(`/carrito/agregar/:id`, function (req, res) {
    
    var id = parseInt(req.params.id);
    var existe = false;
    arreglo.forEach(function (element, index) {
        if (element.id == id) {
            res.status(200).render('agregar_carrito', { arreglo: arreglo[index], listExists: true });
            existe = true;
        }
    });
    if (!existe) {
        return res.status(400).json({ "error": "Producto no encontrado" });
    }

});
});

//-------------------------------Borrar carrito-------------------------------------
router["delete"](`/carrito/:id`, function (req, res) {
    moduloBorrar.borrar(parseInt(req.params.id), fs,`./datos/carrito.js`);
    res.status(200).json("Borrado");
});

//---------------------------conexion servidor------------------------------------------------
app.use('/', router);
app.use(express.static('public'));
var port = 8080;
var server = app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
server.on("error", function (error) { return console.log("error en servidor " + error); });




//--------------------socket--------------------------------------------------
http.listen(3000, function () { return console.log('SERVER ON'); });

//-------------------------------------------------------------------------
router.get('/chat', function (req, res) {
    res.status(200).render('./partials/chat');
});
router.get('/lista2', function (req, res) {
    res.status(200).render('./partials/lista');
});
//-------------------------------------
io.on('connection', function (socket) {
    console.log('¡Nuevo cliente conectado!');
    moduloLeerChat.leer(fs).then(function (guardados) {
        socket.emit('vermensajes', JSON.parse(guardados));
    });
    socket.on('paquete', function (data) {
        moduloGuardarChat.guardar(data.mail, data.mensaje, data.fecha, fs);
    });
    moduloLeer.leer(fs,`./datos/productos.js`).then(function (guardados) {
        socket.emit('lista', JSON.parse(guardados));
    });
    moduloLeer.leer(fs,`./datos/carrito.js`).then(function (guardados) {
        socket.emit('lista_carrito', JSON.parse(guardados));
    });
});
