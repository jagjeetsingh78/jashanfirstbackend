const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

mongoose.connect("mongodb://localhost:27017/jashan");

// model
const UserModel = require("./models/user");

// middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());




app.get("/",(req, res) => {
  res.render('index')
});

app.get("/login", (req, res) => {
  res.render('login')
});


app.post('/loginprocess', async (req, res) => {

  let {email,password} =req.body;
  let user = await UserModel.findOne({email:email});
  if(!user) return res.status(309).send("the user doesnot existand the allthigns");

  let correctPassword =bcrypt.compare(password,user.password);
  if(correctPassword){
    let usetoken =jwt.sign({email:email,username:user.username},"notproductiongradeapp");
    res.cookie("token",usetoken);
    res.status(200).redirect('/posts');

    


  }
  else{
    res.redirect('/');
  }


});




app.post("/create", async (req, res) => {

  try {
    let { username, age, password, email, name } = req.body;

    let existingUser = await UserModel.findOne({ email: email });
    
    if (existingUser) return res.status(409).send("The user already exists, please login");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let user = new UserModel({
      name,
      username,
      age,
      password: hash,
      email
    });

    let token=jwt.sign({email:email,username:username },"notproductiongradeapp");
    await user.save();
    res.cookie("token",token);
    res.status(201).redirect('/posts');
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});


;
app.get('/posts', isloggedIn, async (req, res) => {
  let user = await UserModel.findOne({ email: req.user.email });
  console.log(user);
  res.render('posts', { user });
});


// middle wares to the protected routes to check the user logged in or not 

function isloggedIn(req,res,next){
  let token =req.cookies.token;
  if(token===undefined) return res.redirect('/login');
 else{
  let verifytoken =jwt.verify(token,"notproductiongradeapp");
  if(verifytoken){
   req.user = verifytoken;
   next();
  }
  else{
   res.status(309).redirect('/login');
  }

 }
  

}


app.post('/createpost',isloggedIn,(req,res)=>{

});











app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
