const userModel = require("../models/userModel");
const { isValidObjectId } = require("mongoose");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk")
const { uploadFile } = require('./awsUpload')
const validator = require('../validators/validator')


// ========================================= create User profile =======================================

const createUser = async function(req, res) {
  try {

      // Extract data from RequestBody
      // let data= req.body.data
      // data = JSON.parse(data)
     
      const data= req.body
      
       // first Check request body is coming or not 
      if(!validator.isValidRequestBody(data)) {
          res.status(400).send({status: false , message: 'Invalid request parameters. Please provide User details'})
          return
      }

      // Object Destructing
      let { fname, lname, email, phone, password, address } = data

     
       // Check Name is coming or not
      if(!validator.isValid(fname)) {
          res.status(400).send({status: false , message: 'FirstName is mandatory'})
          return
      }

      // Check Name is valid or not 
      if(!validator.isValid2(fname)) {
          res.status(400).send({status: false , message: 'FirstName is not a valid name'})
          return
      }
      
      let validString = /\d/;
      if(validString.test(fname)) 
          return res.status(400).send({ status: false, msg: "FirstName must be valid it should not contains numbers" });

        // Check Name is coming or not
      if(!validator.isValid(lname)) {
          res.status(400).send({status: false , message: 'LastName is mandatory'})
          return
      }

      // Check Name is valid or not 
      if(!validator.isValid2(lname)) {
          res.status(400).send({status: false , message: 'LastName is not a valid name'})
          return
      }
      
    
      if(validString.test(lname)) 
          return res.status(400).send({ status: false, msg: "LastName must be valid it should not contains numbers" });

      // Extracting file from request's files and validating and uploading in aws-s3
      let files = req.files
      if(!validator.isValid(files)) {
          res.status(400).send({status: false , message: 'profile image files is mandatory'})
          return
      }

      if(files && files.length > 0 ) {
          if (! validator.isValidImage(files[0].originalname)) {
              return res.status(400).send({ status : false , message:"File extension not supported!" });
          } 
          let uploadedFileURL = await uploadFile(files[0])
          data.profileImage = uploadedFileURL
          //res.status(201).send({msg: 'file uploaded succesfully', data: uploadedFileURL})
      }
      else{
          return res.status(400).send({status: false , message: "No file found" })
      }

      // Check Phone Number is coming or not
      if(!validator.isValid(phone)) {
          res.status(400).send({status: false , message: 'Phone number is mandatory'})
          return

      }

      // Validate the Phone Number
      if( !validator.isValidPhone(phone)) {
          res.status(400).send({status: false , message: 'Phone number is not a valid'})
          return

      }

      // Check Duplicate Phone Number
      const isExistPhone = await userModel.findOne({phone: phone})
      if(isExistPhone){
          res.status(400).send({status: false , message:'This phone number belong to other user'})
          return
      }

      // Check Email is Coming or not 
      if(!validator.isValid(email)) {
          res.status(400).send({status: false , message: 'Email is required'})
          return
      }

      // Validate Email
      if(!validator.isValidEmail(email)) {
          res.status(400).send({status: false , message: 'Email is invalid'})
          return
      }

       // Check Duplicate Email 
      const isExistEmail = await userModel.findOne({email: email})
      if(isExistEmail){
          res.status(400).send({status: false , message:'This Email belong to other user'})
          return
      }

       // Check Password is Coming Or not 
      if(!validator.isValid(password)) {
          res.status(400).send({status: false , message: 'password is required'})
          return
      }

       // Validate Password
      if(!validator.isValidPassword(password)){
          res.status(400).send({status: false , message:'It is not valid password'})
          return
      }
      
      const hashPass = await validator.hashPassword(password)
      data.password = hashPass
      
      // validate address should be object
      // if (address &&  Array.isArray(address) || typeof(address) === 'string' || typeof(address) === 'number'){
      //     res.status(400).send({status: false , message: 'Enter Address in correct format'})
      //     return
      // }
      //let address = data.address
      
      

      if(! address){
        res.status(400).send({status: false , message: 'Address is required'})
          return
      }
       address = JSON.parse(address)
      //const {shipping , billing } = address
      
      if(! address.shipping){
        res.status(400).send({status: false , message: 'Shipping is required'})
          return
      }
      

      
      if(! validator.isValid(address.shipping.street)) {
          res.status(400).send({status: false , message: 'Shipping street is required'})
          return
      }

       // Validate street
      if(! validator.isValid2(address.shipping.street)){
          res.status(400).send({status: false , message: 'Enter a valid Street'})
          return
      }

      if(! validator.isValid(address.shipping.city)) {
        res.status(400).send({status: false , message: 'Shipping city is required'})
        return
      }
     
       // Validate city
      if( !validator.isValid2(address.shipping.city)){
          res.status(400).send({status: false , message: 'Enter a valid city name'})
          return
      }

      if(validString.test(address.shipping.city)) 
          return res.status(400).send({ status: false, msg: "City name must be valid it should not contains numbers" });

      if(! validator.isValid(address.shipping.pincode)) {
          res.status(400).send({status: false , message: 'Shipping pincode is required'})
          return
      }
      
      // Validate pincode
      if(!validator.isValidPincode(address.shipping.pincode)){
          res.status(400).send({status: false , message: ` ${shipping.pincode}  is not valid city pincode`})
          return
      } 
      if(! address.billing){
        res.status(400).send({status: false , message: 'billing is required'})
          return
      }

      if(! validator.isValid(address.billing.street)) {
        res.status(400).send({status: false , message: 'Billing street is required'})
        return
    }

     // Validate street
    if(! validator.isValid2(address.billing.street)){
        res.status(400).send({status: false , message: 'Enter a valid billing street'})
        return
    }

    if(! validator.isValid(address.billing.city)) {
      res.status(400).send({status: false , message: 'billing city is required'})
      return
    }
   
     // Validate city
    if( !validator.isValid2(address.billing.city)){
        res.status(400).send({status: false , message: 'Enter a valid billing city name'})
        return
    }

    if(validString.test(address.billing.city)) 
        return res.status(400).send({ status: false, msg: "billing city name must be valid it should not contains numbers" });

    if(! validator.isValid(address.billing.pincode)) {
        res.status(400).send({status: false , message: 'billing pincode is required'})
        return
    }

    // Validate pincode
    if(!validator.isValidPincode(address.billing.pincode)){
        res.status(400).send({status: false , message: ` ${billing.pincode}  is not valid billing city pincode`})
        return
    } 
  

      const data1 =  { fname, lname, email, phone, address }
       data1.profileImage = data.profileImage
       data1.password = hashPass
     
      // Finally Create The User Details After Validation
      let userData = await userModel.create(data1)
      res.status(201).send({ status:true, message: 'Success', data: userData })

  } catch (error) {
      res.status(500).send({status:false , msg: error.message});
  }
}

//=========================================== Fetch Profile =======================================

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

module.exports = { createUser, getProfile };
