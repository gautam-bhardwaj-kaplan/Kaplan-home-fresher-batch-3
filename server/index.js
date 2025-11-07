const express = require("express");
const dotenv = require("dotenv");
const adminQuestionsRouter = require('./src/routes/admin/question.routes');
const adminUsersRouter = require('./src/routes/admin/user.routes');
const PORT = process.env.PORT || 3000;

dotenv.config();
const app = express();

app.use(express.json());
app.use('/admin/questions',adminQuestionsRouter);
app.use('/admin/users',adminUsersRouter);

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
