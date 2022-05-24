const express = require("express");
const router = express.Router();

router.all("/", function (req, res) {
  res
    .status(404)
    .send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;
