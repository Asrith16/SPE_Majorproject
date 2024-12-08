const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app, server } = require('./socket/index')

// const app = express()
const backendUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 
    'http://localhost:8080' : 
    'http://192.168.49.2:30002';

// app.use(cors({
//     origin : frontendUrl,
//     credentials : true
// }))
app.use(cors()); // This allows all origins

app.use(express.json())
app.use(cookiesParser())

const PORT = process.env.PORT || 8080

app.get('/',(request,response)=>{
    response.json({
        message : "Server running at " + PORT
    })
})

//api endpoints
app.use('/api',router)

connectDB().then(()=>{
    server.listen(PORT,()=>{
        console.log("server running at " + PORT)
    })
})
