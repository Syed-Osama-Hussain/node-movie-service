const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const user = require("./routes/user");
const auth = require("./routes/auth");
const subscription = require("./routes/subscription");
const content = require("./routes/content");
const config = require("./config.json");
const morgan = require("morgan");

const url = process.env.DATABASEURL || config.databaseURL;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use(express.json());
app.use(cors());
app.use(morgan("combined"));
app.set("port", 8000);
app.set("views", "views")
app.set("view engine", "ejs")

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/subscription", subscription);
app.use("/api/content", content);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("something went wrong");
});

app.listen(app.get("port"), () => {
  console.log("express app started at port 8000");
});
