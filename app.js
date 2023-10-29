require('dotenv').config()
require ("./database/database").connect()
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const express = require('express')

const app = express()

//middleware
app.use(express.json())


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

app.post('login', async(req,res)=>{
    try{
        //get all data from frontend
        //find user in db
        //match the password
        //send token
    }catch(error) {
        console.log(error)
    }
})
module.exports = app;
