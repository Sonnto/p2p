// if (process.env.NODE_ENV != "production") {
//   require("dotenv").config();
// }
const buffer = require("node:buffer");
const path = require("path");
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const pixelateImage = require("../../frontend/src/api/convert.js");
const fs = require("fs");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

// const initializePassport = require("../passport-config.js");
// initializePassport(passport, (username) =>
//   users.find((user) => user.username === username)
// );

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

//Use
app.use(cors());
//Node serve files for React frontend
app.use(express.json());

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
// app.use(flash());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// app.use(passport.initialize)();
// app.use(passport.session());

// Middleware function to check if the user is authenticated
let isAuthenticated = false;

function checkAuthenticated(req, res, next) {
  if (isAuthenticated) {
    return next();
  }
  res.redirect("/login");
}

app.get("/", checkAuthenticated, (req, res) => {
  res.render("../views/index.ejs");
});

app.get("/login", (req, res) => {
  res.render("../views/login.ejs");
});

//using Passport
// app.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//     failureFlash: true,
//   })
// );

//Regular user authentication without Passport
app.post("/login", async (req, res) => {
  pool.query(
    "SELECT * FROM users WHERE username = ?",
    req.body.username,
    (error, results) => {
      if (error) {
        console.error("Error retrieving user from the database:", error);
        return res.status(500).json({ error: "Failed to retrieve user" });
      }
      if (results.length === 0) {
        return res.status(400).send("Cannot find user");
      }
      const user = results[0];
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).send();
        }
        if (result) {
          isAuthenticated = true;
          return res.redirect("/", { message: "Successful login" });
        } else {
          return res.redirect("/login");
        }
      });
    }
  );
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.render("../views/register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      username: req.body.username,
      password: hashedPassword,
    };
    pool.query("INSERT INTO users SET ?", user, (error, results) => {
      if (error) {
        console.error("Error storing user in the database:", error);
        res.status(500).json({ error: "Failed to store user" });
      } else {
        res.json({ message: "User stored successfully" });
      }
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  // console.log(user);
});

//GET all users
app.get("/api/users", (req, res) => {
  pool.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.error("Error retrieving data from the database:", error);
      res.status(500).json({ error: "Failed to retrieve data" });
    } else {
      const userData = results.map((user) => {
        return {
          id: user.id,
          username: user.username,
          password: user.password,
        };
      });
      console.log(userData);
      res.json(userData);
    }
  });
});

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
          instructions: `/api/pixelations/${item.id}/instructions`, // Instructions endpoint
          segment: item.segment,
        };
      });
      //console.log("**AFTER RETURN: ", processedResults);
      //console.log("**End of AFTER RETURN");
      res.json(processedResults);
    }
  });
});

//GET instructions from database for speciifed {id}
app.get("/api/pixelations/:id/instructions", (req, res) => {
  //accepts {id} parameter in URL path
  const id = req.params.id;
  //requires specified {id}
  pool.query(
    "SELECT instructions FROM pixelations WHERE id = ?",
    id,
    (error, results) => {
      if (error) {
        console.error(
          "Error retrieving instructions from the database:",
          error
        );
        res.status(500).json({ error: "Failed to retrieve instructions" });
      } else if (results.length === 0) {
        res.status(404).json({ error: "Instructions not found" });
      } else {
        //convert base64 to buffer
        const instructionsBuffer = Buffer.from(
          results[0].instructions,
          "base64"
        );
        //set PDF-related headers in response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="instructions.pdf"'
        );
        //sends buffer-format instructions as response
        res.send(instructionsBuffer);
      }
    }
  );
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
app.get("*", checkAuthenticated, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../views", "index.ejs"));
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
