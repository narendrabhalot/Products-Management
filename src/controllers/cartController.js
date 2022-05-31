const { cartModel } = require("../models/cartModel");
const {
  isValidObjectId,
  isValidRequestBody,
  isValid,
} = require("../validators/validator");

//========================================== addToCart =================================================================================================

const addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid user ID" });
    }

    const userDoc = await userModel.findById(userId);

    if (userDoc === null) {
      return res
        .status(404)
        .send({ status: false, message: "User does not exist in DB" });
    }

    if (req.userId !== userId) {
      return res.status(403).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
      });
    }

    const data = req.body;

    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        Message: "Invalid request parameters. Please provide Cart details",
      });
    }

    let { cartId, productId } = data;
    if (cartId) cartId = cartId.toString().trim();

    if ("cartId" in data) {
      if (!isValid(cartId))
        return res
          .status(400)
          .send({ status: false, message: "Cart Id value should be present" });
    }

    if (cartId && !isValidObjectId(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid Cart ID" });
    }

    if (productId) productId = productId.trim();

    if (!isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "product Id is Required" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid product ID" });
    }
    // console.log(productId);
    const productDoc = await productModel
      .findOne({ _id: productId, isDeleted: false })
      .lean()
      .select({ price: 1 });
    //console.log(productDoc)
    if (productDoc === null) {
      return res.status(404).send({
        status: false,
        message: "Product does not exist or may be deleted",
      });
    }

    // if (productDoc.installments <= 0) {
    //     return res.status(400).send({ status: false, message: `Product Is Out Of Stock Currently.` })

    // }

    const cartDoc = await cartModel.findOne({ userId: userId });

    if (cartDoc == null) {
      let cartObj = {};
      let itemArr = [];

      cartObj.userId = userId;

      const item_Obj = { productId: productId, quantity: 1 };
      itemArr.push(item_Obj);

      cartObj.items = itemArr;
      cartObj.totalPrice = productDoc.price;
      cartObj.totalItems = itemArr.length;

      const newCart = await cartModel.create(cartObj);

      return res
        .status(201)
        .send({ status: true, message: "Cart details", data: newCart });
    }

    if (!data.hasOwnProperty("cartId")) {
      return res.status(400).send({
        status: false,
        message: `The Cart Is Aleady Present for ${userId} userId,Please Enter  corresponding CartID`,
      });
    }

    if (cartId && cartDoc._id.toString() !== cartId) {
      return res
        .status(400)
        .send({ status: false, message: "cartId does not belong to userId" });
    }

    let itemList = cartDoc.items;
    let productIdList = itemList.map((item) => (item = item.productId));

    if (productIdList.find((pId) => pId.toString() == productId)) {
      const updatedCart = await cartModel.findOneAndUpdate(
        { userId: userId, "items.productId": productId },
        {
          $inc: {
            totalPrice: +productDoc.price,
            totalItems: +1,
            "items.$.quantity": +1,
          },
        },
        { new: true }
      );

      return res
        .status(200)
        .send({ status: true, message: "Cart details", data: updatedCart });
    }

    const updatedCart = await cartModel.findOneAndUpdate(
      { userId: userId },
      {
        $addToSet: { items: { productId: productId, quantity: 1 } },
        $inc: { totalPrice: +productDoc.price, totalItems: +1 },
      },
      { new: true }
    );

    return res
      .status(201)
      .send({ status: true, message: "Cart details", data: updatedCart });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//========================================== updateCart ================================================================================================

const updateCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid user ID" });
    }

    const userDoc = await userModel.findById(userId);

    if (userDoc === null) {
      return res
        .status(404)
        .send({ status: false, message: "User does not exist in DB" });
    }

    if (req.userId.toString() !== userId) {
      return res.status(403).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
      });
    }

    const data = { ...req.body };

    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        Message: "Invalid request parameters. Please provide Cart details",
      });
    }

    let { cartId, productId, removeProduct } = data;

    if (cartId) cartId = cartId.trim();

    if (!isValid(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: "Cart Id is Required" });
    }

    if (!isValidObjectId(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid cart ID" });
    }

    const cart = await cartModel.findOne({ userId: userId });
    if (
      !cart ||
      (cart.items.length == 0 && cart.totalItems == 0 && cart.totalPrice == 0)
    ) {
      return res.status(404).send({
        status: false,
        message: "Cart does not exist or may be deleted",
      });
    }

    //console.log(cart._id + "  " + cartId) ;
    if (cart._id.toString() !== cartId) {
      return res
        .status(400)
        .send({ status: false, message: "cartId does not belong to user" });
    }

    if (productId) productId = productId.trim();

    if (!isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "product Id is Required" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid product ID" });
    }

    const isProduct = await productModel
      .findOne({ _id: productId, isDeleted: false })
      .lean();

    if (isProduct === null) {
      return res.status(404).send({
        status: false,
        message: "Product does not exist or may be deleted",
      });
    }

    if (!data.hasOwnProperty("removeProduct")) {
      return res.status(400).send({
        status: false,
        message: "removeProduct key Should Be present",
      });
    }

    if (isNaN(removeProduct)) {
      return res.status(400).send({
        status: false,
        message: "Enter the number as value for removeProduct",
      });
    }

    if (!(removeProduct === 1 || removeProduct === 0)) {
      return res.status(400).send({
        status: false,
        message: `invalid input - remove Product key Should Be a number 1 or 0`,
      });
    }

    let itemList = cart.items;
    let productIdList = itemList.map(
      (item) => (item = item.productId.toString())
    );
    let pIndex = productIdList.indexOf(productId);
    if (pIndex == -1) {
      return res
        .status(400)
        .send({ status: false, message: `Product Does Not Exist In Cart` });
    }

    if (
      removeProduct == 0 ||
      (removeProduct == 1 && itemList[pIndex].quantity == 1)
    ) {
      let productPrice = itemList[pIndex].quantity * isProduct.price;

      const updated_Cart = await cartModel.findOneAndUpdate(
        { userId: userId },
        {
          $pull: { items: { productId: productId } },
          $inc: {
            totalPrice: -productPrice,
            totalItems: -itemList[pIndex].quantity,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "sucessfully Removed product",
        data: updated_Cart,
      });
    }

    if (removeProduct == 1) {
      const updated_Cart = await cartModel.findOneAndUpdate(
        { userId: userId, "items.productId": productId },
        {
          $inc: {
            totalPrice: -isProduct.price,
            totalItems: -1,
            "items.$.quantity": -1,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "sucessfully removed product",
        data: updated_Cart,
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
