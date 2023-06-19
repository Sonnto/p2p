const buffer = require("node:buffer");
const path = require("path");
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const pixelateImage = require("../../frontend/src/api/convert.js");
const fs = require("fs");

//Manage pool of database connections
const pool = mysql.createPool({
  host: "localhost",
  port: 8889,
  user: "admin",
  password: "admin",
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

app.use(cors());

//Node serve files for React frontend
app.use(express.json());

//GET: retrieve data from pixelations table to show, edit, delete, and download data
app.get("/api/pixelations", (req, res) => {
  pool.query("SELECT * FROM pixelations", (error, results) => {
    if (error) {
      console.error("Error retrieving data from the database:", error);
      res.status(500).json({ error: "Failed to retrieve data" });
    } else {
      const processedResults = results.map((item) => {
        // console.log("**BEFORE RETURN/CONVERSION: ", item.original_image);
        console.log("out of db: ", item.original_image);
        const originalImageBase64 = item.original_image.toString("base64");
        console.log("orignalImageBase64", originalImageBase64);
        const pixelatedImageBase64 = item.pixelated_image.toString("base64");
        // console.log("**OG IMAGE AFTER CONVERSION: ", originalImageBase64);
        // console.log("**PIXEL IMAGE AFTER CONVERSION: ", pixelatedImageBase64);
        return {
          id: item.id,
          original_image: originalImageBase64,
          pixelated_image: pixelatedImageBase64,
          instructions: item.instructions,
          segment: item.segment,
        };
      });
      //console.log("**AFTER RETURN: ", processedResults);
      //console.log("**End of AFTER RETURN");
      res.json(processedResults);
    }
  });
});

//Handle POST requests to /api route
app.post("/api", async (req, res) => {
  // console.log("Received data from frontend #1:", req.body);
  // Extract data from the request body
  const { originalImage, pixelatedImage, instructions, segment } = req.body;
  // console.log("Received data from frontend #2:", req.body);
  //console.log("originalImage:", originalImage);
  // console.log("pixelatedImage:", pixelatedImage);
  // console.log("instructions:", instructions);
  // console.log("segment:", segment);
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
  res.sendFile(path.resolve(__dirname, "../", "index.html"));
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
