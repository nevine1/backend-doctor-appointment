import Appointment from "../models/appointmentModel.js";
import Doctor from '../models/doctorModel.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//  Start checkout session
const onlinePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId).populate("doctorId");
    if (!appointment) {
      return res.json({ success: false, message: "This appointment not found!" });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: appointment.doctorId.fees * 100,
            product_data: {
              name: `Appointment with ${appointment.doctorId.name}`,
              description: `For ${appointment.doctorId.speciality} on ${appointment.slotDate} at ${appointment.slotTime}`,
              images: [appointment.doctorId.image],
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/myAppointments/checkout?success=true&appointmentId=${appointment._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/myAppointments/checkout?canceled=true`,
    });

    return res.json({
      success: true,
      url: session.url,
      appointmentId: appointment._id,
      paymentIntentId: session.payment_intent,
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Confirm payment after checkout
const confirmPayment = async (req, res) => {
  try {
    const { appointmentId, paymentIntentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.onlinePayment = true;
    appointment.paymentIntentId = paymentIntentId;
    appointment.isCompleted = true;
    appointment.isPaid = true; 

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment confirmed & paid",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error confirming payment",
      error: error.message
    });
  }
};

// get Stripe session
const getSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json(session);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving session",
      error: err.message
    });
  }
};



//cancel payment
const cancelPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // make appointment as canceled (not paid)
    appointment.canceled = true;
    appointment.onlinePayment = false;
    appointment.isPaid = false;

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment canceled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error canceling payment",
      error: error.message,
    });
  }
};



export { onlinePayment, confirmPayment, getSession , cancelPayment};
