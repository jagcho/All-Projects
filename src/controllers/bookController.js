const bookModel = require("../models/booksModel")
const reviewModel = require("../models/reviewModel")
const { isValidRequestBody, isValidObjectId, isValidData } = require("../validator/validation")
const validator = require('validator')

const createBook = async function (req, res) {
    try {
        const data = req.body;
        data.title = data.title.trim().split(" ").filter(word => word).join(" ");
        data.excerpt = data.excerpt.trim().split(" ").filter(word => word).join(" ");
        data.reviews = 0

        data.isDeleted = false

        const createbooks = await bookModel.create(data)
        res.status(201).send({
            status: true, message: 'Success', data: createbooks
        });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


const getBookbyQuerry = async function (req, res) {
    try {

        let requestData = req.query
        
        const { category, subcategory, userId } = requestData
        
        // console.log(requestData)
        //<-----------------------taking filter for searching------------------>//
        const filter = {}

        filter.isDeleted = false
        //<---------------check catergory present and (if)proper format or not----------------->//
        
        
        if (category) {
           
            filter.category = category

        }

        //<---------------check subcatergory present and (if)proper format or not--------------->//
        if (subcategory) {
            filter.subcategory = subcategory

        }
        //<---------------check userId present and (if)proper format or not----------------->//
        if (userId) {
            if (!isValidObjectId(userId))
                return res.status(400).send({ status: false, message: "please give proper userId" })

            else filter.userId = userId

        }
        // console.log(filter)
        //<------------------------------searching book--------------------------->//
        let allBook = await bookModel.find(filter)
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
            .sort({ title: 1 })

        if (allBook.length == 0)
            return res.status(404).send({ status: false, message: "book not found" })

        res.status(200).send({ status: true, message: 'Books list', data: allBook })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

// <===================================== Get /books/:bookId =====================================>

const bookDetail = async function (req, res) {
    try {
        const bookId = req.params.bookId;

        //<-----------------validating bookid----------------------->

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: " enter valid bookId" });
        }

        //<---------------finding book with bookid----------------->
        const details = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ ISBN: 0, __v: 0 });

        //console.log({...details});//<----check destructered output of moongodb call----->

        if (!details) {
            return res.status(404).send({ status: false, message: "book not found" });
        }

        //<---------------finding reviews with bookid given in params--------------------->
        const reviews = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 });


        //<-------creating a key in doc to get response according to ReadME file---------->
        details._doc.reviewsData = reviews


        res.status(200).send({ status: true, message: 'Books list', data: details })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

// <===================================== PUT /books/:bookId =====================================>
const updateBook = async function (req, res) {
    try {
        let data = req.body;
        const bookId = req.params.bookId;

        //validating empty body
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Body cannot be empty" });


        //validating bookId
        if (!isValidData(bookId))
            return res.status(400).send({ status: false, message: "please enter userId " })

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Book id is invalid" })
        }
        const validBook = await  bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!validBook)
            return res.status(404).send({ status: false, msg: "No such Book Exits" })
        
        

        //check if the logged-in user is requesting to modify their own resources 
        if (validBook.userId != req.decodedtoken.userId)
            return res.status(403).send({ status: false, msg: 'Author loggedin is not allowed to modify the requested book data' })
        console.log("Successfully Authorized")


        const { title, excerpt, ISBN, releasedAt } = data;

        var details = {}

        //Validating title and  check Present in DB or Not
        if (title) {
            if (!/^([a-zA-Z 0-9 ]+)$/.test(title.trim())) {
                return res.status(400).send({ status: false, msg: `${title} is not a valid title` });
            }
            let titleCall = await bookModel.findOne({ title: title.trim().split(" ").filter(word => word).join(" ") });

            if (titleCall)
                return res.status(400).send({ status: false, msg: `Book with name ${title}  is Already Present` });

            details.title = title.trim().split(" ").filter(word => word).join(" ");
        }

        //validating excerpt is entered and valid
        if (excerpt) {
            if (!/^([a-zA-Z\S 0-9 ]+)$/.test(excerpt)) {
                return res.status(400).send({ status: false, msg: `${excerpt} is not a valid excerpt` });
            }
            details.excerpt = excerpt.trim().split(" ").filter(word => word).join(" ");
        }

        // validating ISBN is and check Present in DB or Not
        if (ISBN) {
            if (!validator.isISBN(ISBN)) {
                return res.status(400).send({ status: false, msg: `${ISBN} is not a valid ISBN Please add Valid ISBN ` })
            }

            let ISBNCall = await bookModel.findOne({ ISBN: ISBN });

            if (ISBNCall)
                return res.status(400).send({ status: false, msg: `Book with ISBN  ${ISBN}  is Already Present` });
            details.ISBN = ISBN
        }

        //Date is in Valid Format Or Not
        if (releasedAt) {
            if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt))
                return res.status(400).send({ status: false, msg: "date format should be in YYYY-MM-DD" });
            details.date = releasedAt;
        }

        //updateBook
        let updatedata = await bookModel.findOneAndUpdate({ _id:bookId }, details, { new: true }).select({ __v: 0 });

        res.status(200).send({ status: true, message: 'Success', data: updatedata });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};

//================================================Delete by path params==================================//
const deleteBookbyPath = async function (req, res) {
    try {
        const bookId = req.params.bookId;

        //validating bookId
        if (!isValidData(bookId))
            return res.status(400).send({ status: false, message: "please enter userId " })

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Book id is invalid" })
        }
        const validBook = await  bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!validBook)
            return res.status(404).send({ status: false, msg: "No such Book Exits" })
        
        
       

        //check if the logged-in user is requesting to modify their own resources 
        if (validBook.userId != req.decodedtoken.userId)
            return res.status(403).send({ status: false, msg: 'Author loggedin is not allowed to modify the requested book data' })
        console.log("Successfully Authorized")
        //<-------------------------find book by book Id---------------------->//
        let book = await bookModel.findById({ _id: bookId })//.select({ _id: 0, userId: 1, isDeleted: 1 })

        if (book.isDeleted == true)
            return res.status(404).send({ status: false, message: "cannot delete, deleted book " })

        //<-----------------------------deleting book------------------------->//
        let bookData = await bookModel.findByIdAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: new Date() }, { new: true })

        // let deletereview =await reviewModel.find({bookId:bookId}).updateMany({isDeleted:true})



        res.status(200).send({ status: true, message: "book is deleted Successfully"})
    }
    catch (error) { res.status(500).send({ status: false, message: error.message }) }

}




module.exports = { getBookbyQuerry, createBook, bookDetail, updateBook, deleteBookbyPath }
