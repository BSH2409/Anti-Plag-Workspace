const { response } = require("express");
const express = require("express");
const router = express.Router();
//const multer =require("multer");
const path=require("path");
const sql = require('../models/mssqlcon');
const mail = require('../models/mails');
const upload = require('../models/upload');
const { domainToASCII } = require("url");
const mongo = require("./mongo");
const { request } = require("http");
const bcrypt = require('bcrypt')
const {authenticateToken} = require('../models/auth');

var auth = [
    "/message",
    "/deleteAccount",
    "/setPropertyStatus"
];
router.use(auth,authenticateToken);


router.post("/checkAccount/:email",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbNewUser where email = '" + req.params.email + "'");
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
router.get("/getLocations",async (req,res)=>{
    try{
        var data = await sql.query("select secId as id,secInfo as name,src from tbSectors");
        res.json({result:data});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})

router.post("/insertNewUser", async (req,res)=>{
    try{
        
        req.body.password = await bcrypt.hash(req.body.password, 10);
        var insertquery = "Insert into tbNewUser values(NULL,'" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','" + req.body.username + "','" + req.body.password + "','0')";
        var insertUser = "Insert into tbUsers values(NULL,'" + req.body.username + "','6')";
        var updatetbOTP = "update tbOTP set verified = '1',registered = '1' where email = '" + req.body.email + "'";
        
        var data = await sql.query(insertquery + ";" + insertUser + ";" + updatetbOTP);
        var done = parseInt(data.affectedRows);
        res.json({insert:done});   
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/getFlatsList",async (req,res)=>{
    try{
        var filter = req.body;
        //console.log(filter);
        var data = await mongo.getFlats(filter);
        //console.log(data);
        //res.end();
        res.json({data:data});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})

router.post("/getSimilarProperties",async (req,res)=>{
    try{
        var filter = req.body;
        //console.log(filter);
        var data = await mongo.getSP(filter);
        //console.log(data);
        //res.end();
        res.json({data:data});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})

router.get("/getFlatDetails/:id",async (req,res)=>{
    try{
        var _id = req.params.id;
        //console.log(filter);
        var data = await mongo.getFlatDetails(_id);
        //console.log(data);
        var details = {...data[0]._doc};
        var pic = await sql.query("select profileImg from tbOwner where ownId = (select ownId from tbFloor where fId = '"+data[0].fId+"')");
        if(pic.length>0){
            //console.log(pic);
            details.owner =  pic[0].profileImg;
        }

        //console.log(details);
        //res.end();
        res.json({data:details});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})

router.get("/getFlatOtherImages/:fId",async (req,res)=>{
    try{
        
        var data = await sql.query("select path from tbOtherImages where fId = '"+req.params.fId+"'");
        if(data.length>0){
            //console.log(data);
            //console.log(pic);
            res.json({data:data});
        }
        else{
            res.json({data:[]});
        }
        //console.log(details);
        //res.end();
        
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})

router.post("/message",async (req,res)=>{
    try{
        var data = await sql.query("select name,phone,email from tbNewUser where username = '" + req.body.username + "'");
        var obj = {};
        if(data.length>0){
            obj.name=data[0].name;
            obj.phone=data[0].phone;
            obj.email=data[0].email;
            var params = {
                email:req.body.email,
                subject: "Message from " + obj.name + '- ' + req.body.subject,
                text : `Hi ${req.body.name},\n ${obj.name}, ${obj.phone}, ${obj.email} leaves a message regarding your flat : ${req.body.location}\n\n Message : \n ${req.body.message}`
            }
            mail.send(params);
        }
        
        res.json({done:true});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/deleteAccount", async (req,res)=>{
    try{
        var done=false;
        var deleteUser = "delete from tbNewUser where uId = '"+req.body.uId+"'"
        var deleteUsername = "delete from tbUsers where username = '"+req.body.username+"'";

        //var deleteBGInfo = "delete from tbBloodGroupInfo where username = '"+req.body.username+"'"
        
        var data = await sql.query(deleteUsername + ";" + deleteOwner);
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

router.post("/setPropertyStatus",async (req,res)=>{
    try{
        //console.log(req.body);
        var done=false;
        var uId = req.body.uId;
        var data = "";
        if(uId==""){
            data = await sql.query("select acctype from tbUsers where username = '"+req.body.username+"'");
            uId = parseInt(data[0].acctype);
        }

        if(uId == "6"){
            
            if(req.body.status == "rent"){
                req.body.profile = "assets/images/defaults/user.jpg";
                var insertTenant = "insert into tbTenant values(NULL,(select name from tbNewUser where username = '"+req.body.username+"'),(select phone from tbNewUser where username = '"+req.body.username+"'),(select email from tbNewUser where username = '"+req.body.username+"'),'" + req.body.username + "','" + req.body.password + "','" + req.body.profile + "','"+req.body.fId+"','" + req.body.date + "','1','1','0','')";
                var updateUser = "Update tbUsers set acctype = '5' where username = '"+req.body.username+"'";
                var insertBGInfo = "insert into tbBloodGroupInfo values(NULL,(select name from tbNewUser where username = '"+req.body.username+"'),'','" + req.body.date + "',(select name from tbNewUser where username = '"+req.body.username+"'),(select phone from tbNewUser where username = '"+req.body.username+"'),(select email from tbNewUser where username = '"+req.body.username+"'),'','" + req.body.username + "','1')";
                var deleteUser = "delete from tbNewUser where username = '"+req.body.username+"'";
                var meterReadings = "select (select eReading from tbFloor where fId = '"+req.body.fId+"') e,(select wReading from tbFloor where fId = '"+req.body.fId+"') w,(select top 1 Reading from tbMeterRecords where meterNo = (select EMeter from tbFloor where fId = '"+req.body.fId+"') order by recId desc) me,(select top 1 Reading from tbMeterRecords where meterNo = (select WMeter from tbFloor where fId = '"+req.body.fId+"') order by recId desc) mw"
                var data = await sql.query(insertTenant + ";" + updateUser +  ";" + insertBGInfo + ";" + deleteUser + ";" + meterReadings);
                var reading = {
                    e:0,w:0
                }
                if(data.length>0){
                    var obj = {
                        e:data[0].e,
                        w:data[0].w,
                        me:data[0].me,
                        mw:data[0].mw
                    }
                    if(obj.e==""){obj.e=0}
                    if(obj.w==""){obj.w=0}
                    if(obj.me==""){obj.me=0}
                    if(obj.mw==""){obj.mw=0}
                    reading.e = Math.max(obj.e,obj.me);
                    reading.w = Math.max(obj.w,obj.mw);
                }

                var tbFloor = "update tbFloor set eReading = '"+reading.e+"',wReading = '"+reading.w+"',rvStatus='0' where fId='"+req.body.fId+"'";
                var tbRentRecord = "Insert into tbRentRecords values(NULL,(select tId from tbTenant where username = '"+req.body.username+"'),'"+req.body.fId+"','"+req.body.date+"','"+req.body.todate+"',(select Rent from tbFloor where fId = '"+req.body.fId+"'),'1')";
        
                
                data = await sql.query(tbFloor + ";" + tbRentRecord);
                if(data.affectedRows>0){
                    done = true;
                    var set = await mongo.setNotAvailable(req.body.fId);//available : false in mongo
                }
                
            }
            
            else if(req.body.status == "buy"){
                req.body.profile = "assets/images/defaults/user.jpg";
                var insertOwner = "Insert into tbOwner values(NULL,(select name from tbNewUser where username = '"+req.body.username+"'),(select phone from tbNewUser where username = '"+req.body.username+"'),(select email from tbNewUser where username = '"+req.body.username+"'),'"+req.body.username+"','" + req.body.password + "','" + req.body.secId + "','','1','" + req.body.profile + "','" + req.body.date + "','0','')";
                var updateUser = "Update tbUsers set acctype = '4' where username = '"+req.body.username+"'";
                var insertBGInfo = "insert into tbBloodGroupInfo values(NULL,(select name from tbNewUser where username = '"+req.body.username+"'),'','" + req.body.date + "',(select name from tbNewUser where username = '"+req.body.username+"'),(select phone from tbNewUser where username = '"+req.body.username+"'),(select email from tbNewUser where username = '"+req.body.username+"'),'','" + req.body.username + "','1')";
                var deleteUser = "delete from tbNewUser where username = '"+req.body.username+"'";
                var setOwner = "update tbFloor set ownId=(select ownId from tbOwner where username = '"+req.body.username+"') where fId = '"+req.body.fId+"'";
                var details = "select Name,Phone,Email from tbOwner where username = '"+req.body.username+"'";
                var data = await sql.query(insertOwner + ";" + updateUser + ";" + insertBGInfo + ";" + deleteUser + ";" + setOwner + ";" + details);
                if(data.length>0){
                    done = true;
                    var obj = {
                        fId : req.body.fId,
                        name : data[0].Name,
                        phone : data[0].Phone,
                        email : data[0].Email
                    }
                    var set = await mongo.setNotAvailablePersonal(obj);
                }
                //available : false in mongo to do + status ?? buy/both to what personal/rent/buy/both and again if he wants to put it on rent/buy what??
                
            }
        }
        else if(uId=="5" && req.body.status == "rent"){
            var tbTenant = "update tbTenant set fId = '"+req.body.fId+"',date = '"+req.body.date+"',tenantStatus = '1' where username = '"+req.body.username+"'";
            var meterReadings = "select (select eReading from tbFloor where fId = '"+req.body.fId+"') e,(select wReading from tbFloor where fId = '"+req.body.fId+"') w,(select top 1 Reading from tbMeterRecords where meterNo = (select EMeter from tbFloor where fId = '"+req.body.fId+"') order by recId desc) me,(select top 1 Reading from tbMeterRecords where meterNo = (select WMeter from tbFloor where fId = '"+req.body.fId+"') order by recId desc) mw"
            var data = await sql.query(tbTenant + ";" + meterReadings);
            var reading = {
                e:0,w:0
            }
            
            if(data.length>0){
                var obj = {
                    e:data[0].e,
                    w:data[0].w,
                    me:data[0].me,
                    mw:data[0].mw
                }
                if(obj.e==""){obj.e=0}
                if(obj.w==""){obj.w=0}
                if(obj.me==""){obj.me=0}
                if(obj.mw==""){obj.mw=0}
                reading.e = Math.max(obj.e,obj.me);
                reading.w = Math.max(obj.w,obj.mw);
            }
            //console.log(reading);
            //console.log(obj);
            var tbFloor = "update tbFloor set eReading = '"+reading.e+"',wReading = '"+reading.w+"',rvStatus='0' where fId='"+req.body.fId+"'";
            var tbRentRecord = "Insert into tbRentRecords values(NULL,(select tId from tbTenant where username = '"+req.body.username+"'),'"+req.body.fId+"','"+req.body.date+"','"+req.body.todate+"',(select Rent from tbFloor where fId = '"+req.body.fId+"'),'1')";
    
            
            data = await sql.query(tbFloor + ";" + tbRentRecord);
            if(data.affectedRows>0){
                done = true;
                var set = await mongo.setNotAvailable(req.body.fId);//available : false in mongo
            }
            
        }
        else if(uId =="4" && req.body.status== "buy"){
            var setOwner = "update tbFloor set ownId=(select ownId from tbOwner where username = '"+req.body.username+"') where fId = '"+req.body.fId+"'";
            var details = "select Name,Phone,Email from tbOwner where username = '"+req.body.username+"'";
            var data = await sql.query(setOwner + ";" + details);
            if(data.length>0){
                done = true;
                var obj = {
                    fId : req.body.fId,
                    name : data[0].Name,
                    phone : data[0].Phone,
                    email : data[0].Email
                }
                var set = await mongo.setNotAvailablePersonal(obj);
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

module.exports = router;