const path = require("path");
const express = require("express");
const mysql = require("mysql");
const pixelateImage = require("../../frontend/src/api/convert.js");

//Manage pool of database connections
const pool = mysql.createPool({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "",
  database: "pixelatedb",
});

// Handle connection events
pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Error connecting to the database:", err);
});

const PORT = process.env.PORT || 1225;

const app = express();

//Node serve files for React frontend
app.use(express.static(path.resolve(__dirname, "../frontend/build")));

//Handle POST requests to /api route
app.post("/api", async (req, res) => {
  // Extract data from the request body
  const { originalImage, pixelatedImage, instructions, segment } = req.body;

  // Store data in database
  const data = {
    original_image: originalImage,
    pixelated_image: pixelatedImage,
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
