import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // if you have a User model
        required: true,
        }, 
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",    //  tells Mongoose to link to Doctor model
        required: true,
        }, 
    slotDate: {
        type: String,
        require: true,
    },
    slotTime: {
        type: String,
        require: true,
    }, 
    userData: {
        type: Object,
        require: true,
    },
    docData: {
        type: Object, 
        require: true,
    }, 
    amount: {
        type: Number,
        require: true,
    }, 
    date: {
        type: Number,
        require: true,
    }, 
    canceled: {
        type: Boolean,
        default: false,
    }, 
    onlinePayment: {
        type: Boolean, 
        default: false,
    }, 
    completed: {
        type: Boolean,
        default: false,
        },

})

const appointmentModel = mongoose.model.Appointment || mongoose.model("Appointment", appointmentSchema);
export default appointmentModel;