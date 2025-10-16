import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Doctor from '../models/doctorModel.js'
import Appointment from '../models/appointmentModel.js';
import { v2 as cloudinary } from 'cloudinary'
import Stripe from 'stripe'


const registerUser = async (req, res) => {
    
    try {
        const { name, email, password } = req.body; 
        
        if (!name || !email || !password) {
            return res.json({
                success: false, 
                message: "This field is  required"
            })
        }
        //validation for email, name, password;
        if (!email) { 
              console.error("Validation Error: Email is missing.");
              return res.status(400).json({ success: false, message: "Email is required." });
            }
            if (!validator.isEmail(email)) {
              console.error("Validation Error: Invalid email format.");
              return res.status(400).json({ success: false, message: "Please enter a valid email." });
            }
        
            if (!password) { 
              console.error("Validation Error: Password is missing.");
              return res.status(400).json({ success: false, message: "Password is required." });
            }
            if (password.length < 5) {
              console.error("Validation Error: Password too short.");
              return res.status(400).json({ success: false, message: "Password should be more than 5 characters." });
            }
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt)

        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.json({
                success: false,
                message: "This email is already existing, please use another email"
            })
        }
        
        const userData = {
            name, 
            email, 
            password: hashedPass, 
            date: new Date(), 
        }
        
        const regUser = new User(userData);
        const user = await regUser.save();
        const token = jwt.sign({ id: user._id } , process.env.JWT_SECRET)
        return res.json({
            success: true, 
            message: "New user is added", 
            data: user, 
            token
        })
        
    } catch (err) {
        return res.json({
            success: false, 
            message: err.message
        })
    }
}

const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
             return res.json({
                success: false, 
                message: "User is not existing",
            })
        }

        const matchedPass = await bcrypt.compare(password, user.password);

        if (matchedPass) {
            const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
             return res.json({
                success: true, 
                message: "user logged in successfully",
                 data: user, 
                token
            })
        } else {
            return res.json({
                success: false, 
                message: "user email or password is incorrect",
            }) 
        }
       
    } catch (err) {
        console.log(err.message)
        return res.json({
            success: false, 
            message: err.message
        })
    }
}

const userDetails = async (req, res) => {

    try {
        //getting the userId from the token 
        const userId = req.userId;
        console.log("userId from body:", userId);
        const userDetails = await User.findById(userId).select("-password");
        
        return res.json({
            success: true,
            data: userDetails
        })
    } catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}


const updateUser = async (req, res) => {
    try {
        const { userId, name, email, phone, address, DOB, gender } = req.body;
        const fileImage = req.file;

        // Log incoming request data for debugging
        console.log("Request body userId:", userId);
        console.log("Raw request body:", req.body);

        // Make sure address is included in the validation check if it's a required field
        if (!name || !email || !DOB || !phone || !gender) {
            return res.status(400).json({ // Use status code 400 for bad requests
                success: false,
                message: "Missing data"
            });
        }

        let updateData = {
            name,
            email,
            phone,
            DOB,
            gender,
            address: JSON.parse(address),
        };

        // Log what we’re about to update
        console.log("Update data object before DB update:", updateData);

        // If there’s an image, upload to Cloudinary first
        if (fileImage) {
            const uploadImage = await cloudinary.uploader.upload(fileImage.path, { resource_type: "image" });
            updateData.image = uploadImage.secure_url;
            console.log("Uploaded new image URL:", updateData.image);
        }

        // Find the user by userId and update their details.
        // The { new: true } option is very important here to make Mongoose return the updated document.
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        console.log("Updated user from DB:", updatedUser);

        // Check if a user was actually found and updated
        if (!updatedUser) {
            return res.status(404).json({ // Use status code 404 for not found
                success: false,
                message: 'User not found'
            });
        }

        
        return res.status(200).json({ // Use status code 200 for a successful request
            success: true,
            message: 'User info updated successfully',
            data: updatedUser
        });

    } catch (err) {
        console.error("Error in updateUser:", err.message);
        return res.json({ 
            success: false,
            message: err.message
        });
    }
};
const bookAppointment = async (req, res) => {
    
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // check doctor availability
      const docData = await Doctor.findById(docId).select("-password");
      
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available right now, please try again later!"
      });
    }

    let slotsBooked = docData.slots_booked;
      
      // if slotsBooked is a string or anything else, convert to object
        if (typeof slotsBooked !== 'object' || slotsBooked === null) {
        slotsBooked = {};
        }
      if (!slotsBooked[slotDate]) {
            slotsBooked[slotDate] = []; // the array is the times array of this slotDate
            }

            if (slotsBooked[slotDate].includes(slotTime)) {
            return res.json({
                success: false,
                message: `Sorry you cannot book this ${slotTime}, it is already booked!`
            });
            }
      //then add the slotTime to the slotsBooked to book the appointment
      slotsBooked[slotDate].push(slotTime);
      

      const updatedDoctor = await Doctor.findByIdAndUpdate(
          docId, 
        
          { slots_booked: slotsBooked }, 
          { new: true }
      )
      
    if (!updatedDoctor) {
      return res.json({
        success: false,
        message: `Slot ${slotTime} on ${slotDate} is already booked`
      });
    }

    // getting user data
    const userData = await User.findById(userId).select("-password");

    // creating the  new appointment
    const appointmentData = {
      userId,
      doctorId: docId,
      userData,
      docData: updatedDoctor, 
      amount: updatedDoctor.fees,
      slotTime,
      slotDate,
      date: Date.now()
    };

    const newAppointment = new Appointment(appointmentData);
      await newAppointment.save();
      
    console.log('new appointment in backend is:', newAppointment)
    return res.json({
      success: true,
      message: "New appointment has been booked", 
      data: newAppointment
    });

  } catch (err) {
    return res.json({
      success: false,
      message: err.message
    });
  }
};


 const getUserAppointments = async (req, res) => {
  try {
    const userId = req.userId; // coming from auth middleware

    const appointments = await Appointment.find({
      userId,
      canceled: false   
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });

  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching appointments"
    });
  }
};


const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId; // from auth middleware

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required."
      });
    }

    // Find appointment and verify ownership
    const appointment = await Appointment.findOne({ _id: appointmentId, userId });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or does not belong to the user."
      });
    }

    if (appointment.canceled) {
      return res.status(200).json({
        success: true,
        message: "Appointment is already canceled."
      });
    }

    // find the appointment as canceled
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { canceled: true },
      { new: true }
    );

    // free the doctor's slot (remove from booked slots)
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      $pull: { [`slots_booked.${appointment.slotDate}`]: appointment.slotTime }
    });

    res.status(200).json({
      success: true,
      message: `Appointment canceled successfully. Slot ${appointment.slotTime} on ${appointment.slotDate} is now available again.`,
      data: updatedAppointment,
    });


    } catch (err) {
        console.error("Error canceling appointment:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};




export {
  registerUser,
  loginUser,
  updateUser,
  userDetails,
  bookAppointment, 
  getUserAppointments,
  cancelAppointment
  
}