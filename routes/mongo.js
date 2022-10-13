const flat = require('../models/flats');
const mongoose = require('../models/mongocon');
const mongoose2 = require('mongoose');
const obj = require('../models/mssqlcon');
var mongo = {};
mongoose.connect();

mongo.hello = ()=>{
    mongoose.connect();
    mongoose.disconnect();
    console.log("hello");
}

mongo.saveFlat = async (obj) => {
    //console.log(obj);
    
    const data = new flat({
        _id:new mongoose2.Types.ObjectId(),
        fId : obj.fId,
        secId : obj.secId,
        house: obj.houseNo,
        flat: obj.floorNo,
        available:obj.available,
        sector: obj.sector,
        src:obj.src,
        rating : obj.rating,
        status: obj.status,
        bedrooms : obj.bedrooms,
        bathrooms : obj.bathrooms,
        bage : obj.bage,
        facing : obj.facing,
        price : obj.price,
        rent : obj.Rent,
        area : obj.area,
        cPhone: obj.cPhone,
        cName: obj.cName,
        cEmail: obj.cEmail,
        description: obj.desc,
        amenities:obj.amenities,
        images:obj.images
    })
    
    //await mongoose.connect();

    data.save().then((result)=>{
        //mongoose.disconnect();
        //console.warn(result);
        return true;
    }).catch(error=>{
        //mongoose.disconnect();
        //console.warn(error);
        throw new Error(error);
    });
}
mongo.getFlats = async (filter)=>{
    try{
        //method 1 to select only required elements
        //var data = await flat.find().select({area:1,bage:1,bathrooms:1,bedrooms:1,fId:1,_id:1,facing:1,flat:1,house:1,images:1,rent:1,price:1,rating:1,status:1,sector:1});
        var query = {status : {$ne : "personal"}, available:1}
        if(filter.location!=""){
            query.secId = filter.location;
        }
        if(filter.propertyTo != ""){
            query.status = {$in:['both',filter.propertyTo]};
        }
        if(filter.bedrooms!=""){
            query.bedrooms = {$in:filter.bedrooms};
        }
        if(filter.bathrooms!=""){
            query.bathrooms = {$in:filter.bathrooms};
        }
        if(filter.bage!=""){
            query.bage = filter.bage;
        }
        if(filter.area!=""){
            query.area = {$gte:filter.area[0],$lt:filter.area[1]};
        }
        if(filter.price!=""){
            if(filter.propertyTo==""){
                query.price = {$gte:filter.price[0],$lt:filter.price[1]};
                query.rent = {$gte:filter.price[0],$lt:filter.price[1]};
            }
            else if(filter.propertyTo=="rent"){
                query.rent = {$gte:filter.price[0],$lt:filter.price[1]};
            }
            else{
                query.price = {$gte:filter.price[0],$lt:filter.price[1]};
            }
            
        }
        if(filter.amenities!=""){
            query.amenities = { $all: filter.amenities } 
        }
        //console.log(filter);
        //console.log(query);
        //method 2 to deselect no required elements
        
        var data = await flat.find(query).select({amenities:0,cName:0,cEmail:0,cPhone:0,secId:0,src:0,description:0});
        
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.getFlatDetails = async (_id)=>{
    try{
        var data = await flat.find({_id:_id});
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.getSP = async (filter)=>{
    try{
        //method 1 to select only required elements
        //var data = await flat.find().select({area:1,bage:1,bathrooms:1,bedrooms:1,fId:1,_id:1,facing:1,flat:1,house:1,images:1,rent:1,price:1,rating:1,status:1,sector:1});
        var query = {
            available:1,
            //amenities : { $all: filter.amenities },
            //status : {$in:['both',filter.propertyTo]},
            //secId : filter.location,
            //area : {$gte:filter.area[0],$lt:filter.area[1]},
            _id:{$ne:filter._id}
        }
        
        
        if(filter.price!=""){
            
            if(filter.propertyTo=="rent"){
                query.rent = {$gte:filter.price[0],$lt:filter.price[1]};
            }
            else{
                query.price = {$gte:filter.price[0],$lt:filter.price[1]};
            }
            
        }
        //console.log(query);
        var data = await flat.find(query).select({images:1,house:1,flat:1,facing:1,sector:1,_id:1,rent:1,price:1,fId:1,secId:1}).limit(2);
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.setNotAvailable = async (fId)=>{
    try{
        var data = await flat.findOneAndUpdate(
                                { fId : fId },
                                { $set: {available:0} }
                            );
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.setNotAvailablePersonal = async (obj)=>{
    try{
        var data = await flat.findOneAndUpdate(
                                { fId : obj.fId },
                                { $set: {available:0},status:"personal",cName:obj.cName,cEmail:obj.email,cPhone:obj.phone}
                            );
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.setAvailable = async (fId)=>{
    try{
        var data = await flat.findOneAndUpdate(
                                { fId : fId },
                                { $set: {available:1} }
                            );
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}


mongo.getFlatDetailsByfId = async (fId)=>{
    try{
        var data = await flat.find({fId:fId});
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.getImagesById = async (_id)=>{
    try{
        var data = await flat.find({_id:_id}).select({images:1});
        return data[0].images;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.setImagesById = async (_id,images)=>{
    try{
        var data = await flat.findOneAndUpdate({_id:_id},{$set:{images:images}}).select({images:1});
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}

mongo.updateFlat = async (obj)=>{
    try{
        var update = {
            status : obj.status,
            bedrooms : obj.bedrooms,
            bathrooms : obj.bathrooms,
            bage : obj.bage,
            price : obj.price,
            area : obj.area,
            cName : obj.cName,
            cEmail : obj.cEmail,
            cPhone : obj.cName,
            description : obj.desc,
            rent : obj.Rent,
            amenities: obj.amenities,
            available : obj.available
        }
        var data = await flat.findOneAndUpdate({_id:obj._id},{$set:update});
        return data;
    }
    catch(err){
        throw new Error(err);
    }
}
module.exports = mongo;