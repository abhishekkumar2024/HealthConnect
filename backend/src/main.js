import { MONGODBCONNECTION } from './db/db.js'
import { app } from './app.js'
import dotenv from 'dotenv'

dotenv.config(
    {
        path: '../env'
    }
)

MONGODBCONNECTION().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Mongodb is connected at port : ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.error("MongoDB connection failed. Error details:");
    console.error(`Error Name: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Stack Trace: ${error.stack}`);
    process.exit(1)
})