const mysql = require("mysql");

// Create a connection to the database
const connection = mysql.createConnection({
    host: "103.20.215.96",
    user: "bikeONrentnewergt",
    password: "n@D664z5h",
    database: "admin_bikeONrentnewergt",
    multipleStatements: true
});

// open the MySQL connection
connection.connect(error => {
    if (error){
        console.log(error);
        return;
    }
    console.log("Successfully connected to the database.");
});

module.exports = connection;