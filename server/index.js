const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;
const userRoutes = require("./src/routes/user.routes");

const app = express();
app.use(express.json());

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
