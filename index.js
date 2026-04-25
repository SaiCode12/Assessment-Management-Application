require("dotenv").config();

const express  = require ('express')
const cors = require('cors')
const app = express()
const mongoose = require("mongoose");

const port = process.env.PORT
app.use(cors());
app.use(express.json());   // 🔥 REQUIRED


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/categories', require('./routes/categories'));



app.get('/',(req,res)=>{
    res.send("Hello from backend")
})

app.listen(port,()=>{
    console.log("listening to the port",port)
})