import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRoute from './routes/adminRoute.js';
import doctorRoute from './routes/doctorRoute.js';
import userRoute from './routes/userRoute.js';
import paymentRoute from './routes/paymentRoute.js';

const app = express();
const port = process.env.PORT || 4000 

// using middleware 
app.use(express.json()); // <--- This parses JSON bodies
app.use(
  cors({
    origin: [
      "https://doctor-frontend.vercel.app", // deploy the project on vercel
      "https://doctor-admin.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true })); // <--- This parses URL-encoded bodies
app.use('/uploads', express.static('uploads'));
//connect to mongodb and cloudinary 
connectDB();
connectCloudinary()

app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align:center; padding-top: 50px;">
      <h1>Doctor Appointment API</h1>
      <p>✅ Backend is running successfully!</p>
      <a href="https://doctor-frontend.vercel.app" target="_blank" style="margin-right:10px;">Go to User App</a>
      <a href="https://doctor-admin.vercel.app" target="_blank">Go to Admin/Doctor Dashboard</a>
    </div>
  `);
});
//api end points 
app.use('/api/admin', adminRoute) // <--- Multer middleware is applied within adminRoute.js
app.use('/api/doctors', doctorRoute);
app.use('/api/users', userRoute);
app.use('/api/payment', paymentRoute);


/* app.get('/', (req, res) => {
    res.send("app is working")
}) */
//starting express app
app.listen(port, () => {
    console.log('Server is Starting at port #: ', port)
});