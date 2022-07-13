const { isValidRequestBody, isValidObjectId, isValidData } = require("./validation")


const ratingCheck = function (value) {

   num = /^[1-5]{1}$/

   if (!num.test(value)) return false

   return true
}


const reviewCheck = function (req, res, next) {

   let requestBody = req.body

   const bookId = req.params.bookId

   if (!isValidRequestBody(requestBody))

      return res.status(400).send({ status: false, message: "please give review and details" })

   //============================bookId validation==========================================//
   if (!isValidObjectId(bookId)) {

      return res.status(400).send({ status: false, message: "not a valid bookId" })
   }

   let { reviewedBy, rating, review, reviewedAt, isDeleted } = requestBody

   // =========check wheather mandatory  fields are present or not=======================//

   let missdata = ""

   // if (!bookId) {
   //    missdata = missdata + "bookId"
   // }
   // if (!reviewedAt) {
   //     missdata = missdata + " " + "reviewedAt"
   //  }
   // let bookID = bookId.trim()

   // if (bookID.length == 0) {

   //    missdata = missdata + "bookId"
   // }

   if (!rating) {

      missdata = missdata + " " + "rating"
   }


   if (missdata) {

      let message = missdata + " " + "is missing"

      return res.status(400).send({ status: false, message: message })
   }
   // =================rating validation===============================//
   if (typeof rating != "number" )

      return res.status(400).send({ status: false, message: "rating is not in a proper format" })

   if(!ratingCheck(rating))   
       
      return res.status(400).send({status:false,message:"rating should be between 1 & 5"})
   //==================reviewat validation===========================//
   if (reviewedAt) {
      
      if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(reviewedAt))

          return res.status(400).send({ status: false, message: "date format should be in YYYY-MM-DD" })
   }
          


   // ==============================reviewBy validation========================================//

   if (reviewedBy) {
      if (typeof reviewedBy !=='string') return res.status(400).send({status:false,message:"give  reviewedBy in string only"})

      if (!isValidData(reviewedBy))

         return res.status(400).send({ status: false, message: "give proper name as reviewedBy" })

   }
      // ===========================review validation=============================================//
      if (review) {
         if (typeof review !=='string')  return res.status(400).send({status:false,message:"give  review in string only"})
         if (!isValidData(review))  return res.status(400).send({ status: false, message: "please give review properly" })
      }


   if (isDeleted) {

      if (typeof isDeleted !== "boolean") {

         return res.status(400).send({ status: false, message: "isDeleted should be true or false" })
      }

   }


   next()
}

module.exports = { reviewCheck }