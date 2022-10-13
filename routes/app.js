require('dotenv').config();
const { response } = require("express");
const express = require("express");
const router = express.Router();
//const multer =require("multer");
//const path=require("path");
const sql = require('../models/mssqlcon');
const mail = require('../models/mails');
const randomstring = require("randomstring");
const { parse } = require("path");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {authenticateToken} = require('../models/auth');

// router.get("/test",async (req,res)=>{
//     try{
//         var done = false;
//         var data = await sql.query("update tbAdmin set name = 'Kunal' where Phone = 9306066540")
//         if(data.affectedRows>0){
//             done = true;
//         }
//         res.json({done:done});
//     }
//     catch(err){
//         //console.warn(err);
//         //res.status(500).send(err.message);
//         res.status(500).send("something went wrong!");
//     }
    
// })

var auth = [
    "/getUserdata",
    "/setStatus",
    "/sendTenantOTP/:username/:fId",
    "/checkTenantOTP/:username/:otp",
    "/notifyOwner/:bills/:rentLeft",
    "/getPatient",
    "/getBloodGroupDonner",
    "/getDonnerDefaults",
    "/makeRequest",
    "/isDonner/:username/:name",
    "/createDonner",
    "/createDefaultDonner",
    "/saveDonner",
    "/removeDonner/:dId",
    "/setDonnerAge",
    "/setDonnersAge",
    "/logOut"
];
router.use(auth,authenticateToken);

router.post("/logOut", async (req,res)=>{
    try{
        //console.log("here");
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.sendStatus(204);
    }catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
});

