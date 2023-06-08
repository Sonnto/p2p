const path = require("path");
const express = require("express");

const PORT = process.env.PORT || 1225;

const app = express();

//Node serve files for React frontend
app.use(express.static(path.resolve(__dirname, "../client/build")));

//Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Data from the server" });
});

//All other GET requests not handled before will return React frontend
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
