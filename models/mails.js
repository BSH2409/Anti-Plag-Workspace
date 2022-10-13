require('dotenv').config();
var nodeMailer = require('nodemailer');
var transport = nodeMailer.createTransport({
    host:'smtp.gmail.com',
    port : 587,
    secure:false,
    requireTLS:true,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS
    }
});

var obj = {};

obj.send = (params)=>{
    var mailOptions = {
        from: process.env.EMAIL_ID,
        to: params.email,
        subject: "Aspiring Homes : " + params.subject,
        text: params.text
    };
    transport.sendMail(mailOptions,function(err,info){
        if(err){
            //console.warn(err);
            return new Error(err.message);
        }
    });
}

module.exports = obj;