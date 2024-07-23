import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({origin : process.env.CORS_ORIGIN,credentials : true}))

// accepting json data(while filling a form) with a limit of say, 10kb
app.use(express.json({limit : "10kb"}))

// accepting data from url with a limit of say, 10kb
app.use(express.urlencoded({extended : true,limit : "10kb"}))

//To serve static files such as images, CSS files, and JavaScript files,
app.use(express.static("public"))

//to perform CRUD operation on cookies of browser
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export {app}