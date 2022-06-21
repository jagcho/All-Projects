const express = require('express');
const router = express.Router();
const AuthorController= require("../controllers/authorController")
const BlogController= require("../controllers/blogController")

router.post('/authors',AuthorController.createAuthor)
router.post('/blogs',BlogController.createBlog)



module.exports = router;
