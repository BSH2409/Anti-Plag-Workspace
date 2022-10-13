const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next)=> {
    //console.log(req.body);
    const cookies = req.cookies;
    //console.log(cookies);
    if (!cookies?.jwt) return res.sendStatus(401);
    const accessToken = cookies.jwt;

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        //console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        //console.log("username : " + req.body.username);
        if(!req.body.username||req.body.username=="") req.body.username = user.username;
        //console.log(req.user);
        next()
    })
}


module.exports = {authenticateToken};