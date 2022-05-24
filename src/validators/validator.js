const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ObjectId validation
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId); // returns a boolean
};

const isValidRequestBody = function(requestBody) {
  return Object.keys(requestBody).length > 0
}

const isValid = function(value) {
    
  if(typeof value === 'undefined' || value === null) return false
  if(typeof value === 'string' && value.trim().length === 0) return false
  return true
}

const isValid2 = function(value) {
  const dv = /[a-zA-Z]/; 
  if(typeof value !== 'string') return false
  if(dv.test(value)=== false) return false
  return true
}

const isValidPincode = function(value) {
  const dv = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/; 
  if(typeof value !== 'number') return false
  if(dv.test(value)=== false) return false
  return true
}

const isValidEmail = function(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email) 

}

const isValidPhone = function(mobileNumber) {
 // return /^([+]\d{2}[ ])?\d{10}$/.test(mobileNumber) 
  return /^[6789]\d{9}$/.test(mobileNumber)
}

const isValidPassword = function(pass){
  let passRE = /^(?!\S*\s)(?=\D*\d)(?=.*[!@#$%^&*])(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z]).{8,15}$/;
  return passRE.test(pass)
}

function isValidImage(icon) {
  const ext = ['.jpg', '.jpeg', '.bmp', '.gif', '.png', '.svg'];
  return ext.some(el => icon.endsWith(el));
}



const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, 10)
  return hash
 // console.log(await bcrypt.compare(password, hash))
}

module.exports = { 
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
 };
