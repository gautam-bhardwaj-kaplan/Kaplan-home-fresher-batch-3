const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;
const adminQuestionsRouter = require('./src/routes/admin/question.routes');
const adminUsersRouter = require('./src/routes/admin/user.routes');

const app = express();
app.use(express.json());

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use('/admin/questions',adminQuestionsRouter);
app.use('/admin/users',adminUsersRouter);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
