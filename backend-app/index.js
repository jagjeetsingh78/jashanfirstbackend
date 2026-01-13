const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

mongoose.connect("mongodb://localhost:27017/jashan");


const UserModel = require("./models/user");
const PostModel = require("./models/posts");


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
  let posts = (await PostModel.find().populate('createdby')).reverse();
  console.log(user);
  res.render('posts', { user,posts });
});







app.post('/createpost',isloggedIn, async (req, res) => {
    try {
        const { content } = req.body;
        
        // Validate input
        if (!content || content.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Content is required' 
            }).redirect('/posts');
        }

        let user = await UserModel.findOne({ email: req.user.email });

        // Create post
        const post = await PostModel.create({
            content: content.trim(),
            createdby: user._id,
         
        });


       res.redirect('/posts');

    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
//midle wares to the protected routes to check the user logged in or not 




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
  

 







app.post('/like/:id', isloggedIn, async (req, res) => {
  let post = await PostModel.findById(req.params.id);
  
 
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  
  await post.save();
  res.redirect('/posts');
});






app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
