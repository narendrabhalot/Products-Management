const userModel = require("../models/userModel");
const { isValidObjectId } = require("mongoose");

//------------------------------------------------------------------------------------------------------------------------------------------------------

const getProfile = async function (req, res) {
  try {
    let userId = req.params.userId;

    // if userId is not a valid ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    // if user does not exist
    let userDoc = await userModel.findbyId(userId);
    if (!userDoc.length) {
      return res.status(400).send({
        status: false,
        message: "user does not exist",
      });
    }

    //📌 AUTHORISATION:
    if (req.userId !== userId) {
      return res.status(400).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
      });
    }
    res.status(200).send({
      status: true,
      message: "Sucess",
      data: userDoc,
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { getProfile };
