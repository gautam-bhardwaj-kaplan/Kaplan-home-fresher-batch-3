const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;
const prisma = require('./src/config/prisma');
const adminQuestionsRouter = require('./src/routes/admin/question.routes');
const adminUsersRouter = require('./src/routes/admin/user.routes');
const adminAnalyticsRouter = require('./src/routes/admin/analytics.routes');
const userRoutes = require("./src/routes/user.routes");
const questionRoutes = require("./src/routes/question.routes");
const leaderboardRoutes = require("./src/routes/leaderboard.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use('/api/admin/questions',adminQuestionsRouter);
app.use('/api/admin/users',adminUsersRouter);
app.use("/api/users", userRoutes);
app.use('/api/admin/analytics',adminAnalyticsRouter);
app.use("/api/questions", questionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});
