import express from 'express';
import { getSession } from '../controllers/paymentController.js';

const paymentRoute = express.Router();



paymentRoute.get('/session/:id', getSession);

export default paymentRoute;
