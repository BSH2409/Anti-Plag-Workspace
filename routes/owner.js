const { response } = require("express");
const express = require("express");
const router = express.Router();
const multer =require("multer");
const path=require("path");
const sql = require('../models/mssqlcon');
const mail = require('../models/mails');
//const map = require('../models/map');
const upload = require('../models/upload');
const mongo = require("./mongo");
require('./mongo');
const fs = require('fs');
const bcrypt = require('bcrypt')
const {authenticateToken} = require('../models/auth');

var auth = [
    "/getFloors",
    "/saveFlatImages",
    "/updateFlatImages/:id",
    "/saveFlatOtherImages/:fId",
    "/deleteFlatOtherImages",
    "/insertFloor",
    "/updateFloor",
    "/getFlatInfo/:fId",
    "/setDashboard",
    "/changePassword",
    "/updateProfileImage",
    "/getProfile",
    "/setProfile",
    "/getTenantInfo/:fId",
    "/getFloorInfo/:fId",
    "/checkTenantUser/:username",
    "/setFloorTenant",
    "/removeFloorTenant/:tId/:fId",
    "/getFloorElectricityBills/:fId",
    "/getFloorWaterBills/:fId",
    "/payBill",
    "/getFloorRentBills/:fId",
    "/deleteAccount"


];
router.use(auth,authenticateToken);


