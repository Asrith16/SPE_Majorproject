const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app, server } = require('./socket/index')

// const app = express()
const frontendUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 
    'http://localhost:3000' : 
    'http://192.168.49.2:30000';

// app.use(cors({
//     origin : frontendUrl,
//     credentials : true
// }))
// app.use(cors()); // This allows all origins
const corsOptions = {
    origin: frontendUrl, // Replace with your frontend URL
    credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions));
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
