const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();
const multer = require("multer");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(multer().any());

mongoose
  .connect(
    "mongodb+srv://Group12:ePEkzwTEvjnPK9PW@cluster0.a4dyz.mongodb.net/group12Database",
    {
      useNewUrlParser: true,
    }
  )
  .then((result) => console.log("MongoDb is connected / Group12Database"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
