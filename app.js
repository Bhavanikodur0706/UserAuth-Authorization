require('dotenv').config()
require ("./database/database").connect()
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const express = require('express')

const app = express()

//middleware
app.use(express.json())//so that middleware undersatnd json format 
app.use(cookieParser()) //now app will understand cookie and interact with them


app.get("/",(req,res)=>{
    res.send('<h1>Server is working from app</h1>')
})

app.post("/register",async (req,res)=>{
    try {
        //get all data from the body
        const {firstname,lastname,email,password} = req.body
        //all the data should exits
        if(!(firstname && lastname && email && password)){
            res.status(400).send("All fields are compulsory")
        }
        //check of user already existed in db
        //as User is created by monogoose it have abiltity to query the db 
        const existingUser = await User.findOne({email})
        if(existingUser){
            res.status(401).send('User already exists with this email')
        }
        //Encrypt the password
       const myEncPassword = await bcrypt.hash(password, 10)
        //save the user in DB
        const user = await User.create({
            // firstname : firstname
            firstname,
            lastname,
            email,
            password : myEncPassword
        })
        //generate the token for user and send it
        const token = jwt.sign(
            {id:user._id,email},
            'shhh' ,//process.env.jwtsecrete 
            {
                expiresIn : "2h"
            }
        );
        user.token = token
        //to send all data to frontend
        user.password  = undefined //for not to send to user

        res.status(201).json(user) //sending to frontend
 
    } catch (error) {
        console.log(error);
    }
})

app.post('/login', async(req,res)=>{
    try{
        //get all data from frontend
        const {email, password} = req.body //destructuring and checking the data from body
        //validation
        if(!(email && password)) {
            res.status(400).send('send all the data')  
        }

        //find user in db, it is querty to db so we can do that check with User
        const user = await User.findOne({email})
        //if user does not exists in db
        if(!(user)){
            res.status(400).send('user doesnot exists, please register')
          process.exit(1)
        }

        //match the password,
        //here comparing password with hash password and if true/false , check if user exits
        if(user && (await bcrypt.compare(password,user.password))){
           //if user and password exists, we generate token 
           const token = jwt.sign(
            {id:user._id},
            'shhh' , //process.env.jwt secrete
            {
                expiresIn : "2h"
            }

           );
           user.token = token
           user.password = undefined
           //send token in userCookie
           //cookie section 
           const options = {
            expiresIn : new Date(Date.now()+ 3 * 24 * 60 * 60 * 1000),
            httpOnly : true //by making this flag on can make cookie manipulated by server only, not browser 
           };
           res.status(200).cookie("token", token , options).json(
            {
                success : true,
                token,
                user
            }
           )
        }

        //send token
    }
    catch(error) {
        console.log(error)
    }
})
module.exports = app;
