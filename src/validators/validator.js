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

const isSize = function(title) {
  //console.log(['Mr','Mrs','Miss'].includes(title));
  return ["S", "XS","M","X", "L","XXL", "XL"].includes(title.toUpperCase())
}

const isValidPrice = function (value) {
  if (/^\d+(\.\d{1,2})?$/.test(value)) return true
  return false
}

const isValidNum = function (value) {
   if (!/^[0-9]+$/.test(value)) {
      return false
  }
  return true
}

const isValidBoolean = (value) => {
  return (value === 'true' || value === 'false')
}

const isValidSize = (Arr) => {
  let newArr = []
  if (Arr.length === 0){return false};
  let brr = Arr[0].split(',')
  for (let i = 0; i < brr.length; i++) {       
      if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(brr[i].toUpperCase())) {return false;}
      newArr.push(brr[i].toUpperCase())
  }
  return newArr
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
  isValidSize,
  isValidPrice,
  isValidBoolean,
  isValidNum,
  isSize
 };
