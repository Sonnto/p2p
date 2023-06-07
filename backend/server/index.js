const express = require("express");

const PORT = process.env.PORT || 1225;

const app = express();

//api endpoint route

app.get("/api", (req, res) => {
  res.json({ message: "Data from the server" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
