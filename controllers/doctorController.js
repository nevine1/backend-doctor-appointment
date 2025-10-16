import Doctor from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Appointment from '../models/appointmentModel.js'
import { v2 as cloudinary } from 'cloudinary'
const changeAvailability = async (req, res) => {
    try {
        
        const { docId } = req.body; 
        const docInfo = await Doctor.findById(docId).select("-password");

        const finalDoctorInfo = await Doctor.findByIdAndUpdate(docId, { available: !docInfo.available })
        return res.json({
            success: true,
            message: "Doctor availability changed successfully", 
            data: finalDoctorInfo,
        })
    } catch (err) {
        console.log(err.message);
        return res.json({
            success: false,
            message: err.message
        })
    }
}

//get all doctors

const getDoctors = async (req, res) => {
  try {
    
    const doctors = await Doctor.find({}).select(['-password', '-email'])
    
    return res.json({
      success: true, data: doctors
    })
  } catch(err) {
    return res.json({
      success: false,
      message: err.message
    })
  }
}

const getDoctorData = async (req, res) => {
  try {
    const { id } = req.params; 
    const doctor = await Doctor.findById(id).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
console.log("getting doctor data is", doctor )
    return res.status(200).json({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
    
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const doctorLogin = async (req, res) => {

  try {
    const { email, password } = req.body; 
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.json({
        success: false,
        message: "Invalid credentials"
      })
    }

    // check if the req.body(email and password) matching with email & password at the database
    const isMatchedPassword = await bcrypt.compare(password, doctor.password); //doctor.password is the one getting from database
    //if password is the same of doctor.password it means it is true, then get the token and login  
    
    if (isMatchedPassword) {
      //it the password is the same , then return token
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      return res.json({
        success: true,
        message: "doctor logged in successfully", 
         token
      })

    } else {
      return res.json({
        success: false, 
        message: "Invalid credentials"
      })
    }

  } catch (err) {
    return res.json({
      success: false, 
      message: err.message
    })
  }
}

//api for getting doctor appointments 
 const getDoctorAppointments = async (req, res) => {
  try {
    // doctorId comes from the decoded token(when the doctor login)
    const docId = req.doctor._id;

    const appointments = await Appointment.find({ doctorId: docId });

    return res.json({
      success: true,
      data: appointments,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//api to make the appointments completed for doctor panel
const doctorCompleteAppointment = async (req, res) => {
  try {
    
    const { appointmentId } = req.body
    const docId = req.doctor._id

    const appointmentData = await Appointment.findById(appointmentId);
   
    if (appointmentData && appointmentData.doctorId.toString() === docId.toString()) { //getting docId from the doctorAuth
      const completedAppointments = await Appointment.findByIdAndUpdate(appointmentId,
        { completed: true },
        { new: true}
      )
      return res.json({
        success: true,
        message: "Appointment completed", 
        data: completedAppointments
      })
    } else {
      return res.json({
        success: false,
        message: "Appointment is not completed"
      })
    }
  } catch (err) {
    return res.json({
      success: false, 
      message: "Appointment is false"
    })
  }
}

//api to make the appointments completed for doctor panel
const doctorCancelAppointment = async (req, res) => {
  try {
    
    const { appointmentId } = req.body
    const docId = req.doctor._id

    const appointmentData = await Appointment.findById(appointmentId);
   
    if (appointmentData && appointmentData.doctorId.toString() === docId.toString()) { //getting docId from the doctorAuth
      const canceledAppointment = await Appointment.findByIdAndUpdate(appointmentId,
        { canceled: true },
        { new: true}
      )
      return res.json({
        success: true,
        message: "Appointment canceled", 
        data: canceledAppointment
      })

    } else {
      return res.json({
        success: false,
        message: "Appointment is not canceled"
      })
    }
  } catch (err) {
    return res.json({
      success: false, 
      message: "Appointment is false"
    })
  }
}

//api for doctor dashboard
const doctorDashboardData = async (req , res) => {
  try {
    const doctorId = req.doctor._id; 
    const appointments = await Appointment.find({ doctorId })

    //calculate the total earning money
    let earnings = 0; 
    appointments.map((item) => {
      if (item.completed || item.onlinePayment) {
        earnings += item.amount; 
      }
    })
    //get the # of patients
    let patients = []
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId)
      }
    })
    
    //doctor dashboard data 
    const docDashboardData = {
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5), 
      earnings
    }

    return res.json({
      success: true,
      data: docDashboardData
    })
  } catch (err) {
    console.log(err.message)
    return res.json({
      success: false, 
      message: err.message
    })
  }
}

// api for doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    
    const docId = req.doctor._id;
    const doctor = await Doctor.findById(docId);
    if (!doctor) {
      return res.json({
      success: false, 
      message: "doctor not found"
    })
    }

    return res.json({
      success: true,
      data: doctor
    })
  } catch (err) {
    return res.json({
      success: false, 
      message: err.message
    })
  }
}

// api to update doctor's profile
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.doctor._id;
      const {  name, email , about, experience , speciality, address , degree, fees } = req.body
    const fileImage = req.file;

    if ( !docId || !name || !email || !experience || !about || !speciality || !address || !degree || !fees) {
      return res.json({
        success: false, 
        message: "Missing doctor's data"
      })
    }
    const doctor = await Doctor.findById(docId);
    if (!docId || !doctor) {
      return res.json({
        success: false, 
        message: "Doctor is not found"
      })
    }
    
    const updatedDoctorInfo = {
      name, 
      email,
      speciality,
      experience,
      about,
      fees,
      degree,
      address: JSON.parse(address),
    }
      // if a new image was uploaded, upload to Cloudinary
    if (fileImage) {
      const uploadImage = await cloudinary.uploader.upload(fileImage.path, {
        resource_type: "image",
      });
      updatedDoctorInfo.image = uploadImage.secure_url;
      console.log("Uploaded new image URL:", updatedDoctorInfo.image);
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(docId, updatedDoctorInfo, { new: true });

    return res.json({
      success: true, 
      message: "Doctor profile has been successfully updated!",
      data: updatedDoctor
    })
  
  } catch (err) {
     return res.json({
      success: false, 
      message: err.message
    })
  }

}

export  {
    changeAvailability,
    getDoctors,
    getDoctorData,
    doctorLogin,
    getDoctorAppointments,
    doctorCompleteAppointment,
    doctorCancelAppointment,
    doctorDashboardData,
  getDoctorProfile,
    updateDoctorProfile
    }