import express from 'express'
import  authUser  from '../middleware/authUser.js'
import {
    registerUser, loginUser, updateUser,
    userDetails, bookAppointment, getUserAppointments,
     cancelAppointment
} from '../controllers/userController.js';
import { confirmPayment, onlinePayment, cancelPayment } from '../controllers/paymentController.js';
import upload from '../middleware/multer.js';

const userRoute = express.Router();


userRoute.post('/register', registerUser);
userRoute.post('/login', loginUser);
userRoute.get('/user-details', authUser, userDetails);
userRoute.put('/update-user',upload.single('image'), authUser, updateUser); //use upload because user data has image file to update(form-data)
userRoute.post('/book-appointment', authUser, bookAppointment);
userRoute.post('/get-appointment', authUser, getUserAppointments);
userRoute.post('/cancel-appointment', authUser, cancelAppointment);
userRoute.post('/online-payment', authUser, onlinePayment);
userRoute.post('/confirm-payment', authUser, confirmPayment);
userRoute.post('/cancel-payment', authUser, cancelPayment);


export default userRoute; 