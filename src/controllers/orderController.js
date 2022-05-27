const orderModel = require("../models/orderModel");
const {} = require("../validators/validator");

//=========================================== Create Order =============================================================================================

const createOrder = async (req, res) => {
  try {
  } catch (err) {
    res
      .status(500)
      .send({
        status: false,
        message: "Internal Server Error",
        error: err.message,
      });
  }
};

//=========================================== Update Order =============================================================================================

const updateOrder = async (req, res) => {
  try {
  } catch (err) {
    res
      .status(500)
      .send({
        status: false,
        message: "Internal Server Error",
        error: err.message,
      });
  }
};

//======================================================================================================================================================

module.exports = { createOrder, updateOrder };
