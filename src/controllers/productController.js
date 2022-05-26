const productModel = require('../models/productModel')
const aws = require("aws-sdk")
const { uploadFile } = require('./awsUpload')
const validator = require('../validators/validator');
const { json } = require('body-parser');


const createProduct = async function (req, res) {

    try {


        //const data = req.body
        const data =  JSON.parse(JSON.stringify(req.body))
        // first Check request body is coming or not 
        if(!validator.isValidRequestBody(data)) {
          res.status(400).send({status: false , message: 'Invalid request parameters. Please provide Product details'})
          return
      }

      let { 
        title,
        description,
        price,
        currencyId,
        currencyFormat,
        isFreeShipping,
        style,
        availableSizes,
        installments,  
        } = data

        if(!validator.isValid(title)) {
            res.status(400).send({status: false , message: 'Title is mandatory'})
            return
        }

        if(!validator.isValid2(title)) {
            res.status(400).send({status: false , message: 'Title is not valid string'})
            return
        }
        const isExistTitle = await productModel.findOne({title: title})
        if(isExistTitle){
          res.status(400).send({status: false , message:'This title belong to other Product'})
          return
        }

        if(!validator.isValid(description)) {
            res.status(400).send({status: false , message: 'Description is mandatory'})
            return
        }

        if(!validator.isValid2(description)) {
            res.status(400).send({status: false , message: 'Description is not valid string'})
            return
        }

        if(!validator.isValid(price)) {
            res.status(400).send({status: false , message: 'Price is mandatory'})
            return
        }

        

        if(!validator.isValidPrice(price) || typeof parseInt(price) !== 'number') {
            res.status(400).send({status: false , message: 'Price is not valid Number'})
            return
        }

        if(!validator.isValid(currencyId)) {
            res.status(400).send({status: false , message: 'Currency Id is mandatory'})
            return
        }

        if(currencyId !== 'INR') {
            res.status(400).send({status: false , message: 'Currency Id should be INR'})
            return
        }

        if(!validator.isValid(currencyFormat)) {
            res.status(400).send({status: false , message: 'Currency format is mandatory'})
            return
        }

        if(currencyFormat !== '₹') {
            res.status(400).send({status: false , message: 'Currency Symbol should be ₹'})
            return
        }

        console.log(typeof isFreeShipping);
        if((isFreeShipping)  && ( !validator.isValidBoolean(isFreeShipping)) ){
            res.status(400).send({status: false , message: 'free shipping type is not correct'})
            return 
        }

        // Extracting file from request's files and validating and uploading in aws-s3
        let files = req.files
        if(!validator.isValid(files)) {
            res.status(400).send({status: false , message: 'product image file is mandatory'})
            return
        }
        let productImage = ''
        if(files && files.length > 0 ) {
            if (! validator.isValidImage(files[0].originalname)) {
                return res.status(400).send({ status : false , message:"File extension not supported!" });
            } 
            let uploadedFileURL = await uploadFile(files[0])
            productImage = uploadedFileURL
            //res.status(201).send({msg: 'file uploaded succesfully', data: uploadedFileURL})
        }
        else{
            return res.status(400).send({status: false , message: "No file found" })
        }

        if(style && !validator.isValid2(style)) {
            res.status(400).send({status: false , message: 'Style type is not correct'})
            return 
        }


        if(availableSizes && !Array.isArray(availableSizes)){
            return res.status(400).send({ status: false, data: "Sizes is must be an Array" })
        }

        
        if(availableSizes && !validator.isValidSize(availableSizes)) {
            res.status(400).send({status: false , message: `Size Must be of these values ---> "S", "XS","M","X", "L","XXL", "XL" `})
            return
        }

        if(availableSizes) availableSizes = validator.isValidSize(availableSizes);


        if((installments) &&  ! validator.isValidNum(installments) ) {
            res.status(400).send({status: false , message: 'please enter valid installments'})
            return
        }

        let finalData = {

            title,
            description,
            price,
            currencyId,
            currencyFormat,
            productImage: productImage,
            isFreeShipping,
            style,
            availableSizes,
            installments, 
        }

        let productData = await productModel.create(finalData)
        res.status(201).send({ status:true, message: 'Product created successfully', data: productData })


        
    } catch (err) {
        res.status(500).send({status:false , message : err.message}); 
    }

}



// Sort
// Sorted by product price in ascending or descending. The key value pair will look like 
// {priceSort : 1} or {priceSort : -1} eg /products?size=XL&name=Nit%20grit
// Response format
// On success - Return HTTP status 200. Also return the product documents. 
// The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. 
// The response should be a JSON object like this


// GET /products
// Returns all products in the collection that aren't deleted.
// Filters
// Size (The key for this filter will be 'size')
// Product name (The key for this filter will be 'name'). 
// You should return all the products with name containing the substring recieved in this filter
// Price : greater than or less than a specific value. The keys are 'priceGreaterThan' and '
// priceLessThan'.
// NOTE: For price filter request could contain both or any one of the keys.
//  For example the query in the request could look like { priceGreaterThan: 500, priceLessThan: 2000 } 
//  or just { priceLessThan: 1000 } )


