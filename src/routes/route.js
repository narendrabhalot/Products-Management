const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/auth");
const {
  createUser,
  loginUser,
  getProfile,
  updateUser,
} = require("../controllers/userController");

// user APIs
router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/user/:userId/profile", authentication, getProfile);
router.put("//user/:userId/profile", updateUser);

router.all("/*", function (req, res) {
  res
    .status(404)
    .send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;
