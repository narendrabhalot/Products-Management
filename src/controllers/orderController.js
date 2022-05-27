const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const {
  isValidObjectId,
  isValidRequestBody,
  isValid,
  isValidBoolean,
  isValidStatus,
} = require("../validators/validator");

//=========================================== Create Order =============================================================================================

const createOrder = async function (req, res) {
  try {
    const userIdParams = req.params.userId;
    let data = { ...req.body }; // req.body does not have a prototype; creating a new object (prototype object associates by default)

    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        message: " please provide data in request body",
      });
    }

    let { userId, items, cancellable, status } = data;

    // if userId (in req.body) is empty
    if (!isValid(userId)) {
      res
        .status(400)
        .send({ status: false, message: "userId is empty (required field)" });
      return;
    }

    // if userId (in req.body) is invalid
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "userId is not a valid ObjectId" });
    }

    // if userId (in req.body) does not exist
    let userDoc = await userModel.findOne({ _id: userId });
    if (!userDoc) {
      return res
        .status(404)
        .send({ status: false, message: "user does not exist" });
    }

    //📌 AUTHORISATION:
    if (userIdParams !== userId) {
      return res.status(401).send({
        status: false,
        message: `Authorisation failed! You are logged in as ${userIdParams}, not as ${userId}`,
      });
    }

    // if items is empty (undefined)
    if (!isValid(items)) {
      return res.status(400).send({
        status: false,
        message: "item(s) is empty (required field)",
      });
    }

    if (isValid(items)) {
      items = JSON.parse(items); // parsing JSON string // you can use else over here
    }
    data.items = items; // storing the parsed JSON string

    // if items is empty (emptyarray)
    if (!items.length) {
      res.status(400).send({
        status: false,
        message: "item(s) is empty (required field)",
      });
      return;
    }

    let totalPrice = 0;
    let totalQuantity = 0;

    for (let i = 0; i < items.length; i++) {
      // if productId is empty
      if (!isValid(items[i].productId)) {
        return res.status(400).send({
          status: false,
          message: "ProductId is empty (required field)",
        });
      }

      // if productId is not a valid ObjectId
      if (!isValidObjectId(items[i].productId)) {
        return res.status(400).send({
          status: false,
          message: "ProductId is invalid",
        });
      }

      let productDoc = await productModel.findOne({ _id: items[i].productId });
      // if product does not exist
      if (!productDoc) {
        return res.status(404).send({
          status: false,
          message: "product does not exist",
        });
      }

      // if quantity is empty
      if (!isValid(items[i].quantity)) {
        return res.status(400).send({
          status: false,
          message: "quantity is empty (required field)",
        });
      }

      totalPrice += productDoc.price;
      totalQuantity += items[i].quantity;
    }

    data.totalPrice = totalPrice;
    data.totalQuantity = totalQuantity;
    data.totalItems = items.length;

    // if cancellable is invalid
    if (!isValidBoolean(cancellable)) {
      return res
        .status(400)
        .send({ status: false, message: "cancellable is invalid" });
    }

    // if status is invalid
    if (!isValidStatus(status)) {
      return res.status(400).send({
        status: false,
        msg: "status is invalid; accepted values:'pending', 'completed', 'cancelled'",
      });
    }

    let createdOrder = await orderModel.create(data);
    res.status(201).send({
      status: true,
      message: "Success",
      data: createdOrder,
    });
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

    // if orderId is not entered
    if (!isValid(orderId)) {
      return res.status(404).send({
        status: false,
        message: "Please enter OrderId to proceed!",
      });
    }

    // if orderId is not a valid ObjectId
    if (!isValidObjectId(orderId)) {
      return res.status(404).send({
        status: false,
        message: "OrderId is not a valid ObjectId",
      });
    }

    orderDoc = await orderModel.findOne({ _id: orderId });

    // if orderId does not exist
    if (!orderDoc) {
      return res.status(404).send({
        status: false,
        message: "Order does not exist",
      });
    }

    //📌 AUTHORISATION: if orderId and userId are not of the same user
    if (orderDoc.userId.toString() !== userId) {
      return res.status(404).send({
        status: false,
        message: `Authorised Failed! You are logged in as ${userId} & not as ${orderDoc.userId}`,
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