router.post("/checkMN/:number",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbMeter where meterNo = '" + req.params.number + "'");
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

router.post("/checkFlat",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbFloor where houseNo = '" + req.body.house + "' and floorNo = '"+req.body.flat+"'");
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

router.get("/getFloors",async(req,res)=>{
    try{
        //console.log(req.body);
        var data = await sql.query("select fId as id, CONCAT(houseNo,': ',floorNo) as name from tbFloor where ownId = (select ownId from tbOwner where username = '"+req.body.username+"')");
        //console.log(data);
        res.json({result:data});
            
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/checkAccount/:email",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbOwner where email = '" + req.params.email + "'");
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

router.post("/checkHouse/:house",async (req,res)=>{
    try{
        var found = false;
        var data = await sql.query("Select count(*) as matchf from tbOwner where houseNo = '"+req.params.house+"'");
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

router.post("/insertOwner", async (req,res)=>{
    try{
        req.body.profile = "assets/images/defaults/user.jpg";
        req.body.profile = req.body.profile.replace(/\\/g, "\\\\");
        req.body.password = await bcrypt.hash(req.body.password, 10);
        var insertOwnerquery = "Insert into tbOwner values(NULL,'" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','"+req.body.username+"','" + req.body.password + "','" + req.body.secId + "','" + req.body.houseNo + "','" + req.body.tnc + "','" + req.body.profile + "','" + req.body.date + "','0','')";
        var insertUser = "Insert into tbUsers values(NULL,'"+req.body.username+"','4')";
        var updatetbOTP = "update tbOTP set verified = '1',registered = '1' where email = '"+req.body.email+"'";
        var insertBGInfo = "insert into tbBloodGroupInfo values(NULL,'" + req.body.name + "','','" + req.body.date + "','" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','','" + req.body.username + "','1')";
        
        var data = await sql.query(insertOwnerquery + ";" + insertUser + ";" + updatetbOTP + ";" + insertBGInfo);
        var done = parseInt(data.affectedRows);
        res.json({insert:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

const upload_flat = upload.flat.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }, { name: 'file3', maxCount: 1 }, { name: 'file4', maxCount: 1 }]);

router.post("/saveFlatImages",upload_flat,(req,res)=>{
    var obj = {
     img1: req.files.file1[0].path,
     img2: req.files.file2[0].path,
     img3: req.files.file3[0].path,
     img4: req.files.file4[0].path
    }

    //console.log(req.files);
    
    res.json(obj);
})

router.post("/updateFlatImages/:id",upload_flat, async (req,res)=>{
    try{
        var flag = false;
        //console.log(req.params.id);
        var files = [];
        var filepath = "";
        var data = await mongo.getImagesById(req.params.id);
        // console.log("initial");
        // console.log(data);
        if(req.files.file1){
            filepath = "./" + data.img1;
            files.push(filepath);
            data.img1 = req.files.file1[0].path;
            flag = true;
        }
        if(req.files.file2){
            filepath = "./" + data.img2;
            files.push(filepath);
            data.img2 = req.files.file2[0].path;
            flag = true;
        }
        if(req.files.file3){
            filepath = "./" + data.img3;
            files.push(filepath);
            data.img3 = req.files.file3[0].path;
            flag = true;
        }
        if(req.files.file4){
            filepath = "./" + data.img4;
            files.push(filepath);
            data.img4 = req.files.file4[0].path;
            flag = true;
        }
        //console.log("to set");
        //console.log(data);
        if(flag){
            files.forEach(path => fs.existsSync(path) && fs.unlinkSync(path));
            var previous = await mongo.setImagesById(req.params.id,data);
            //console.log("previous one after set");
            //console.log(previous);
        }

        res.json({});
        
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})

// router.post("/saveFlatImages",upload_flat,(req,res)=>{
//     var obj = {
//      img1: req.files.file1[0].path,
//      img2: req.files.file2[0].path,
//      img3: req.files.file3[0].path,
//      img4: req.files.file4[0].path
//     }

//     //console.log(req.files);
    
//     res.json(obj);
// })

router.post("/saveFlatOtherImages/:fId",upload.flatOther.array('otherImages',20),async (req,res)=>{
    try{
        var done = false;
        var values = "";
        for(var i = 0; i<req.files.length;i++){
            req.files[i].path = req.files[i].path.replace(/\\/g, "\\\\");
            if(values!=""){
                values = values + `,(NULL,${req.params.fId},'` + req.files[i].path + `')`;
            }
            else{
                values = values + `(NULL,${req.params.fId},'` + req.files[i].path + `')`;
            }    
        }
    
        //var query = `insert into tbOtherImages values ${values}`;
        //console.log(query);
        var data = await sql.query(`insert into tbOtherImages values ${values}`);
        if(data.affectedRows>0){
            done=true;
        }
        res.json({done:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }

})

router.post("/deleteFlatOtherImages",async (req,res)=>{
    try{
        var done = false;
        var imgId = "";
        //console.log(req.body);

        for(var i=0;i<req.body.imgId.length;i++){
            if(imgId==""){
                imgId = imgId + `${req.body.imgId[i]}`
            }
            else{
                imgId = imgId + `,${req.body.imgId[i]}`
            }
        }
        var query = ` delete from tbOtherImages where imgId in (${imgId})`;
        var data = await sql.query(`select path from tbOtherImages where imgId in (${imgId}); ${query}`);
        if(data.length>0){
            var remove = [...data];
            var files = [];

            //console.log(remove);
            for(var i=0;i<remove.length;i++){
                var filePath = "./" + remove[i].path;
                files.push(filePath);
                // console.log(filePath);
                // fs.exists(filePath, function(exists) {
                //     console.log(exists);
                //     if(exists) {
                //         fs.unlinkSync(filePath);
                //     } 
                // });
            }
            //console.log(files);
            files.forEach(path => fs.existsSync(path) && fs.unlinkSync(path))
            // data = await sql.query(query);
            done=true;
        }
        res.json({done:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }

})

router.post("/insertFloor",async(req,res)=>{
    try{
        var obj = req.body;
        //console.log(obj);
        var done = false;
        var tbFloor = "insert into tbFloor values(NULL,'"+req.body.houseNo+ "',(select ownId from tbOwner where username = '" + req.body.username + "'),'"+req.body.floorNo+"','"+req.body.Emeter+"','"+req.body.eReading+ "','" + req.body.Wmeter + "','" + req.body.wReading + "','"+req.body.Rent+"','"+req.body.secId+"','1')";
        var tbMeter = "insert into tbMeter values(NULL,'"+req.body.Emeter+"','E','"+req.body.eReading+"','"+req.body.date+ "','0')  insert into tbMeter values(NULL,'" + req.body.Wmeter + "','W','" + req.body.wReading + "','" + req.body.date + "','0')";
        var fId = "select A.fId,(select secInfo from tbSectors where secId = '"+req.body.secId+"') as sector,(select src from tbSectors where secId = '"+req.body.secId+"') as src from tbFloor A where A.houseNo = '"+req.body.houseNo+"' and A.floorNo = '"+req.body.floorNo+"'";
        var data = await sql.query(tbFloor + ";" + tbMeter + ";" + fId);
        // if(data.affectedRows>0){
        //     done = true;
        // }
        if(data.length>0){
            done = true;
            obj.fId = data[0].fId;
            obj.sector = data[0].sector;
            //obj.secId = data[0].secId;
            obj.src = data[0].src;
            if(req.body.status=="personal"){
                obj.available = 0;
            }
            else{
                obj.available = 1;
            }
            //obj.src = map[ Math.floor(Math.random() * 10)].src;
            obj.rating = parseFloat(Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
            var msave = await mongo.saveFlat(obj);  
        }
        res.json({done:done});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/updateFloor",async(req,res)=>{
    try{
        var obj = req.body;
        //console.log(obj);
        var done = false;
        var tbFloor = "update tbFloor set Rent = '"+obj.Rent+"' where fId = '"+obj.fId+"'";
        var data = await sql.query(tbFloor);
        if(data.affectedRows>0){
            done = true;
            
            if(obj.status=="personal"){
                obj.available = 0;
            }
            else{
                obj.available = 1;
            }
            //console.log(obj);
            var update = await mongo.updateFlat(obj);  
        }
        res.json({done:done});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.get("/getFlatInfo/:fId",async(req,res)=>{ 
    try{
        var fId = req.params.fId;
        //console.log(filter);
        var content = await mongo.getFlatDetailsByfId(fId);
        //console.log(data);
        var data=null;
        if(content.length>0){
            data = {...content[0]._doc};
            data.otherImages = [];
        }
        if(data!=null){
            var pic = await sql.query("select imgId,path from tbOtherImages where fId = '"+req.params.fId+"'");
            //console.log(pic);
            if(pic.length>0){
                //console.log(pic);
                data.otherImages =  [...pic];
            }
        }
        

        //console.log(data);
        res.json({data:data});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})
router.post("/findOwner",async(req,res)=>{
    try{
        var match = false;
        var applied = 0;

        var data = await sql.callProcedure("prAuthenticate",{ch:4,username:req.body.username});
        if(data[0].length>0 && await bcrypt.compare(req.body.password, data[0][0].PASSWORD)){
            match = true;
        }
        if(match){
            data = await sql.query("select prStatus from tbOwner where username = '"+req.body.username+"'");
            if(data.length>0){
                applied = parseInt(data[0].prStatus);
            }
        }
        
        res.json({match:match,applied:applied});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.get("/getSectors/:ownId",async (req,res)=>{
    try{
        var data = await sql.query("select secId as id,secInfo as name from tbSectors where secId in (select secId from tbOwner where ownId = '"+req.params.ownId+"' union select distinct secId from tbFloor where ownId = '"+req.params.ownId+"')");
        res.json({result:data});
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
})

router.post("/getBasicData",async(req,res)=>{ //to verify for convert nvarchar
    try{
        var data = await sql.query("select ownId,Name as name,Phone as phone,Email as email,CONVERT(secId,CHAR (10)) as secId from tbOwner where username = '"+req.body.username+"'");
        if(data.length>0){
            res.json({...data[0]});    
        }
        else{
            res.json({name:"",email:"",phone:"",secId:"",ownId:""});
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
        var data = await sql.query("select A.ownId,A.Name as name,A.profileImg as profile,A.houseNo as house,(select count(*) from tbFloor where ownId = A.ownId) as ownCount from tbOwner A where A.username = '" + req.body.username + "'");
        if(data.length>0){
            res.json({...data[0]});
        }
        else{
            res.json({name:"",profile:"",house:"",ownId:"",ownCount:""})
        }   
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/changePassword",async(req,res)=>{
    try{
        var done = false;
        var data = await sql.query("select PASSWORD from tbOwner where username = '" + req.body.username + "'");
        if(data[0].length>0 && await bcrypt.compare(req.body.password, data[0][0].PASSWORD)){
            req.body.newPassword = await bcrypt.hash(req.body.newPassword, 10);
            data = await sql.query("update tbOwner set Password  = '"+req.body.newPassword+"' where username = '" + req.body.username + "'");
            if(data.affectedRows>0){
                done = true;
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

router.post("/updateProfileImage",upload.profile.single('profile'),(req,res)=>{
    var path = req.file.path;
    res.json({path:path});
})

router.post("/getProfile",async(req,res)=>{
    try{
        var found = false;
        var data = await sql.query("select Name as name,Phone as phone,Email as email,username,profileImg as profile,DATE_FORMAT(date, '%Y-%m-%d') as date,bloodGroup,(select DATE_FORMAT(dateModified, '%Y-%m-%d') from tbBloodGroupInfo where username = '" + req.body.username + "' and auth = '1') as dateModified,(select age from tbBloodGroupInfo where username = '" + req.body.username + "' and auth = '1') as age from tbOwner where username = '" + req.body.username + "'");
        if(data.length>0){
            found = true;
            res.json({data:found,...data[0]});
        }
        else{
            res.json({data:found});
        }   
    }
    catch(err){
        console.warn(err);
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
        //console.log(data.affectedRows);
        if(data.affectedRows==0){
            insertBGInfo = "insert into tbBloodGroupInfo values(NULL,'" + req.body.name + "','" + req.body.age + "','" + req.body.date + "','" + req.body.name + "','" + req.body.phone + "','" + req.body.email + "','" + req.body.bloodGroup + "','" + req.body.username + "','1')";
        }

        if(req.body.profile==""){
            var data = await sql.query("update tbOwner set Name = '" + req.body.name + "',Phone = '" + req.body.phone + "',bloodGroup = '"+req.body.bloodGroup+"'  where username = '" + req.body.username + "'; " + insertBGInfo);
            if(data.affectedRows>0){
                done = true;
            }
        }
        else{
            req.body.profile = req.body.profile.replace(/\\/g, "\\\\");
            var str = "select profileImg as profile from tbOwner where username = '" + req.body.username + "'; update tbOwner set Name = '" + req.body.name + "',Phone = '" + req.body.phone + "', profileImg = '" + req.body.profile+ "',bloodGroup = '" + req.body.bloodGroup + "'  where username = '" + req.body.username + "';" + insertBGInfo;
            //console.log(str);
            var data = await sql.query(str);
            //console.log(data);
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
            //data = await sql.query(str2);
            
        }
        
        res.json({done:done});    
    }
    catch(err){
        console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.get("/getTenantInfo/:fId",async(req,res)=>{ 
    try{
        var found = false;
        var data = await sql.query("select A.tId,A.Name as name,A.Phone as phone,A.Email as email,A.profileImg as profile,DATE_FORMAT(A.date, '%Y-%m-%d') as date,B.floorNo as floor,B.Rent as rent,B.eReading,B.wReading from tbTenant A,tbFloor B where A.fId = B.fId and A.fId = '" + req.params.fId+"'");
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

router.get("/getFloorInfo/:fId",async(req,res)=>{ 
    try{
        var found = false;
        var data = await sql.query("select A.floorNo as floor,A.Rent as rent,(select Reading from tbMeter where meterNo = A.Emeter) as eReading,(select Reading from tbMeter where meterNo = A.Wmeter) as wReading from tbFloor A where A.fId = '"+req.params.fId+"'");
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

router.post("/checkTenantUser/:username",async (req,res)=>{
    try{
        var found = false;
        //console.log(req.params.username);
        var data = await sql.query("Select count(*) as matchf from tbTenant where username = '" + req.params.username + "' and tenantStatus = '0'");
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

router.post("/setFloorTenant",async(req,res)=>{
    try{
        var done = false;
        var tbTenant = "update tbTenant set fId = '"+req.body.fId+"',date = '"+req.body.date+"',tenantStatus = '1' where username = '"+req.body.username+"'";
        var tbFloor = "update tbFloor set eReading = '"+req.body.eReading+"',wReading = '"+req.body.wReading+"',rvStatus='1' where fId='"+req.body.fId+"'";
        var tbRentRecord = "Insert into tbRentRecords values(NULL,(select tId from tbTenant where username = '"+req.body.username+"'),'"+req.body.fId+"','"+req.body.date+"','"+req.body.houseNo+"',(select Rent from tbFloor where fId = '"+req.body.fId+"'),'0')";
        
        var data = await sql.query(tbTenant + ";" + tbFloor + ";" + tbRentRecord);
        if(data.affectedRows>0){
            done = true;
            var set = await mongo.setNotAvailable(req.body.fId);  
        }
        res.json({done:done});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/removeFloorTenant/:tId/:fId",async(req,res)=>{
    try{
        //here houseNo stores date after one month 
        
        var done = false;
        var tbTenant = "update tbTenant set fId = '0',tenantStatus = '0' where tId = '"+req.params.tId+"'";
        var tbRentRecord = "update tbRentRecords set Status = '1' where fId='"+req.params.fId+"' and tId = '"+req.params.tId+"'";
        var tbMeterRecord = "update tbMeterRecords set tenantStatus = '1' where meterNo in (select Emeter from tbFloor where fId = '" + req.params.fId + "' union select Wmeter from tbFloor where fId = '" + req.params.fId + "')";
        
        var data = await sql.query(tbTenant + ";" + tbMeterRecord + ";" + tbRentRecord);
        if(data.affectedRows>0){
            var set = await mongo.setAvailable(req.params.fId);  
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

router.post("/getFloorElectricityBills/:fId",async(req,res)=>{
    try{
        var data = await sql.query("select A.recId,A.meterNo,A.PreReading as preReading,A.Reading,DATE_FORMAT(A.fromDate, '%Y-%m-%d') as dateFrom,DATE_FORMAT(A.todate, '%Y-%m-%d') as dateTo,DATE_FORMAT(A.duedate, '%Y-%m-%d') as dueDate,A.status,A.tenantStatus,A.amountPaid,A.amountToPay from tbMeterRecords A where A.meterNo = (select Emeter from tbFloor where fId='"+req.params.fId+"') order by A.status,fromDate desc");
        res.json({result:data});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/getFloorWaterBills/:fId",async(req,res)=>{
    try{
        var data = await sql.query("select A.recId,A.meterNo,A.PreReading as preReading,A.Reading,DATE_FORMAT(A.fromDate, '%Y-%m-%d') as dateFrom,DATE_FORMAT(A.todate, '%Y-%m-%d') as dateTo,DATE_FORMAT(A.duedate, '%Y-%m-%d') as dueDate,A.status,A.tenantStatus,A.amountPaid,A.amountToPay from tbMeterRecords A where A.meterNo = (select Wmeter from tbFloor where fId='"+req.params.fId+"') order by A.status,fromDate desc");
        res.json({result:data});    
    }
    catch(err){
        //console.warn(err);
        //res.status(500).send(err.message);
        res.status(500).send("SOMETHING WENT WRONG!!");
    }
    
})

router.post("/payBill",async(req,res)=>{
    try{
        var done = false;
        var data = await sql.query("update tbMeterRecords set amountPaid = '" + req.body.amountPaid + "',amountToPay = '" + req.body.amountToPay + "',status='" + req.body.status + "',tenantStatus='" + req.body.tenantStatus + "'  where recId = '" + req.body.recId + "'");
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

router.post("/getFloorRentBills/:fId",async(req,res)=>{
    try{
        var data = await sql.query("select A.recId,DATE_FORMAT(A.formDate, '%Y-%m-%d') as fromDate,DATE_FORMAT(A.toDate, '%Y-%m-%d') as toDate,A.Rent as amount,A.status,(select Name from tbTenant where tId = A.tId) as name,(select Phone from tbTenant where tId = A.tId) as contact from tbRentRecords A where  A.fId='" + req.params.fId+"' order by A.status,fromDate desc");
        res.json({result:data});    
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
        var deleteOwner = "select profileImg from tbOwner where ownId='"+req.body.ownId+"' delete from tbOwner where ownId = '"+req.body.ownId+"'"
        var deleteUsername = "delete from tbUsers where username = '"+req.body.username+"'";

        //var deleteBGInfo = "delete from tbBloodGroupInfo where username = '"+req.body.username+"'"
        
        var data = await sql.query(deleteUsername + ";" + deleteOwner);
        if(data.length>0){
            done=true;
            var previous = String(data[0].profileImg);
            //console.log(previous);
            var defaultPath = "assets/images/defaults/user.jpg";
            if(previous!=defaultPath){
                var filePath = "./" + previous;
                fs.exists(filePath, function(exists) {
                    if(exists) {
                        fs.unlinkSync(filePath);
                    } 
                });
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