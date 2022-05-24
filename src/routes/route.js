const express = require("express");
const router = express.Router();
const { authentication, authorisation } = require("../middlewares/auth");
const { getProfile } = require("../controllers/userController");

// user APIs
router.get("/user/:userId/profile", authentication, getProfile);

router.all("/*", function (req, res) {
  res
    .status(404)
    .send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;
