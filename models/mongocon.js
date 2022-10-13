require('dotenv').config();
const mongoose = require('mongoose');

var con_url = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.hmvx0.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;
var con_obj = {
    useNewUrlParser:true,
    useUnifiedTopology:true
}

var obj = {}

obj.connect = async ()=>{
    
    mongoose.connect(con_url,con_obj).then(()=> {
        console.log("Connection successfull....");
        
        // setTimeout(() => {
        //     mongoose.disconnect().then(()=>{
        //         console.log("Dis-connected successfully ....");
        //     })
        // }, 3000);
    }).catch((err)=>{
        console.log(err);
    });
}

obj.disconnect = ()=>{
    mongoose.disconnect()
    .then(()=>{
        console.log("Dis-connected successfully ....");
    }).catch((err)=>{
        console.log(err);
    });
}


module.exports = obj