const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("./awsUpload");
const jwt = require("jsonwebtoken");
const {
  isValidObjectId,
  isValidRequestBody,
  isValidImage,
  isValidPassword,
  isValidPhone,
  isValidEmail,
  isValidPincode,
  isValid2,
  isValid,
  hashPassword,
} = require("../validators/validator");

//========================================== Create User Profile =======================================================================================

const createUser = async function (req, res) {
  try {
    // Extract data from RequestBody
    // let data= req.body.data
    // data = JSON.parse(data)

    const data = req.body;

    // first Check request body is coming or not
    if (!isValidRequestBody(data)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    // Object Destructing
    let { fname, lname, email, phone, password, address } = data;

    // Check Name is coming or not
    if (!isValid(fname)) {
      res
        .status(400)
        .send({ status: false, message: "FirstName is mandatory" });
      return;
    }

    // Check Name is valid or not
    if (!isValid2(fname)) {
      res
        .status(400)
        .send({ status: false, message: "FirstName is not a valid name" });
      return;
    }

    let validString = /\d/;
    if (validString.test(fname))
      return res.status(400).send({
        status: false,
        msg: "FirstName must be valid it should not contains numbers",
      });

    // Check Name is coming or not
    if (!isValid(lname)) {
      res.status(400).send({ status: false, message: "LastName is mandatory" });
      return;
    }

    // Check Name is valid or not
    if (!isValid2(lname)) {
      res
        .status(400)
        .send({ status: false, message: "LastName is not a valid name" });
      return;
    }

    if (validString.test(lname))
      return res.status(400).send({
        status: false,
        msg: "LastName must be valid it should not contains numbers",
      });

    // Extracting file from request's files and validating and uploading in aws-s3
    let files = req.files;
    if (!isValid(files)) {
      res
        .status(400)
        .send({ status: false, message: "profile image files is mandatory" });
      return;
    }

    if (files && files.length > 0) {
      if (!isValidImage(files[0].originalname)) {
        return res
          .status(400)
          .send({ status: false, message: "File extension not supported!" });
      }
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;
      //res.status(201).send({msg: 'file uploaded succesfully', data: uploadedFileURL})
    } else {
      return res.status(400).send({ status: false, message: "No file found" });
    }

    // Check Phone Number is coming or not
    if (!isValid(phone)) {
      res
        .status(400)
        .send({ status: false, message: "Phone number is mandatory" });
      return;
    }

    // Validate the Phone Number
    if (!isValidPhone(phone)) {
      res
        .status(400)
        .send({ status: false, message: "Phone number is not a valid" });
      return;
    }

    // Check Duplicate Phone Number
    const isExistPhone = await userModel.findOne({ phone: phone });
    if (isExistPhone) {
      res.status(400).send({
        status: false,
        message: "This phone number belong to other user",
      });
      return;
    }

    // Check Email is Coming or not
    if (!isValid(email)) {
      res.status(400).send({ status: false, message: "Email is required" });
      return;
    }

    // Validate Email
    if (!isValidEmail(email)) {
      res.status(400).send({ status: false, message: "Email is invalid" });
      return;
    }

    // Check Duplicate Email
    const isExistEmail = await userModel.findOne({ email: email });
    if (isExistEmail) {
      res
        .status(400)
        .send({ status: false, message: "This Email belong to other user" });
      return;
    }

    // Check Password is Coming Or not
    if (!isValid(password)) {
      res.status(400).send({ status: false, message: "password is required" });
      return;
    }

    // Validate Password
    if (!isValidPassword(password)) {
      res.status(400).send({
        status: false,
        message:
          "Password must be 8-15 characters long consisting of atleast one number, uppercase letter, lowercase letter and special character",
      });
      return;
    }

    const hashPass = await hashPassword(password);
    data.password = hashPass;

    // validate address should be object
    // if (address &&  Array.isArray(address) || typeof(address) === 'string' || typeof(address) === 'number'){
    //     res.status(400).send({status: false , message: 'Enter Address in correct format'})
    //     return
    // }
    //let address = data.address

    if (!address) {
      res.status(400).send({ status: false, message: "Address is required" });
      return;
    }
    address = JSON.parse(address);
    //const {shipping , billing } = address

    if (!address.shipping) {
      res.status(400).send({ status: false, message: "Shipping is required" });
      return;
    }

    if (!isValid(address.shipping.street)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping street is required" });
      return;
    }

    // Validate street
    if (!isValid2(address.shipping.street)) {
      res.status(400).send({ status: false, message: "Enter a valid Street" });
      return;
    }

    if (!isValid(address.shipping.city)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping city is required" });
      return;
    }

    // Validate city
    if (!isValid2(address.shipping.city)) {
      res
        .status(400)
        .send({ status: false, message: "Enter a valid city name" });
      return;
    }

    if (validString.test(address.shipping.city))
      return res.status(400).send({
        status: false,
        msg: "City name must be valid it should not contains numbers",
      });

    if (!isValid(address.shipping.pincode)) {
      res
        .status(400)
        .send({ status: false, message: "Shipping pincode is required" });
      return;
    }

    // Validate pincode
    if (!isValidPincode(address.shipping.pincode)) {
      res.status(400).send({
        status: false,
        message: ` ${shipping.pincode}  is not valid city pincode`,
      });
      return;
    }
    if (!address.billing) {
      res.status(400).send({ status: false, message: "billing is required" });
      return;
    }

    if (!isValid(address.billing.street)) {
      res
        .status(400)
        .send({ status: false, message: "Billing street is required" });
      return;
    }

    // Validate street
    if (!isValid2(address.billing.street)) {
      res
        .status(400)
        .send({ status: false, message: "Enter a valid billing street" });
      return;
    }

    if (!isValid(address.billing.city)) {
      res
        .status(400)
        .send({ status: false, message: "billing city is required" });
      return;
    }

    // Validate city
    if (!isValid2(address.billing.city)) {
      res
        .status(400)
        .send({ status: false, message: "Enter a valid billing city name" });
      return;
    }

    if (validString.test(address.billing.city))
      return res.status(400).send({
        status: false,
        msg: "billing city name must be valid it should not contains numbers",
      });

    if (!isValid(address.billing.pincode)) {
      res
        .status(400)
        .send({ status: false, message: "billing pincode is required" });
      return;
    }

    // Validate pincode
    if (!isValidPincode(address.billing.pincode)) {
      res.status(400).send({
        status: false,
        message: ` ${billing.pincode}  is not valid billing city pincode`,
      });
      return;
    }

    // const data1 =  { fname, lname, email, phone, address }
    // data1.profileImage = data.profileImage
    // data1.password = hashPass
    let finalData = {
      fname,
      lname,
      email,
      profileImage: data.profileImage,
      phone,
      password: hashPass,
      address,
    };

    // Finally Create The User Details After Validation
    let userData = await userModel.create(finalData);
    res.status(201).send({
      status: true,
      message: "User created successfully",
      data: userData,
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//========================================== Login User ================================================================================================

const loginUser = async (req, res) => {
  try {
    let data = req.body;

    // first Check request body is coming or not
    if (!isValidRequestBody(data)) {
      res.status(400).send({
        status: false,
        Message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    const { email, password } = data;

    // Check Email is Coming Or not
    if (!isValid(email)) {
      res.status(400).send({ status: false, message: "Email is required" });
      return;
    }

    // Validate Email
    if (!isValidEmail(email)) {
      res.status(400).send({ status: false, message: "Email is invalid" });
      return;
    }

    // Check password is Coming Or not
    if (!isValid(password)) {
      res.status(400).send({ status: false, message: "password is required" });
      return;
    }

    // Validate password
    if (!isValidPassword(password)) {
      res
        .status(400)
        .send({ status: false, message: "It is not valid password" });
      return;
    }

    // Check Email and password is Present in DB
    let user = await userModel.findOne({ email: email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({
        status: false,
        msg: "Email or password does not match, Invalid login Credentials",
      });
    }

    // Generate Token
    let token = jwt.sign(
      {
        userId: user._id.toString(),
        iat: new Date().getTime() / 1000,
      },
      "Group12",
      { expiresIn: "10h" }
    );

    // send response to  user that Author is successfully logged in
    res.status(200).send({
      status: true,
      message: "User login successfull",
      data: { userId: user._id, token: token },
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//=========================================== Fetch Profile ============================================================================================

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
    let userDoc = await userModel.findById(userId);
    if (!userDoc) {
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

//=========================================== Update Profile ===========================================================================================

const updateUser = async function (req, res) {
  try {
    const userId = req.params.userId;
    let requestBody = { ...req.body }; // req.body does not have a prototype; creating a new object (prototype object associates by default)
    let files = req.files;

    // if req.body is empty
    if (!isValidRequestBody(requestBody) && !files?.length) {
      res.status(400).send({
        status: false,
        message:
          "Invalid request parameters. Please provide updating keys details",
      });
      return;
    }

    let { fname, lname, email, phone, password, address } = requestBody;
    const updateUserData = {};

    // fname check
    if (requestBody.hasOwnProperty("fname")) {
      if (!isValid2(fname)) {
        return res.status(400).send({
          status: false,
          message: "fname is invalid",
        });
      }
      updateUserData.fname = fname;
    }

    // lname check
    if (requestBody.hasOwnProperty("lname")) {
      if (!isValid2(lname)) {
        return res.status(400).send({
          status: false,
          message: "lname is invalid",
        });
      }
      updateUserData.lname = lname;
    }

    // email check
    if (requestBody.hasOwnProperty("email")) {
      if (!isValidEmail(email)) {
        return res.status(400).send({
          status: false,
          message: "email is invalid",
        });
      }
      // email duplication check
      const emailDb = await userModel.findOne({ email: email });
      if (emailDb && emailDb._id.toString() !== userId)
        // 2nd part added 👆 to exclude "self(user)" email's duplication check
        return res
          .status(400)
          .send({ status: false, msg: `${email} already used!` });
      updateUserData.email = email;
    }

    // phone check
    if (requestBody.hasOwnProperty("phone")) {
      if (!isValidPhone(phone)) {
        return res.status(400).send({
          status: false,
          message: "phone is invalid",
        });
      }
      // phone duplication check
      const phoneDb = await userModel.findOne({ phone: phone });
      if (phoneDb && phoneDb._id.toString() !== userId)
        // 2nd part added 👆 to exclude "self(user)" phone's duplication check
        return res
          .status(400)
          .send({ status: false, msg: `${phone} already used!` });
      updateUserData.phone = phone;
    }

    // password check
    if (requestBody.hasOwnProperty("password")) {
      if (!isValidPassword(password)) {
        return res.status(400).send({
          status: false,
          message: "password is invalid",
        });
      }
      const hashPass = await hashPassword(password);
      updateUserData.password = hashPass;
    }

    //📌 Updating address
    let userDoc = await userModel.findById(userId);
    updateUserData.address = userDoc.address; // storing previous address in updateUserData

    // JSON.parse(undefined/emptyString) throws "Internal Server Error"
    if (isValid(address)) {
      address = JSON.parse(address); // new address (if sent through req.body) manipulated to access values using dot notation
    }
    const validString = /\d/;

    // adding new shipping details
    if (address?.shipping) {
      const shipping = address.shipping; // 👈 declaration

      if (shipping.hasOwnProperty("street")) {
        if (!isValid2(shipping.street)) {
          return res.status(400).send({
            status: false,
            message: "shipping address' street is invalid",
          });
        }
        updateUserData.address.shipping.street = shipping.street;
      }

      if (shipping.hasOwnProperty("city")) {
        // if city is invalid
        if (!isValid2(shipping.city) || validString.test(shipping.city)) {
          return res.status(400).send({
            status: false,
            message: "shipping address' city name is invalid",
          });
        }
        updateUserData.address.shipping.city = shipping.city;
      }

      if (shipping.hasOwnProperty("pincode")) {
        // if pincode is invalid
        if (!isValidPincode(shipping.pincode)) {
          return res.status(400).send({
            status: false,
            message: "shipping address' pincode is invalid",
          });
        }
        updateUserData.address.shipping.pincode = shipping.pincode;
      }
    }

    // adding new billing details
    if (address?.billing) {
      const billing = address.billing; // 👈 declaration

      if (billing.hasOwnProperty("street")) {
        // if street is invalid
        if (!isValid2(billing.street)) {
          return res.status(400).send({
            status: false,
            message: "billing address' street is invalid",
          });
        }
        updateUserData.address.billing.street = billing.street;
      }

      if (billing.hasOwnProperty("city")) {
        // if city is invalid
        if (!isValid2(billing.city) || validString.test(billing.city)) {
          return res.status(400).send({
            status: false,
            message: "billing address' city is invalid",
          });
        }
        updateUserData.address.billing.city = billing.city;
      }

      if (billing.hasOwnProperty("pincode")) {
        // if pincode is invalid
        if (!isValidPincode(billing.pincode)) {
          return res.status(400).send({
            status: false,
            message: "billing address' pincode is invalid",
          });
        }
        updateUserData.address.billing.pincode = billing.pincode;
      }
    }

    // updating image
    if (files.length) {
      if (!isValidImage(files[0].originalname)) {
        return res
          .status(400)
          .send({ status: false, message: "File extension not supported!" });
      }
      let uploadedFileURL = await uploadFile(files[0]);
      updateUserData.profileImage = uploadedFileURL;
    }

    let updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      updateUserData,
      { new: true }
    );

    res.status(200).send({
      status: true,
      message: "user profile updated",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { createUser, loginUser, getProfile, updateUser };
