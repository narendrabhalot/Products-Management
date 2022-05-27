const express = require("express");
const router = express.Router();
const { authentication, authorisation } = require("../middlewares/auth");
const {
  createUser,
  loginUser,
  getProfile,
  updateUser,
} = require("../controllers/userController");
const {
  createProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProductById,
} = require("../controllers/productController");
const {
  addToCart,
  updateCart,
  getCart,
  deleteCart,
} = require("../controllers/cartController");

// user APIs
router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/user/:userId/profile", authentication, getProfile);
router.put("/user/:userId/profile", authentication, updateUser);

// product APIs
router.post("/products", createProduct);
router.get("/products", getProduct);
router.get("/products/:productId", getProductById);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProductById);

// cart APIs
router.post(" /users/:userId/cart", authentication, authorisation, addToCart);
router.put(" /users/:userId/cart", authentication, authorisation, updateCart);
router.get("/users/:userId/cart", authentication, authorisation, getCart);
router.delete("/users/:userId/cart", authentication, authorisation, deleteCart);

router.all("/*", function (req, res) {
  res
    .status(404)
    .send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;
