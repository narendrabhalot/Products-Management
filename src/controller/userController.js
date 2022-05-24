


const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;


}
const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const userUpdate = async function(req,res){

    const userId = req.params.userId
    let requestBody = req.body 
    let files = req.files
    if(!isValidObjectId(userId)) {
        res.status(400).send({status: false, message: `${userId} is not a valid author id`})
        return
    }

    if(!isValidRequestBody(requestBody)) {
        res.status(400).send({status: false, message: 'Invalid request parameters. Please provide updating keys  details'})
        return
    }


let isUserExist = await userModel.findById(isUserExist)
if(!isUserExist){
    return res.send(404).send({status:false ,msg : "user does not exist"})
}

    

if(userId != req.userId){
    return res.status(403).send({status:false , msg:"you are  not  authorized for update the user document"})
}
// const {fname ,lname , email,phone,password,address} = requestBody


// const updateBookData = {}

// if(isValid(fname)){
//     if (!Object.prototype.hasOwnProperty.call(updateBookData, `$set`))
//         updateBookData['$set'] = {}
//     updateBookData['$set']['fname'] = fname
// }

// if (isValid(lname)) {
//     if (!Object.prototype.hasOwnProperty.call(updateBookData, `$set`))
//         updateBookData['$set'] = {}
//     updateBookData['$set']['lname'] = lname
// }
// if (isValid(email)) {
//     const isISBNAlreadyUsed = await userModels.findOne({ email, _id: { $ne: userId } })
//     if (isISBNAlreadyUsed)
//         return res.status(400).send({ status: false, msg: `${email} ISBN  already exist` })

//     if (!Object.prototype.hasOwnProperty.call(updateBookData, `$set`))
//         updateBookData['$set'] = {}
//     updateBookData['$set']['email'] = email
// }
// if (isValid(files)) {
//     if (!Object.prototype.hasOwnProperty.call(updateBookData, `$set`))
//         updateBookData['$set'] = {}
//     updateBookData['$set']['lname'] = lname
// }
// if (isValid(phone)) {
//     const isISBNAlreadyUsed = await userModels.findOne({ phone, _id: { $ne: userId } })
//     if (isISBNAlreadyUsed)
//         return res.status(400).send({ status: false, msg: `${phone} ISBN  already exist` })

//     if (!Object.prototype.hasOwnProperty.call(updateBookData, `$set`))
//         updateBookData['$set'] = {}
//     updateBookData['$set']['phone'] = phone
// }
// if (isValid(password)) {
//     const isISBNAlreadyUsed = await userModels.findOne({ password, _id: { $ne: userId } })
//     if (isISBNAlreadyUsed)
//         return res.status(400).send({ status: false, msg: `${password} ISBN  already exist` })

//     if (!Object.prototype.hasOwnProperty.call(updateBookData, `$set`))
//         updateBookData['$set'] = {}
//     updateBookData['$set']['password'] = password
// }










let updateuser = await userModel.findOneAndUpadate({_id:userId},requestBody,{new:true})


return res.status(200).send({status:true ,message:"user profile updated" , data:updateuser })




}