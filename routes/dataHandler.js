const { response } = require("express");
const express = require("express");
const router = express.Router();
const path=require("path");
const fs =require("fs");
const sql = require('../models/mssqlcon');
const mail = require('../models/mails');
const upload = require('../models/upload');
const bcrypt = require('bcrypt')
const {authenticateToken} = require('../models/auth');

var auth = [
    "/insertDataHandler",
    "/saveDataHandler",
    "/deleteDataHandler/:cId",
    "/getDHInfo/:cId",
    "/setDashboard",
    "/updateProfileImage",
    "/getProfile",
    "/setProfile",
    "/getMeterInfo/:meterNo",
    "/generateBill"
];
router.use(auth,authenticateToken);


router.post("/checkAccount/:email",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbController where email = '" + req.params.email + "'");
        if(data[0].matchf!=0){
            found = true;
        }
        res.json({match:found});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/insertDataHandler", async (req,res)=>{
    try{
        var done = false;
        req.body.profile = "assets/images/defaults/user.jpg";
        req.body.profile = req.body.profile.replace(/\\/g, "\\\\");
        req.body.password = await bcrypt.hash(req.body.password, 10);

        var insertdataHandlerQuery = "Insert into tbController values(NULL,(select secId from tbController where username = '" + req.body.aadharFront + "'),'" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','" + req.body.username + "','" + req.body.password + "','2','2','','','" + req.body.profile + "','" + req.body.date + "','')";
        var insertUser = "Insert into tbUsers values(NULL,'" + req.body.username + "','3')";
        var updateOnwerPrStatus = "Update tbOwner set prStatus = '3' where Email = '" + req.body.email + "'";//so that this do not able to apply for president i think
        var insertBGInfo = "insert into tbBloodGroupInfo values(NULL,'"+req.body.name+ "','" + req.body.age + "','" + req.body.date + "','" + req.body.name + "','" + req.body.phone+"','"+req.body.email+"','','"+req.body.username+"','1')";
        var data = await sql.query(insertdataHandlerQuery + ";" + updateOnwerPrStatus + ";" + insertUser + ";" + insertBGInfo);
        if(data.affectedRows>0){
            done = true;
        }
        res.json({done:done});   
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/saveDataHandler",async(req,res)=>{
    try{
        var done = false;
        req.body.password = await bcrypt.hash(req.body.password, 10);
        var data = await sql.query("update tbController set Name = '" + req.body.name + "',Phone =  '" + req.body.phone + "',Email = '" + req.body.email + "',username = '" + req.body.username + "',Password = '" + req.body.password + "' where cId = '"+req.body.cId+"'");
        if(data.affectedRows>0){
            done = true;
        }
        res.json({done:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/deleteDataHandler/:cId",async(req,res)=>{
    try{
        var done = false;
        var deletedataHandlerQuery = "delete from tbController where cId = '" + req.params.cId + "'";
        var deleteusernameQuery = "delete from tbUsers where username = (select username from tbController where cId = '"+req.params.cId+"')";
        
        var data = await sql.query(deleteusernameQuery + ";" + deletedataHandlerQuery);
        if(data.affectedRows>0){
            done = true;
        }
        res.json({done:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.get("/getDHInfo/:cId",async(req,res)=>{
    try{
        var found = false;
        var data = await sql.query("select A.Name as name,A.Phone as phone,A.Email as email,A.username,A.Password as password,A.Status as status,DATE_FORMAT(A.Date, '%Y-%m-%d') as date,A.profile from tbController A where A.cId='" + req.params.cId + "'");
        if(data.length>0){
            found = true;
            res.json({found:found,...data[0]});
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

router.post("/setDashboard",async (req,res)=>{
    try{
        var data = await sql.query("select A.Name as name,A.profile,(select secInfo from tbSectors where secId = A.secId) as sector from tbController A where A.username = '" + req.body.username + "' and Position = '2'");
        if(data.length>0){
            res.json({...data[0]});
        }
        else{
            res.json({name:"",profile:"",sector:""})
        }    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/updateProfileImage",upload.profile.single('profile'),(req,res)=>{
    var path = req.file.path;
    res.json({path:path});
})

router.post("/getProfile",async(req,res)=>{
    try{
        var found = false;
        var data = await sql.query("select Name as name,Phone as phone,Email as email,username,profile,DATE_FORMAT(Date, '%Y-%m-%d') as date,bloodGroup,(select DATE_FORMAT(dateModified, '%Y-%m-%d') from tbBloodGroupInfo where username = '" + req.body.username+ "' and auth = '1') as dateModified,(select age from tbBloodGroupInfo where username = '" + req.body.username + "' and auth = '1') as age from tbController where username = '" + req.body.username + "'");
        if(data.length>0){
            found = true;
            res.json({data:found,...data[0]});
        }
        else{
            res.json({data:found});
        }    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/setProfile",async(req,res)=>{ //to verify
    try{
        var done = false;
        var insertBGInfo = "";
        var updateBGinfo = "update tbBloodGroupInfo set mainName='"+req.body.name+ "',age='" + req.body.age + "',dateModified='" + req.body.date + "',name = '" + req.body.name + "',phone = '" + req.body.phone + "',bloodGroup = '" + req.body.bloodGroup + "'  where username = '" + req.body.username + "' and auth = '1'";
        var data = await sql.query(updateBGinfo);
        if(data.affectedRows==0){
            insertBGInfo = "insert into tbBloodGroupInfo values(NULL,'" + req.body.name + "','" + req.body.age + "','" + req.body.date + "','" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','" + req.body.bloodGroup + "','" + req.body.username + "','1')";
        }

        if(req.body.profile==""){
            var data = await sql.query("update tbController set Name = '" + req.body.name + "',Phone = '" + req.body.phone + "',bloodGroup = '"+req.body.bloodGroup+"'  where username = '" + req.body.username + "';" + insertBGInfo);
            if(data.affectedRows>0){
                done = true;
            }
        }
        else{
            req.body.profile = req.body.profile.replace(/\\/g, "\\\\");
            var data = await sql.query("select profile from tbController where username = '" + req.body.username + "';update tbController set Name = '" + req.body.name + "',Phone = '" + req.body.phone + "',profile = '"+req.body.profile+ "',bloodGroup = '" + req.body.bloodGroup + "'  where username = '" + req.body.username + "';" + insertBGInfo);
            if(data.length>0){
                done = true;
                var previous = String(data[0].profile);
                var defaultPath = "assets/images/defaults/user.jpg";
                var defaultPath2 = defaultPath.replace(/\\/g, "\\\\");;
                if(previous!=defaultPath && previous!=defaultPath2){
                    var filePath = "./" + previous;
                    fs.exists(filePath, function(exists) {
                        if(exists) {
                            fs.unlinkSync(filePath);
                        } 
                    });
                }
            }
        }
        
        res.json({done:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.get("/getMeterInfo/:meterNo",async(req,res)=>{
    try{
        var found = false;
        var data = await sql.query("select A.meterId,A.meterNo,A.type,A.Reading as pReading,DATE_FORMAT(A.Date, '%Y-%m-%d') as date,A.statusConfirmed as status from tbMeter A where A.meterNo='" + req.params.meterNo + "'");
        if(data.length>0){
            found = true;
            res.json({found:found,...data[0]});
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

router.post("/generateBill",async(req,res)=>{
    try{
        //here we are taking the username of the president in the recordaadharFront so that we can set the secId in datahandler record
        var done = false;
        var insertMeterRecord = "insert into tbMeterRecords values(NULL,'" + req.body.meterNo + "','" + req.body.pReading + "','" + req.body.Reading + "',(select date from tbMeter where meterNo = '" + req.body.meterNo + "'),'"+req.body.dateTo+"','"+req.body.dueDate+"','0','0','0','0')";
        var updatetbMeter = "update tbMeter set Reading = '" + req.body.Reading + "',date = '"+req.body.dateTo+"',statusConfirmed = '1' where meterNo = '"+req.body.meterNo+"'";

        //sending mail notification done later
        var data = await sql.query(insertMeterRecord + ";" + updatetbMeter);
        if(data.affectedRows>0){
            done = true;
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