// This middleware is responsible for validating the JWT token sent from the client.
import jwt from 'jsonwebtoken';
import Doctor from '../models/doctorModel.js'; // Adjust this path to your Doctor model

const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // check if the Authorization header and 'Bearer ' token are present.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, missing or invalid token'
      });
    }
    // extract the token from the header
    const doctorToken = authHeader.split(' ')[1];
    // verify the token's signature and expiration using the secret.
    const decodedToken = jwt.verify(doctorToken, process.env.JWT_SECRET);

    // check if the doctor in the database using the ID from the token.
    const doctor = await Doctor.findById(decodedToken.id);
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, doctor does not exist'
      });
    }
    // attach the entire doctor object to the request.
    req.doctor = doctor;
    next(); // proceed to route handler.
  } catch (err) {
    console.error('JWT verification error:', err.message);
    
    // provide a more specific error message based on the type of JWT error.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

export default authDoctor;
