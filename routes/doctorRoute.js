import express from 'express';
import {
    getDoctors, getDoctorData,
    doctorLogin, getDoctorAppointments, 
    doctorCompleteAppointment,
    doctorCancelAppointment, 
    doctorDashboardData,
    getDoctorProfile, updateDoctorProfile
} from '../controllers/doctorController.js'
import authDoctor  from '../middleware/authDoctor.js'
import upload from '../middleware/multer.js';

const doctorRoute = express.Router();

doctorRoute.get('/get-doctors', getDoctors);
doctorRoute.get('/get-doctor/:id', getDoctorData);
doctorRoute.post('/doctor-login', doctorLogin);
doctorRoute.get('/doctor-appointments', authDoctor, getDoctorAppointments);
doctorRoute.post('/doctor-complete-appointment', authDoctor, doctorCompleteAppointment);
doctorRoute.post('/doctor-cancel-appointment', authDoctor, doctorCancelAppointment);
doctorRoute.get('/doctor-dashboard', authDoctor, doctorDashboardData);
doctorRoute.get('/doctor-profile', authDoctor, getDoctorProfile);
doctorRoute.put('/update-doctor-profile', upload.single('image'), authDoctor, updateDoctorProfile);

export default doctorRoute; 