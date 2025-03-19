const mongoose = require("mongoose");
require('dotenv').config();
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@vibhastree.iflzw.mongodb.net/Vibha-Stree`)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
