const mongoose = require("mongoose");
require('dotenv').config();
mongoose
  .connect(
    `mongodb+srv://VibhaStree:lBFru3LeB1u3xzRk@vibhastree.iflzw.mongodb.net/Vibha-Stree`)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
