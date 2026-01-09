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

// ✅ tell express to use EJS
app.set("view engine", "ejs");

// ✅ tell express where views a
app.set("views", path.join(__dirname, "views"));

// test route
app.get("/", (req, res) => {
  res.render('index')
});
// render EJS file

app.post("/create", async (req, res) => {
  try {
    let { username, age, password, email, name } = req.body;

    // 1. Fix typo (findOne) and use await
    let existingUser = await UserModel.findOne({ email: email });
    
    // 2. Check if user was found
    if (existingUser) return res.status(409).send("The user already exists, please login");

    // 3. Use await for bcrypt
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


    // 4. Wait for the save to complete
    await user.save();
    res.cookie("token",token);
    console.log(token);
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
