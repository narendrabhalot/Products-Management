const mongoose = require("mongoose");

// ObjectId validation
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId); // returns a boolean
};

module.exports = { isValidObjectId };
