if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const path = require("path");
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const ejsMate = require("ejs-mate");

//Manage pool of database connections
const pool = mysql.createPool({
  host: process.env.SERVER_HOST,
  port: process.env.SERVER_PORT,
  user: process.env.SERVER_USER,
  password: process.env.SERVER_PASSWORD,
  database: process.env.SERVER_DB_NAME,
});

// Handle connection events, create a default user on database initialization
pool.on("connect", () => {
  console.log("Connected to the database");
  createDefaultUser();
});

pool.on("error", (err) => {
  console.error("Error connecting to the database:", err);
});

const PORT = process.env.PORT || 1225;

const app = express();

app.use(cors());
//Node serve files for React frontend
app.use(express.json());
app.engine("ejs", ejsMate);
app.set("view-engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Configure the default layout
app.locals.layout = "layout";

//Allows CSS to be accessed
app.use("/public", express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//Creates a default user when server initialized
const createDefaultUser = () => {
  const username = "Adam";
  const password = "password";
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = {
    username: username,
    password: hashedPassword,
  };
  //creates the users and inserts into a user table
  pool.query("INSERT INTO users SET ?", user, (error, results) => {
    if (error) {
      console.error("Error creating default Adam user:", error);
    } else {
      console.log("Default Adam user created successfully");
    }
  });
};

const theAdamAccount = () => {
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
      if (userData.length <= 0) {
        createDefaultUser();
      }
    }
  });
};
//Creates an account where there is none (or under a certain threshold of accounts);
theAdamAccount();

function checkAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  res.redirect("/login");
}

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send();
    }
    res.redirect("/login");
  });
});

app.get("/", checkAuthenticated, (req, res) => {
  pool.query("SELECT * FROM pixelations", (error, results) => {
    if (error) {
      console.error("Error retrieving data from the database:", error);
      res.status(500).json({ error: "Failed to retrieve data" });
    } else {
      const processedResults = results.map((item) => {
        // Convert images to base64 or any other format as needed
        return {
          id: item.id,
          original_image: item.original_image,
          pixelated_image: item.pixelated_image,
          instructions: item.instructions,
          segment: item.segment,
        };
      });
      res.render("../views/index.ejs", {
        loggedIn: req.session.loggedIn,
        data: processedResults,
      });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("../views/login.ejs", { loggedIn: req.session.loggedIn });
});

//User authentication
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
        return res.redirect("/error");
      }
      const user = results[0];
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).send();
        }
        if (result) {
          req.session.authenticated = true; //sets authentication flag true
          req.session.loggedIn = true;
          return res.redirect("/"); //redirect with access to database if username + password matches
        } else {
          return res.redirect("/login");
        }
      });
    }
  );
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.render("../views/register.ejs", { loggedIn: req.session.loggedIn });
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
    res.redirect("/login", { loggedIn: req.session.loggedIn });
  } catch {
    res.redirect("/register", { loggedIn: req.session.loggedIn });
  }
});

app.get("/error", (req, res) => {
  res.render("../views/error.ejs", { loggedIn: req.session.loggedIn });
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

// DELETE: delete a pixelation record based on the ID
app.post("/api/pixelations/delete/:id", (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM pixelations WHERE id = ?", id, (error, results) => {
    if (error) {
      console.error(
        "Error deleting the pixelation data from the database:",
        error
      );
      res.redirect("/error", { error: "Failed to delete pixelation data" });
    } else {
      res.redirect("/");
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
