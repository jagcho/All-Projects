const internModel= require("../models/internModel")
const collegeModel=require('../models/collegeModel')
// Creating Intern Document
const createIntern= async function(req,res){
    try{

        let data=req.body;
        
        let college= await collegeModel.findOne({name:data.collegeName, isDeleted:false}).select({_id:1})

        if(!college)return res.status(404).send({status:false,msg:`No college name found with ${data.collegeName}`})

        data.collegeId=college._id

        delete data.collegeName

        let savedData=await internModel.create(data)

        res.status(201).send({status:true, data: savedData})

    }catch(error){

        res.status(500).send({status:false,msg:error.message})
    }
}

module.exports={createIntern}