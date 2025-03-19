const mongoose = require("mongoose");
require('dotenv').config();
mongoose
  .connect(
    `mongodb+srv://vibhastree:lbfru3leb1u3xzrk@vibhastree.iflzw.mongodb.net/Vibha-Stree`)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
