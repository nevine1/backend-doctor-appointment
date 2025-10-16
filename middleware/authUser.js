
import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //console.log('Full Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, missing or invalid token',
      });
    }

    // Extract the token from "Bearer <token>"
    const userToken = authHeader.split(' ')[1];

    const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    //console.log('Decoded token:', decodedToken);
    
      req.userId = decodedToken.id // getting id from the decoded token ,
      //  then use userId in userController to find the user and getting all his data 
    
      next();
  } catch (err) {
   // console.error(' JWT verification error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

export default authUser;
