const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  serviceId: String,
  serviceName: String,
  price: Number,
});

const AppointmentSchema = new mongoose.Schema({
  patientId: String,
  patientName: String,
  date: String,
  time: String,
  endTime: String,
  services: [ServiceSchema],
  totalAmount: Number,
  status: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
