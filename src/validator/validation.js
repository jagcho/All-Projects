const mongoose = require("mongoose");

//checks if the request body is not empty
//used in 6 APIs
const isValidRequestBody =  function (requestBody) {
    if (Object.keys(requestBody).length == 0) return false;
    return true 
}
// const RequestBody =  function (req,res,next) {
//     if (Object.keys(req.body).length == 0) return res.status(400).send({status:false,message:"body cannot be empty"})
//     next()
// }   //applicable only on create and update Book 

//checks parameters present in body and is string for specific parameters.
const isValidData = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length==0) return false;
     return true;
}
//checks if Object id has valid format
const isValidObjectId = function (objectId) {
    if (mongoose.Types.ObjectId.isValid(objectId)) return true;
    return false;
}

module.exports = {
    isValidRequestBody, isValidData, isValidObjectId
}
