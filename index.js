const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2"); // Import the mysql library for SQL connectivity
const app = express();
require("dotenv").config();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  },
});

// CORS configuration
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

// Database configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database with error handling
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the database");
});

let da = { bike: [] }; // Initialize `da` object

// Fetching ride booking data from the database
function fetchDataFromDatabase(userId) {
  const query = 
   `SELECT r01_status,r01_pic_add,r01_pic_lat,r01_pic_lon,r01_drop_add,r01_drop_lat,r01_drop_lon,p01_name,p03_vehical_name,p03_lat,p03_long,p03_vehical_number,u01_ride_otp
          FROM r01_ride_booking
          JOIN u01_register
            ON r01_ride_booking.r01_userid = u01_register.uo1_id
          JOIN p01_partner_register
            ON r01_ride_booking.r01_partnerid = p01_partner_register.po1_id
          JOIN p03_partnaer_bike
            ON r01_ride_booking.r01_partnerid = p03_partnaer_bike.p03_po1_id
            AND r01_ride_booking.ro1_id = ${userId}`; // Use parameterized queries

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database query failed:", err.stack);
      return;
    }

    da.bike = results;
    io.emit("ride_booking", da);  // Emit data to clients
  });
}

////////////////////////////////////////
io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  // Join room based on userId
  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`${userId} joined room`);

    // Periodically fetch data for the user
    const intervalId = setInterval(() => {
      fetchDataFromDatabase(userId);  // Fetch data from the database based on userId
      socket.emit("serverMessage", { serverMessage: da.bike });
    }, 2000); // Fetch data every 2 seconds

    // Clear interval when the user disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected");
      clearInterval(intervalId); // Clear interval to stop fetching data when the user disconnects
    });
  });

  // Handle user requests
  socket.on("user_request", (userId, requestData) => {
    console.log(`Received request from ${userId}`);
    const responseData = { message: "Here is your requested data" };
    io.to(userId).emit("response_data", responseData);
  });
});

// Express middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic route to check if the server is running
app.get("/", (req, res) => {
  res.send(`<h1>Server running at port: ${process.env.PORT || 4444}</h1>`);
});

const PORT = process.env.PORT || 4444;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
///////////