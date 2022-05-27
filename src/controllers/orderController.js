const orderModel = require("../models/orderModel");
const {} = require("../validators/validator");

//=========================================== Create Order =============================================================================================

const createOrder = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//=========================================== Update Order =============================================================================================

const updateOrder = async (req, res) => {
  try {
    let userId = req.params.userId;
    let orderId = req.body.orderId;

    orderDoc = await orderModel.findOne({ _id: orderId });

    // if orderId and userId are not of the same user
    if (orderDoc.userId !== userId) {
      return res.status(404).send({
        status: false,
        message: `You are logged in as ${userId} & not as ${orderDoc.userId}`,
      });
    }

    // if order is cancelled already
    if (orderDoc.status === "cancelled") {
      return res.status(404).send({
        status: false,
        message: "Order is cancelled already!",
      });
    }

    // if order cannot be cancelled
    if (orderDoc.status === "completed") {
      return res.status(404).send({
        status: false,
        message: "Order completed; cannot be cancelled!",
      });
    }

    // cancelling order
    if (orderDoc.status === "pending") {
      orderDoc.status = "cancelled";
      let cancelledOrder = await orderDoc.save();
      return res.status(404).send({
        status: false,
        message: "Order cancelled!",
        data: cancelledOrder,
      });
    }
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//======================================================================================================================================================

module.exports = { createOrder, updateOrder };
