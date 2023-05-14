import mysql from 'mysql';

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost', //add your database host url
    user: process.env.MYSQL_USER || 'root',    //add your database username
    password: process.env.MYSQL_PASS || 'root',    //add your database user password
    database: process.env.MYSQL_DB   || 'moe_db' //add your database name
});

export default db;