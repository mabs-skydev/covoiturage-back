const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/api/rides", require("./routes/rides"));
app.use("/api/cars", require("./routes/cars"));

mongoose
  .connect("mongodb://localhost/covoiturage", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database..."))
  .catch(err => {
    console.log("Error while connecting to database: ", err);
  });

app.listen(5000, () => console.log("You application is now running on http://localhost:5000"));