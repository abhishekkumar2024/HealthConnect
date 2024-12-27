import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutePath from "./routes/user.route.js"

const app = express()

app.use(cors())

cors({
    "origin":process.env.ORIGIN_DB,
    credentials: true
})

// middlewares 

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({ extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes

app.use('/api/v1/users',userRoutePath)

export { app }