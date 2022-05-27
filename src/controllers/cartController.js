const { cartModel } = require("../models/cartModel");
const {} = require("../validators/validator");

//========================================== addToCart =================================================================================================

const addToCart = async function (req, res) {
  try {
    const data = req.body;

    // if request body is empty
    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide User details",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//========================================== updateCart ================================================================================================

const updateCart = async function (req, res) {};

//========================================== getCart ===================================================================================================

const getCart = async function (req, res) {
  try {
    let cartDoc = await cartModel.findOne({ userId: userId });

    // if cart does not exist
    if (!cartDoc) {
      return res.status(404).send({
        status: false,
        message: "cart does not exist",
      });
    }

    res.status(200).send({
      status: false,
      message: "Success",
      data: cartDoc,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//========================================== deleteCart ================================================================================================

const deleteCart = async function (req, res) {
  try {
    let cartDoc = await cartModel.findOne({ userId: userId });

    // if cart does not exist
    if (!cartDoc) {
      return res.status(404).send({
        status: false,
        message: "cart does not exist",
      });
    }

    // emptying the cart
    (cartDoc.items = []), (cartDoc.totalPrice = 0), (cartDoc.totalItems = 0);
    let emptyCart = await cartDoc.save();

    res.send(204).send({
      status: false,
      message: "Success",
      data: emptyCart,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//======================================================================================================================================================

module.exports = { addToCart, updateCart, getCart, deleteCart };
