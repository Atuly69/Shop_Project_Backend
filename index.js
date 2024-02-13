const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// routes
const users = require("./routes/userroutes");
const shop = require("./routes/shoproutes");
// roter config
const PORT = 9000;
const app = express();
app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:3001/",
      "http://192.168.1.9:3001/"
    ],
  })
);
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.get("/", async (req, res) => {
  res.send("Welcome to Shop Backend  App");
});
const CONNECTION = "mongodb://localhost:27017/shop_app";
mongoose
  .connect(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, async () => {
      console.log("Successfully Connected");
    })
  )
  .catch((error) => console.log(`${error} did not connect`));
app.use("/media", express.static("./uploads"));
app.use("/users", users);
app.use("/shop", shop);