const getProduct = async function (req, res) {

    try {

        const requestBody = req.query

        // Object Destructing 
        let { size, 
            name, 
            priceGreaterThan, 
            priceLessThan, 
            priceSort, 
            ...remaining } = requestBody

         // check valid filters or not
         if(validator.isValidRequestBody(remaining)) {
            return res.status(400).send({status: false , message: "size, name, priceGreaterThan, priceLessThan, --> only these filters are allowed"})
        }

        
        let filterQuery =  {}

        if( size) {
            if( size && !validator.isSize(size)) {
                res.status(400).send({status: false , message: `Size Must be of these values ---> "S", "XS","M","X", "L","XXL", "XL" `})
                return
            }
            size = size.toUpperCase()
            filterQuery.availableSizes = {$in : size}
        }
        
        if(name) {
            if( name && !validator.isValid2(name)) {
                res.status(400).send({status: false , message: 'Name is not valid string'})
                return
            }
            filterQuery.title = {$regex: name, $options:'i'}
        }


        if(priceGreaterThan || priceLessThan){
            let filter = {}
            if(priceGreaterThan) {
                if((priceGreaterThan) &&  ! validator.isValidNum(priceGreaterThan) ) {
                    res.status(400).send({status: false , message: 'please enter valid greater than Price....'})
                    return
                }
                filter.$gt  = priceGreaterThan
            }
            
    
            if(priceLessThan) {
                if((priceLessThan) &&  ! validator.isValidNum(priceLessThan) ) {
                    res.status(400).send({status: false , message: 'please enter valid less than Price!!!!'})
                    return
                }
                filter.$lt = priceLessThan
            }
            filterQuery.price = filter

        }
        

        let sortFilter = {}
        sortFilter.price = 1
        
        if(priceSort) {
            if(priceSort && ![ '1' , '-1'].includes(priceSort)) {
                res.status(400).send({status: false , message: 'please enter valid sorting filter '})
                return
            }
            sortFilter.price = parseInt(priceSort)
        }
       
        // Set property called isDeleted to false
        let condition = { isDeleted: false }
        let data = Object.assign(filterQuery, condition)
        console.log(data);

        let allProducts = await productModel.find(data).collation({locale: 'en'}).sort(sortFilter)
        
        if(! allProducts.length){
            return res.status(404).send({status: false , msg:"Product not found"})
        }
        // Send all Products in response
        return res.status(200).send({status: true ,message: 'Product list', data: allProducts})


        
    } catch (err) {
        res.status(500).send({status:false , message : err.message});    
    }
}






        // price = { $gt : priceGreaterThan , $lt: priceLessThan }
        //let filterQuery = {}
        // if(priceGreaterThan || priceLessThan ) {
        //     let filter = {}
        //     if(priceGreaterThan && ! validator.isValidNum(priceGreaterThan) ) {
        //         res.status(400).send({status: false , message: 'please enter valid Price....'})
        //         return
        //     }
        //     filter.$gt  = priceGreaterThan
    
        //     if( ! validator.isValidNum(priceLessThan) ) {
        //         res.status(400).send({status: false , message: 'please enter valid Price!!!!'})
        //         return
        //     }
        //     filter.$lt = priceLessThan
        //     filterQuery.price = filter

        // }
        // filterQuery.availableSizes = {$in : size}
        // filterQuery.title = {$regex: name, $options:'i'}

        // find({ {avaialblesizes: {$in: size} }, 
        //    {title : {$regex: name, $options:'i'}}, 
        //    { $or :[ { price: { $gt : priceGreaterThan , $lt: priceLessThan } ]} 
        //} )

        // { price : priceSort }
        // $gt : priceGreaterThan
        // $lt : priceLessThan


        // availbleSizes : { $in : size}
        // title : { $regex : name, $options : 'i'} 


const getProductById = async (req, res) => {

    try {

        const productId = req.params.productId

        if(!validator.isValidObjectId(productId)) {
            return res.status(400).send({status: false , message :" invalid productId"})
        }
        
        let product = await productModel.findById(productId)
        //console.log(product)

        if(!product || product.isDeleted == true) {
            return res.status(404).send({status: false , message :"Product not found or Already deleted"})
        }
        return res.status(200).send({status:true, message: "Product list", data: product})
        
    } catch (err) {
        res.status(500).send({status:false , message : err.message}); 
    }

}

const deleteProductById = async (req, res) => {
    try {

        const productId = req.params.productId

        if(!validator.isValidObjectId(productId)){
            return res.status(400).send({status: false , message : "invalid productId"})
        }
    
        let product = await productModel.findOne({_id: productId,isDeleted: false})
        if(product == null){
            return res.status(404).send({status: false , message: "Product document does not exist or Already deleted"})   
        }

        let deleteProduct = await productModel.findOneAndUpdate( { _id: productId }, { $set: { isDeleted: true, deletedAt: new Date().toISOString() } }, {new: true , upsert: true} )
        return res.status(200).send({ status:true , message:"Product document deleted successefully"})
        
        
    } catch (err) {
        res.status(500).send({status:false , message : err.message}); 
    }
}

module.exports = { createProduct, getProduct, getProductById, deleteProductById }