router.get("/getSectors",async (req,res)=>{
    try{
        var data = await sql.query("select secId as id,secInfo as name from tbSectors");
        res.json({result:data});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})


router.post("/checkUsername/:username",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbUsers where username = '" + req.params.username + "'");
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

router.post("/sendOTP",async (req,res)=>{
    try{
        var otp = randomstring.generate(6);
        var data = await sql.query("select count(*) as matchf from tbOTP where Email = '" + req.body.email + "'");
        if(data[0].matchf!=0){
            await sql.query("update tbOTP set name = '" + req.body.name + "',phone = '" + req.body.phone + "',otp='" + otp + "' where email = '" + req.body.email + "'");
        }
        else{
            await sql.query("insert into tbOTP values(NULL,'" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','" + otp + "','0','0')");
        }
        var params = {
            email:req.body.email,
            subject: "Verification of Email",
            text : "Hi " + req.body.name + ", welcome to our platform Aspiring Homes,  your one time password is " + otp
        }
        mail.send(params);
        res.json({send:"1"});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/checkOTP/:email/:otp",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbOTP where email = '" + req.params.email + "' and otp = '"+req.params.otp+"'");
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

router.post("/getUserdata",async (req,res)=>{
    try{
        //console.log(req.body.username);
        var user = {};
        var uId = req.user.role;
        //console.log(uId);
        if(uId == 1){
            data = await sql.query("select Name,Email from tbAdmin where Phone = '" + req.body.username + "'");
            if(data.length>0){
                user = {
                    name:data[0].Name,
                    auth:"1",
                    profilePic:"",
                    email:data[0].Email,
                    status:"1"
                }
            }
        }
        else if(uId == 2){
            data = await sql.query("select Name,Email,profile,Status from tbController where username = '" + req.body.username + "' and Position = '1'");
            if(data.length>0){
                user = {
                    name:data[0].Name,
                    auth:"2",
                    profilePic:data[0].profile,
                    email:data[0].Email,
                    status:data[0].Status
                }
            }
        }
        else if(uId == 3){
            data = await sql.query("select Name,Email,profile,Status from tbController where username = '" + req.body.username + "' and Position = '2'");
            if(data.length>0){
                user = {
                    name:data[0].Name,
                    auth:"3",
                    profilePic:data[0].profile,
                    email:data[0].Email,
                    status:data[0].Status
                }
            }
        }
        else if(uId == 4){
            data = await sql.query("select Name,Email,profileImg from tbOwner where username = '"+req.body.username+"'");
            if(data.length>0){
                user = {
                    name:data[0].Name,
                    auth:"4",
                    profilePic:data[0].profileImg,
                    email:data[0].Email,
                    status:"1"
                }
            }
        }
        else if(uId == 5){
            data = await sql.query("select A.Name,A.Email,A.profileImg,A.status,A.tenantStatus,(select rvStatus from tbFloor where fId = A.fId) as rStatus from tbTenant A where A.username = '" + req.body.username + "'");
            if(data.length>0){
                user = {
                    name:data[0].Name,
                    auth:"5",
                    profilePic:data[0].profileImg,
                    email:data[0].Email,
                    status:data[0].status,
                    rStatus:data[0].rStatus,
                    tenantStatus:data[0].tenantStatus
                }
            }
        }
        else if(uId == 6){
            data = await sql.query("select uId,name,email from tbNewUser where username = '" + req.body.username + "'");
            if(data.length>0){
                user = {
                    userId:data[0].uId,
                    name:data[0].name,
                    auth:"6",
                    profilePic:'',
                    email:data[0].email,
                    status:'1'
                }
            }
        }
        else if(uId == 7){
            data = await sql.query("select Name,Email,profile,Status from tbController where username = '" + req.body.username + "' and Position = '3'");
            if(data.length>0){
                user = {
                    name:data[0].Name,
                    auth:"7",
                    profilePic:data[0].profile,
                    email:data[0].Email,
                    status:data[0].Status
                }
            }
        }
        if(user.profilePic == ""){
            user.profilePic = "assets/images/defaults/user.jpg";
        }
        //console.log(user);
        res.json(user);    
    }
    catch(err){
        //console.warn(err);
        res.status(err.status).send(err.message);
        //res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/setStatus",async (req,res)=>{
    try{
        var done = false;
        var data = await sql.query("select acctype from tbUsers where username = '"+req.body.username+"'");
        if(data.length>0){
            var uId = parseInt(data[0].acctype);
            if(uId == 1){
                
            }
            else if(uId == 2){
                
            }
            else if(uId == 3){
                data = await sql.query("update tbController set Status = '1' where username = '" + req.body.username + "' and Position = '2'");
                if(data.affectedRows>0){
                    done = true;
                }            
            }
            else if(uId == 4){
                
            }
            else if(uId == 5){
                
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

router.post("/findUser",async (req,res)=>{
    try{
        var match = false;
        var status = "1";
        var email = "";
        var name = "";
        //console.log(req.body);
        var user = {};
        var data = await sql.query("select acctype from tbUsers where username = '"+req.body.username+"'");
        //console.log(data);
        if(data.length>0){
            var uId = parseInt(data[0].acctype);
            //console.log(uId);
            data = await sql.callProcedure("prAuthenticate",{ch:uId,username:req.body.username});
            //console.log("here");
            //console.log(data[0]);
            if(data[0].length>0 && await bcrypt.compare(req.body.password, data[0][0].PASSWORD)){
                match = true;
                user = {
                    username:req.body.username,
                    role:uId
                }
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});
                res.cookie('jwt', accessToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

                if(uId == 1){
                    
                }
                else if(uId == 2){
                    data = await sql.query("select Status from tbController where username = '" + req.body.username + "' and Position = '1'");
                    if(data.length>0){
                        status=data[0].Status;
                    }
                }
                else if(uId == 3){
                    data = await sql.query("select Name,Email,Status from tbController where username = '" + req.body.username + "' and Position = '2'");
                    if(data.length>0){
                        status=data[0].Status;
                        email=data[0].Email;
                        name=data[0].Name;
                    }
                }
                else if(uId == 4){
                    
                }
                else if(uId == 5){
                    data = await sql.query("select status from tbTenant where username = '" + req.body.username + "'");
                    if(data.length>0){
                        status=data[0].status;   
                    }
                }
            }
            
        }
        res.json({match:match,status:status,email:email,name:name});    
    }
    catch(err){
        console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/sendTenantOTP/:username/:fId",async (req,res)=>{
    try{
        console.log("here");
        var otp = randomstring.generate(6);
        var data = await sql.query("select (select Email from tbTenant where username = '"+req.params.username+ "') as email,(select Name from tbTenant where username = '" + req.params.username + "') as tenantName,(select floorNo from tbFloor where fId='" + req.params.fId + "') as floorNo,(select rent from tbFloor where fId='" + req.params.fId+"') as Rent,(select houseNo from tbFloor where fId='"+req.params.fId+"') as houseNo,(select Name from tbOwner where ownId=(select ownId from tbFloor where fId='"+req.params.fId+"')) as ownerName; update tbTenant set otp = '"+otp+"' where username='"+req.params.username+"'");
        
        if(data.length>0){
            //console.log(data);
            var email = data[0].email;
            var rent = data[0].Rent;
            var floorNo = data[0].floorNo;
            var houseNo = data[0].houseNo;
            var ownerName = data[0].ownerName;
            var tenantName = data[0].tenantName;

            if(email!=""){
                var params = {
                    email:email,
                    subject: "Confirmation of Floor Registration",
                    text : "Hi " + tenantName + ", " + otp + " is your one time password to Register on the FloorNo: " + floorNo + ", HouseNo: " + houseNo + ", OwnerName: " + ownerName + ", Rent: " + rent
                }
                mail.send(params);
            }
            
        }
        res.json({send:"1"});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/checkTenantOTP/:username/:otp",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbTenant where username = '" + req.params.username + "' and otp = '"+req.params.otp+"'");
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

router.post("/notifyOwner/:bills/:rentLeft",async (req,res)=>{
    try{
        var done = false;
        var uId = req.user.role;
        if(uId==5){
            data = await sql.query("select A.Name as tenant,B.Name as owner,B.Email,C.FloorNo,C.houseNo from tbTenant A, tbOwner B,tbFloor C where C.fId = A.fId and B.ownId = C.ownId and A.username = '"+req.body.username+"'");
            if(data.length>0){
                done = true;
                var email = data[0].Email;
                var floor = data[0].FloorNo;
                var house = data[0].houseNo;
                var ownerName = data[0].owner;
                var tenantName = data[0].tenant;

                if(email!=""){
                    var params = {
                        email:email,
                        subject: "Tenant Want No Issue Certificate",
                        text : "Hi, " + ownerName + " tenant in your floor : " + floor + ", house : " + house +", " + tenantName + " ask for a No Issue Certificate. Bills Left : " + req.params.bills + ", Rent Pending : " + req.params.rentLeft
                    }
                    mail.send(params);
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


router.post("/getPatient",async (req,res)=>{
    try{
        var able = false;
        var data = await sql.query("select bloodGroup from tbBloodGroupInfo where username = '" + req.body.username + "' and auth = '1'");
        if(data.length>0){
            var bg = data[0].bloodGroup;
            if(bg!=""){
                able=true;
            }
        }
        if(able){
            var found = false;
            data = await sql.query("select mainName,age from tbBloodGroupInfo where bloodGroup = '" + req.body.bloodGroup + "' and username = '" + req.body.username + "'")
            if(data.length>0){
                found=true;
                res.json({result:data,able:able,data:found});
            }
            else{
                res.json({able:able,data:found});
            }
        }
        else{
            res.json({able:able});
        }    
    }
    catch(err){
        //console.warn(err);
        res.status(500).send(err.message);
        //res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})


router.post("/getBloodGroupDonner",async (req,res)=>{
    try{
        var data = await sql.query("select mainName,age,name,phone,email,abs(age - "+req.body.age+") as diff from tbBloodGroupInfo where bloodGroup = '" + req.body.bloodGroup + "' and username <> '" + req.body.username + "' order by diff");
        res.json({result:data});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/getDonnerDefaults", async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("select name,phone,email,username from tbBloodGroupInfo where username = '"+req.body.username+"' and  auth = '1'");
        if(data.length>0){
            found = true;
            res.json({
                data:found,
                name:data[0].name,
                phone:data[0].phone,
                email:data[0].email,
                username:data[0].username,
            })
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

router.post("/getDonnerList", async(req,res)=>{
    try{
        var data = await sql.query("select dId,mainName,name,phone,email,bloodGroup,age,DATE_FORMAT(dateModified, '%Y-%m-%d') as date from tbBloodGroupInfo where username = '" + req.body.username+"' and auth = '2'");
        res.json({result:data});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/makeRequest",async (req,res)=>{
    try{
        var params = {
            email:req.body.cEmail,
            subject: "Request For Blood",
            text : `Hey ${req.body.cName}, ${req.body.pcName} needs about ${req.body.amount}, ${req.body.bg} blood at ${req.body.at} with in ${req.body.withIn} for ${req.body.pName} from ${req.body.cMainName}. Please help him if you can. You can Contact him at ${req.body.contacts}`
        }
        //console.log(params);
        mail.send(params);
        res.json({done:true});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/isDonner/:username/:name",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbBloodGroupInfo where username = '" + req.params.username + "' and mainName = '"+ req.params.name +"'");
        if(data[0].matchf!=0){
            found = true;
        }
        res.json({match:found});    
    }
    catch(err){
        console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/createDonner",async(req,res)=>{
    try{
        var done = false;
        var data = await sql.query("insert into tbBloodGroupInfo values(NULL,'"+req.body.mainName+ "','" + req.body.age + "','" + req.body.date + "','" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','" + req.body.bloodGroup + "','" + req.body.username + "','2')");
        if(data.affectedRows>0){
            done = true;
        }
        res.json({done:done});    
    }
    catch(err){
        console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/createDefaultDonner",async(req,res)=>{
    try{
        var done = false;
        var data = await sql.query("insert into tbBloodGroupInfo values(NULL,'"+req.body.mainName+ "','" + req.body.age + "','" + req.body.date + "',(select name from tbBloodGroupInfo where username = '"+req.body.username+ "' and auth='1'),(select phone from tbBloodGroupInfo where username = '" + req.body.username + "' and auth='1'),(select email from tbBloodGroupInfo where username = '" + req.body.username + "' and auth='1'),'" + req.body.bloodGroup + "','" + req.body.username + "','2')");
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

router.post("/saveDonner",async(req,res)=>{
    try{
        var done = false;
        var data = await sql.query("update tbBloodGroupInfo set mainName = '" + req.body.mainName + "',age='" + req.body.age + "',dateModified='" + req.body.date + "',phone =  '" + req.body.phone + "',email = '" + req.body.email + "',bloodGroup = '" + req.body.bloodGroup + "',name = '" + req.body.name + "' where dId = '" + req.body.dId + "'");
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

router.post("/removeDonner/:dId",async(req,res)=>{
    try{
        var done = false;
        var data = await sql.query("delete from tbBloodGroupInfo where dId = '"+req.params.dId+"'");
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

router.post("/setDonnerAge",async(req,res)=>{
    try{
        var done = false;
        var bgInfo = "";
        if(req.body.dId == 0){
            bgInfo = "update tbBloodGroupInfo set age='" + req.body.age + "',dateModified='" + req.body.date + "' where username = '" + req.body.username + "' and auth = '1'";
        }
        else{
            bgInfo = "update tbBloodGroupInfo set age='" + req.body.age + "',dateModified='" + req.body.date + "' where dId = '" + req.body.dId + "'";
        }
        var data = await sql.query(bgInfo);
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

router.post("/setDonnersAge",async(req,res)=>{  // to verify working (front end code is also altered as supposed)
    try{
        var done = false;
        var bgInfo = "";
        var lst = req.body.lst;
        for(var i = 0;i<lst.length;i++){
            bgInfo = bgInfo + "update tbBloodGroupInfo set age='" + lst[i].age + "',dateModified='" + lst[i].date + "' where dId = '" + lst[i].dId + "';";
        }

        var data = await sql.query(bgInfo);
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

router.post("/notifyContactRequest",(req,res)=>{
    try{
        var params = {
            email:"gkunal13579@gmail.com",
            subject: "New Contact Request",
            text: "Name: " + req.body.name + ", Email: " + req.body.email + ", Subject: " + req.body.subject + ", message: " + req.body.message
        }
        mail.send(params);
        res.end();    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/insertContactRequest",async(req,res)=>{
    try{
        var done = false;
        var data = await sql.query("insert into tbContactRequests values(NULL,'"+req.body.name+ "','" + req.body.email + "','" + req.body.subject + "','" + req.body.message + "','"+req.body.date+"')");
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