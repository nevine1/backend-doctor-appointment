
import express from 'express';
import {
    addDoctor, adminLogin, appointmentsAdmin, 
    adminCancelAppointment, adminDashboardData
 } from '../controllers/adminController.js';
import { changeAvailability } from '../controllers/doctorController.js';
import upload from '../middleware/multer.js';
import authAdmin from '../middleware/authAdmin.js';

const adminRoute = express.Router();

//sending the authAdmin with adding new doctor , to send the token 
//which has the admin email and password , to can login later 
adminRoute.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
//adminRoute.post('/get-doctors', authAdmin, getDoctors); // admin login first to get the admin token and use this token for this route to get all doctors
adminRoute.post('/change-availability', authAdmin, changeAvailability);
adminRoute.post('/admin-login', adminLogin);
adminRoute.get('/appointments-admin', authAdmin, appointmentsAdmin);
adminRoute.post('/admin-cancel-appointment', authAdmin, adminCancelAppointment);
adminRoute.get('/dashboard-data', authAdmin, adminDashboardData);
export default adminRoute;
