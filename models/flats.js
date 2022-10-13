var mongoose= require("mongoose");
var flat = new mongoose.Schema({
	fId : Number,
    secId : Number,
    available:Number,
    house:String,
    flat:String,
    sector:String,
    src:String,
    rating : Number,
    status: String,
    bedrooms : Number,
    bathrooms : Number,
    bage : String,
    facing: String,
    price : Number,
    rent : Number,
    area : Number,
	cPhone: String,
	cName: String,
	cEmail: String,
	description: String,
      
	amenities:[],
    images:{
        img1:String,
        img2:String,
        img3:String,
        img4:String
    }
});
 
module.exports = mongoose.model("flat", flat);