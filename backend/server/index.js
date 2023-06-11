const path = require("path");
const express = require("express");
const mysql = require("mysql");
const pixelateImage = require("../../frontend/src/api/convert.js");

//Manage pool of database connections
const pool = mysql.createPool({
  host: "localhost:8888",
  user: "USERNAME",
  password: "PASSWORD",
  database: "pixelatedb",
});

const PORT = process.env.PORT || 1225;

const app = express();

//Node serve files for React frontend
app.use(express.static(path.resolve(__dirname, "../client/build")));

//Handle GET requests to /api route
app.get("/api", (req, res) => {
  //Pixelate image and get pixelated image URL;
  const pixelatedImageUrl = pixelateImage(req.query.image);
  const instructions = "";
  const segment = "";

  //Store data in database
  const data = {
    originalImage: req.query.image,
    pixelatedImage: pixelatedImageUrl,
    instructions: instructions,
    segment: segment,
  };

  pool.query("INSERT INTO pixelations SET ?", data, (error, results) => {
    if (error) {
      console.error("Error storing data in the database:", error);
      res.status(500).json({ error: "Failed to store data" });
    } else {
      res.json({ message: "Data stored successfully" });
    }
  });

  res.json({ message: "Data from the server" });
});

//All other GET requests not handled before will return React frontend
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

process.on("SIGINT", () => {
  pool.end((err) => {
    if (err) {
      console.error("Error closing the database connection:", err);
    }
    process.exit(0);
  });
});
