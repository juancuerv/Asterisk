
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital',
    port: 3306
});

connection.connect(function (error) {

    if (error) {
        throw error;
    } else {
        console.log('Conexion correcta.');
    }
});

const consultasDB = ( query ) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results, fields) => {
          if (error) return reject(error);  // <-- Se rechaza la promesa y se pasa el motivo
          return resolve(results[0]) // <-- Se resuelve la promesa y se para el resultado
        })
      })
}


module.exports = {
    consultasDB
};
