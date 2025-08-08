const express = require("express");

const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql"); // Import the mysql library for SQL connectivity
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  },
});

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

// Database configuration
const db = mysql.createConnection({
  host: "45.113.226.179",
  user: "admin_bikeONrentnewergt",
  password: "n@D664z5h",
  database: "bikeONrentnewergt"
});

// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the database");
});
let da = { bike: [] }; // Initialize da as an object with an empty array for the bike property
//
////////////////////////////////////////
io.on('connection', (socket) => {
  console.log('User connected: ', socket.id);

  //socket.emit('serverMessage', { serverMessage: 'dfgdfkjygh' });

  socket.on('join_room', (userId) => {
      socket.join(userId);  
      console.log(`${userId} joined room`);
setInterval(()=>{
  const query =`SELECT r01_status,r01_pic_add,r01_pic_lat,r01_pic_lon,r01_drop_add,r01_drop_lat,r01_drop_lon,p01_name,p03_vehical_name,p03_lat,p03_long,p03_vehical_number,u01_ride_otp
          FROM r01_ride_booking
          JOIN u01_register
            ON r01_ride_booking.r01_userid = u01_register.uo1_id
          JOIN p01_partner_register
            ON r01_ride_booking.r01_partnerid = p01_partner_register.po1_id
          JOIN p03_partnaer_bike
            ON r01_ride_booking.r01_partnerid = p03_partnaer_bike.p03_po1_id
            AND r01_ride_booking.ro1_id = ${userId}`;
  db.query(query, (err, results) => {
    if (err) {
      throw err;
    }
    
      da.bike = results;
   /// console.log(results?.[0]);
    socket.emit('serverMessage', { serverMessage: results });
});
},2000) 
});
//
  socket.on('user_request', (userId, requestData) => {
      console.log(`Received request from ${userId}`);
      const responseData = { message: "Here is your requested data" };
      io.to(userId).emit('response_data', responseData);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});
// ////////////////////////////////////

function fetchDataFromDatabase() {
  const query = "SELECT * FROM r01_ride_booking WHERE r01_status = 1";
  db.query(query, (err, results) => {
    if (err) {
      throw err;
    }
    da.bike = results;
    io.emit("ride_booking", da);
  });
}

let time = "";

// function runTimer(seconds) {
//   console.log("Timer started!");
//   function printCounter() {
//     io.emit("message", seconds);
//     time = seconds;
//    fetchDataFromDatabase();
//     //fetchDataFromDatabasebike();

//   }
//   printCounter();
//   const interval = setInterval(function () {
//     seconds++; 
//     printCounter(); 

//     if (seconds >= 60) {
//       console.log("60 seconds reached. Resetting timer.");

//       clearInterval(interval); // Stop the interval
//       runTimer(0); 
//     }
//   }, 1000); 
// }

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 4000;

io.on("connection", (socket) => {
  fetchDataFromDatabase(); // Fetch data from the database when a client connects
});

//runTimer(0);

app.get("/", (req, res) => {
  res.send(`<h1>server running at port=====> ${PORT}<h2>${time}</h2></h1>`);
});

httpServer.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
