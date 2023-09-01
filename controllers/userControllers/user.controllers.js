const express = require('express');
const {User,userJoiSchema, userJoiSigninSchema} = require('../../models/userModel/user.model')
// const cources = require('../models/courseSchema')
const {Course} = require('../../models/courseModel/course.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Registered

const userRegister = async (req, res) => {
    
    const { error } = userJoiSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    try {
      const { name, email, password, country, confirm_password, language } = req.body;
      const courseExict= await User.findOne({ email : email })
      if (courseExict) {
           return res.status(422).json({ error: 'This email is already exists' });
      }
      else{
        const image = req.file.filename;
        const newUser = new User({
          name,
          email,
          password,
          country,
          confirm_password,
          language,
          image
        });
        // Return true if cource add return fale if not sucessfull
        console.log(newUser instanceof User); 
        await newUser.save();
        res.status(201).send({
          success: true,
          message: "Course added successfully",
          User: User  
        });
    }
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add course" });
    }
};

// User Sign in 
const userSigin = async (req, res) => {
  const {error} = userJoiSigninSchema.validate(req.body);
  if (error){
    return res.status(404).json({error: error.details[0].message});
  }
    try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Not Empty Fields' });
    }
    const userLogin = await User.findOne({ email: email });
    // login functionality
    if (userLogin) {
      const isMatched = await bcrypt.compare(password, userLogin.password);
      if (!isMatched) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      } else {
        // const token = jwt.sign(
        //   { userId: userLogin._id, userName: userLogin.name }, // Include user name here
        //   'pakistan009',
        //   {
        //     expiresIn: '1h'
        //   }
        // );
        // console.log(userLogin);
        // // Set the token as an HTTP-only cookie
        // res.cookie('jwtToken', token, {
        //   maxAge: 36000000, // Token expiration time in milliseconds (1 hour)
        //   httpOnly: true
        // });

        const token = jwt.sign(
          { userId: userLogin._id, userName: userLogin.name, userImage: userLogin.image },
          'pakistan009',
          {
            expiresIn: '1h',
          }
        );

        return res.status(200).json({
          // message: 'User Login Successfully',
          // token: token,
          // userId: userLogin._id,
          // name: userLogin.name, // Include the user's name here
          // image: userLogin.image
          message: 'User Login Successfully',
          token: token,
          userId: userLogin._id,
          name: userLogin.name,
          image: userLogin.image,
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
// user iamge



const userInfo= async (req, res) => {
  let result = await User.findOne({ _id: req.params.id });
  res.send(result);
}



// user image end
// Get All Users
const getMembers = async (req, res) => {
  let data = await User.find();
    console.log(data); 
    data.length > 0 ? res.send(data) : res.send("No data");
};

// Dell Member
const dellMember = async (req, res) => {
  let dellCoourse = await User.deleteOne({ _id: req.params._id  });
  if(dellCoourse)
  {
    res.status(201).json({ message: 'Successfully Member Delete' });
  }else{
    res.status(201).json({ message: 'Error while deleted User' });
  }
};

// Update Product
const updateSingleMember = async (req, res) => {
  let result = await User.updateOne(
    { _id: req.params._id },
    { $set: req.body }
  );
      res.send(result);
  // let result = await Products.findOne({ _id: req.params.id });
  // res.send(result);
};


// get Single Product Update
const getSingleMember = async (req, res) => {
  // let result = await Products.updateOne(
  //   { _id: req.params._id },
  //   { $set: req.body }
  // );
  //     res.send(result);
  let result = await User.findOne({ _id: req.params.id });
  res.send(result);
};

// get Cources whos has status false
const getFalseStausCources = async (req, res) => {
  try {
    let data = await Course.find({status: false});
    console.log(data);
    data.length > 0 ? res.send(data) : res.send("No data");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}

// get Cources whos has status false
const getTrueStausCources = async (req, res) => {
  try {
    let data = await Course.find({status: true});
    console.log(data);
    data.length > 0 ? res.send(data) : res.send("No data");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}
module.exports = {userRegister,userSigin,getMembers,dellMember,updateSingleMember,getSingleMember,getFalseStausCources,getTrueStausCources, userInfo}