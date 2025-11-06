const express = require("express");
const dotenv = require("dotenv");
const PORT = process.env.PORT || 3000;

dotenv.config();
const app = express();

app.use(express.json());

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
