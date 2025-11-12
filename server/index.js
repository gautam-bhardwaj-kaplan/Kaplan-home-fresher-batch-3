const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;
const adminQuestionsRouter = require('./src/routes/admin/question.routes');
const adminUsersRouter = require('./src/routes/admin/user.routes');
const adminAnalyticsRouter = require('./src/routes/admin/analytics.routes');
const userRoutes = require("./src/routes/user.routes");
const questionRoutes = require("./src/routes/question.routes");
const leaderboardRoutes = require("./src/routes/leaderboard.routes");

const app = express();
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
