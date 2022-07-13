const bookModel = require("../models/booksModel");
const userModel = require("../models/userModel");
const { isValidRequestBody, isValidObjectId, isValidData } = require("./validation")
const validator = require('validator')


const bookvalidation = async function (req, res, next) {
    try {
        let data = req.body;
        
        //validating empty body
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "invalid request params!! please provide details" })

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;
        
        //validating userId is entered is valid
        if (!isValidData(userId))
            return res.status(400).send({ status: false, message: "please enter userId key" })

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "user id is invalid" })
        }

        
        const validUser = await userModel.findById(userId)
        if (!validUser) return res.status(404).send({ status: false, msg: "user not found" })


        //<======Authorizing User=======>
        //check if the logged-in user is requesting to modify their own resources 
        if (userId != req.decodedtoken.userId)
            return res.status(403).send({ status: false, msg: 'Author loggedin is not allowed to modify the requested book data' })
        console.log("Successfully Authorized")


        //<=====Validation=====>        
        //validating title is entered and valid
        if (!isValidData(title))
            return res.status(400).send({ status: false, message: "please enter title key " })
        if (!/^([a-zA-Z 0-9]+)$/.test(title.trim())) {
            return res.status(400).send({ status: false, message: "enter valid title in alphabets only " });
        }

        //validating excerpt is entered and valid
        if (!isValidData(excerpt))
            return res.status(400).send({ status: false, message: "please enter excerpt " })
        if (typeof excerpt!=="string" ||!/^([a-zA-Z_',.()!]+)$/.test(data.excerpt.trim())) {
            return res.status(400).send({ status: false, message: "enter valid excerpt in alphabets only" });
        }

        // //validating userId is entered is valid
        // if (!isValidData(userId))
        //     return res.status(400).send({ status: false, message: "please enter userId key" })
        // if (!isValidObjectId(userId))
        //     return res.status(400).send({ status: false, message: `${userId} is not a valid user ID` })


        //validating ISBN is entered and valid
        if (!isValidData(ISBN))
            return res.status(400).send({ status: false, message: "please enter ISBN key" })
        if (!validator.isISBN(ISBN))
            return res.status(400).send({ status: false, message: `${ISBN} is not a valid ISBN` })



        //Validating category is entered and valid

        if (!isValidData(category))
            return res.status(400).send({ status: false, message: " please enter category " })
        if (!/^([a-zA-Z ]+)$/.test(category.trim())) {
            return res.status(400).send({ status: false, message: " enter valid category in alphabets only" });
        }

        //validating subCategory is entered and valid
        if (typeof subcategory === "undefined" || subcategory === null||!isValidData(subcategory))
            return res.status(400).send({ status: false, message: "please enter subcategory key " })
        if (subcategory.length == 0) {
            return res.status(400).send({ status: false, message: "subcategory is not valid" });
        }


        if (subcategory) {
            if ((typeof subcategory === "string") || (typeof subcategory === "object")) {
                for (let i = 0; i < subcategory.length; i++) {
                    if (subcategory[i].length == 0) {
                        return res.status(400).send({ status: false, message: "subcategory should be proper" });
                    }

                    if (!/^([a-zA-Z ]+)$/.test(subcategory[i])) {
                        return res.status(400).send({ status: false, message: " enter valid subcategory in alphabets only" });
                    }
                }
            } else {
                return res.status(400).send({ status: false, message: " enter valid subcategory in string or [] only" })
            }
        }
        if (!releasedAt) {
            return res.status(400).send({ status: false, message: "releasedAt key is not given" })
        }
        if (releasedAt) {
            if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(data.releasedAt))
                return res.status(400).send({ status: false, message: "date format should be in YYYY-MM-DD" })

        }

        let user_id = await userModel.findById({ _id: userId });
        if (!user_id) {
            return res.status(400).send({ status: false, message: "No such User  exsit" });
        }

        let titles = await bookModel.findOne({ title: title })
        if (titles) return res.status(400).send({ status: false, message: "Book with this title is already present" })

        let checkISBN = await bookModel.find({ ISBN: ISBN });
        if (checkISBN.length !== 0) {
            return res.status(400).send({ status: false, message: "please enter new ISBN" });
        }

        next()
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports = bookvalidation
