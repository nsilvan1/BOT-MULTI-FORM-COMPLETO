// src/utils/database.js
const mysql = require('mysql');
const config = require('../../config.json'); // Verifique se o caminho para o config.json está correto

const pool = mysql.createPool({
  host: config.ipBanco,
  user: config.userBanco,
  password: config.passBanco,
  database: config.nomedatabase
});

const query = (sql, params) => new Promise((resolve, reject) => {
  pool.query(sql, params, (error, results) => {
    if (error) {
      reject(error);
    } else {
      resolve(results);
    }
  });
});

module.exports = query; // Exportando a função diretamente
