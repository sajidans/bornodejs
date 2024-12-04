const express = require('express'); 
const app = express(); 
 
app.set("view engine", "ejs"); 
 
// Calling the public folder
app.use(express.static("public")); 
 
// Handling get request
app.get("/" , (req,res)=>{
  res.send("Welcome to GeeksforGeeks Video Call App"); 
});
 
// Listing the server 
app.listen(4000 , ()=>{
    console.log("Server running on port 4000");
})