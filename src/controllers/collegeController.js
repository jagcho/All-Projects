const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");

//create college API
const createCollege = async function (req, res) {
  try {
    let data = req.body;
    let savedData = await collegeModel.create(data);
    res.status(201).send({ status: true, data: savedData });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};
//get college details
const getCollege = async function (req, res) {
  try {
    let collegeName = req.query.collegeName
    //validation start
    if (!collegeName) return res.status(400).send({ status: false, msg: `Please enter collegeName in query` })

    collegeName=collegeName.toLowerCase()

    let thisCollege = await collegeModel.findOne({ name: collegeName, isDeleted: false }).select({ name: 1, fullName: 1, logoLink: 1});

    if (!thisCollege) return res.status(404).send({ status: false, msg: `No colleges with name ${collegeName} found ` })

    let internsofCollege = await internModel.find({ isDeleted: false, collegeId: thisCollege._id }).select({ name: 1, email: 1, mobile: 1 });
    let interns = []; 
    if (internsofCollege.length == 0)// return res.status(404).send({ status: false, msg: `No interns found under college name ${collegeName}` })
     interns = `No interns found under college name ${collegeName}`
    
    for (let i = 0; i < internsofCollege.length; i++) {
      interns.push(internsofCollege[i]);
    }
    thisCollege._doc.interns = interns;
    delete thisCollege._doc._id;
    
    res.status(200).send({ status: true, data: thisCollege });

  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createCollege, getCollege };
