const { response } = require("express");
const express = require("express");
const router = express.Router();
//const multer =require("multer");
//const path=require("path");
const sql = require('../models/mssqlcon');
const mail = require('../models/mails');

router.post("/setDashboard", async (req,res)=>{
    try{
        var name = "";
        var profile = "assets/images/defaults/user.jpg";
        var data = await sql.query("select name from tbAdmin where Phone = '"+req.body.username+"'");
        if(data.length>0){
            name = data[0].name;
        }
        res.json({name: name,profile:profile});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.get("/getSectorPresidentRecords/:secId",async(req,res)=>{
    try{
        var data = await sql.query("select cId,Name as name,Email as email,Status as status,DATE_FORMAT(Date, '%Y-%m-%d') as date from tbController where Position = '1' and secId='" + req.params.secId + "' order by Status desc,Date,Name");
        res.json({result:data});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.get("/getRequestInfo/:cId",async(req,res)=>{
    try{
        var found = false;
        var data = await sql.query("select A.Name as name,A.Phone as phone,A.Email as email,(select secInfo from tbSectors where secId = A.secId) as sector ,A.Status as status,DATE_FORMAT(A.date, '%Y-%m-%d') as date,A.aadharFront as front,A.aadharBack as back from tbController A where A.cId='" + req.params.cId+"'");
        if(data.length>0){
            found=true;
        }
        if(found){
            res.json({
                ...data[0],
                found : found
            });
        }
        else{
            res.json({found:found});
        }    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
      
})

router.post("/deAllotPresident/:cId",async (req,res)=>{
    try{
        var done = false;
        var tbController = "update tbController set Status = '0' where cId = '"+req.params.cId+"'";
        var tbOwner = "update tbOwner set prStatus = '2' where Email = (select Email from tbController where cId = '" + req.params.cId + "')";
        var getEmail = "Select Name,Email from tbController where cId = '" + req.params.cId + "'";
        var data = await sql.query(tbController + ";" + tbOwner + ";" + getEmail);
        if(data.length>0){
            done = true;
            var name = data[0].Name;
            var params = {
                email:data[0].Email,
                subject:"No More President",
                text: "Hey, Mr." + name + " You are no more President of your Society"
            }
            mail.send(params);
        }
        res.json({done:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
          
})

router.post("/allotPresident/:cId", async (req,res)=>{
    try{
        var done = false;
        var previousPresident = "select cId,Name,Email from tbController where secId = (select secId from tbController where cId = '" + req.params.cId + "') and Position = '1' and Status = '1'";
        var previousEmail = "";
        var previouscId = "";
        var mailto = "";
        
        var data = await sql.query(previousPresident);
        if(data.length>0){
            var name = data[0].Name;
            mailto = data[0].Email;
        var params = {
                email:data[0].Email,
                subject:"No More President",
                text: "Hey, Mr." + name + " You are no more President of your Society"
            }
            mail.send(params);
            previouscId = data[0].cId;
            previousEmail = mailto;
        }

        var resettbController = "update tbController set Status = '0' where cId = '" + previouscId + "'";
        var resettbOwner = "update tbOwner set prStatus = '2' where Email = '" + previousEmail + "'";
        var tbController = "update tbController set Status = '1' where cId = '" + req.params.cId + "'";
        var tbOwner = "update tbOwner set prStatus = '1' where Email = (select Email from tbController where cId = '" + req.params.cId + "')";
        var getEmail = "Select Name,Email from tbController where cId = '" + req.params.cId + "'";

        data = await sql.query( resettbController + ";" + resettbOwner + ";" + tbController + ";" + tbOwner + ";" + getEmail);
        if(data.length>0){
            done=true;
            var name = data[0].Name;
            var params = {
                email:data[0].Email,
                subject:"Alloted as President",
                text: "Congrats, Mr." + name + " You are Now the President of your Society"
            }
            mail.send(params);
            
        }
        res.json({done:done});   
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
     
})

router.post("/dismissedPresident/:cId/:data",async (req,res)=>{
    try{
        var done = false;
        var tbController = "delete from tbController where cId = '" + req.params.cId + "'";
        var tbOwner = "update tbOwner set prStatus = '0' where Email = (select Email from tbController where cId = '" + req.params.cId + "')";
        var getEmail = "Select Name,Email from tbController where cId = '" + req.params.cId + "'";
        var data = await sql.query(getEmail  + ";" + tbOwner + ";" + tbController);
        if(data.length>0){
            done = true;
            var params = {
                email:data[0].Email,
                subject:"President Request Dismissed",
                text: req.params.data
            }
            mail.send(params);
        }
        res.json({done:done});     
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
        
})

module.exports = router;