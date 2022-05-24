const express = require("express");
const router = express.Router();
const { authentication, authorisation } = require("../middlewares/auth");
const {createUser, getProfile, userUpdate } = require("../controllers/userController");

// user APIs
router.post("/register", createUser);
router.get("/user/:userId/profile",  getProfile);
router.put("/user/:userId/profile",userUpdate);

router.all("/*", function (req, res) {
  res
    .status(404)
    .send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;
