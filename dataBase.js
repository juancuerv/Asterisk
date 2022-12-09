//Conexión a base de datos. Uso de XAMPP
//conexión a basa de datos: https://www.neoguias.com/como-conectarse-a-mysql-usando-node-js/

// Paquete necesario para conectar a bases de datos MySQL.
var mysql = require('mysql');

// Parámetros de conexión a la base de datos
var conexion= mysql.createConnection({
    host : 'localhost',
    database : 'mundialFutbol',
    user : 'root',
    password : '',
    port: 3306
});

// Función que permite comprobar la conexión a la base de datos
conexion.connect(
    function(err) {
        if (err) {
            throw err;
        }
        console.log('Conectado con el identificador ' + conexion.threadId);
    }
);

// Función que devolverá resultados de la base de datos

const consultadb = ( query ) => {
    return new Promise((resolve, reject) => {
        conexion.query(query, (error, results, fields) => {
          if (error) return reject(error);  // <-- Se rechaza la promesa y se pasa el motivo
          return resolve(results) // <-- Se resuelve la promesa y se para el resultado
        })
      })
}

module.exports = {
    consultadb
};