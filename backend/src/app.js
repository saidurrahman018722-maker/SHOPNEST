import express from "express"
import {config} from 'dotenv'
import {connectDB,disconnectDB} from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from 'cors'
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"



const app = express();
config();
connectDB();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Routes

app.use('/auth',authRoutes);
app.use('/products',productRoutes);


app.listen(process.env.PORT || 5000,()=>{
    console.log(`You are connected to the server ${process.env.PORT}`)
})
