const asyncHandler = require('express-async-handler')
const User= require('../models/userModel');
const gernerateToken = require('../config/generateToken');

const registerUser = asyncHandler(async (req,res)=>{
    const {name,email,password,pic} = req.body;
    
    if(!name || !email || !password ){
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const userExists = await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error("User already exists");
        return;
    }
    const cpassword =password;
    const user = await User.create({name,email,password,cpassword,pic});
    if(user){
        res.status(201).json({
            _id : user._id,
            name: user.name,
            email:user.email,
            isAdmin: user.isAdmin,
            pic:user.pic,
            token:gernerateToken(user._id),
        });
    }
    else{
        res.status(400);
        throw new Error("Failed to create the User");
    }
});

const authUser = asyncHandler( async (req,res)=>{
    const { email,password}=req.body;
    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        res.status(201).json({
            _id : user._id,
            name: user.name,
            email:user.email,
            isAdmin: user.isAdmin,
            pic:user.pic,
            token:gernerateToken(user._id),
        });
    }
    else{
        res.status(400);
        throw new Error("Invalid Email or Password");
    }
})


//  /api/user?search=suraj
const allUsers = asyncHandler(async (req,res) =>{
    const keyword= req.query.search ? {
        $or: [
            {name :{ $regex: req.query.search, $options: "i"} },
            {email:{ $regex: req.query.search, $options: "i"} },
        ],
    }:{};
    console.log(req.user)
    const users = await User.find(keyword).find({ _id:{$ne : req.user._id} });
    res.send(users);
    
  
})

module.exports = {registerUser,authUser,allUsers};