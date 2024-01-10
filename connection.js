const mysql = require("mysql");

function connect() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "aman1234",
        database:"credentials",
        authPlugin: 'mysql_native_password',

    });

    con.connect((err) => {
        if (err) {
            console.error("Error connecting to database:", err);
        } else {
            console.log("Connected to database");
        }
    });

    return con;
}

module.exports = connect;
