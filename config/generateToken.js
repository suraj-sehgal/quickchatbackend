const jwt = require('jsonwebtoken');


const gernerateToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"30d",
    });
};

module.exports =gernerateToken;