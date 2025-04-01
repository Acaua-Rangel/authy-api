import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // Limita o número de conexões simultâneas
    queueLimit: 0
});

export default connection.getConnection((err, connection) => {
    if (err) {
        console.error("Erro ao conectar ao MySQL:", err);
        throw err;
    }
    console.log(`Connected to DataBase: ${process.env.MYSQL_DATABASE}`);
    connection.release(); // Libera a conexão para ser reutilizada no pool
});