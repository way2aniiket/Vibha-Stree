const mongoose = require("mongoose");
require('dotenv').config();
mongoose
  .connect(
    `mongodb+srv://VibhaStree:lBFru3LeB1u3xzRk@vibhastree.iflzw.mongodb.net/Vibha-Stree`,{
      serverSelectionTimeoutMS: 60000, // Increase timeout to 60 seconds
      socketTimeoutMS: 45000, 
    })
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
