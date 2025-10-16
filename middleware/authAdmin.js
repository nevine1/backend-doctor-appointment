// middleware/authAdmin.js
import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('Full Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, missing or invalid token',
      });
    }

    // Extract the token from "Bearer <token>"
    const adminToken = authHeader.split(' ')[1];

    const decodedToken = jwt.verify(adminToken, process.env.JWT_SECRET);
    console.log('Decoded token:', decodedToken);
   
    if (
      decodedToken.email !== process.env.ADMIN_EMAIL ||
      decodedToken.password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token credentials',
      });
    }
    //if it is decoded_token is existing, then
    // Pass control to next middleware/route
    next();
  } catch (err) {
    console.error(' JWT verification error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

export default authAdmin;
