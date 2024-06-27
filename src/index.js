//whenever interacting with database always use try-catch to handle errors 
//and async-await for waiting for response from db

// require('dotenv').config({path : './env'})
import dotenv from 'dotenv'

import mongoose from "mongoose";
import {DB_NAME} from "./constants.js"
import connectDB from "./db/index.js";

dotenv.config({path : './env'})

connectDB()


/* Approach to connect db

import express from "express"
const app = express()
//iife function
;(async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       app.on("error", (error) =>{
        console.log("Error ", error)
        throw error
       })

       app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
       })

    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})() */
