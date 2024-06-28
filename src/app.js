import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

// accepting json data(while filling a form) with a limit of say, 10kb
app.use(express.json({
    limit : "10kb"
}))

// accepting data from url with a limit of say, 10kb
app.use(express.urlencoded({
    extended : true,
    limit : "10kb"
}))

//To serve static files such as images, CSS files, and JavaScript files,
app.use(express.static("public"))

//to perform CRUD operation on cookies of browser
app.use(cookieParser())

export {app}