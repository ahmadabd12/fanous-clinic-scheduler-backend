const mongoose = require("mongoose");

const TreatmentDetailSchema = new mongoose.Schema({
  procedure: String,
  toothCount: Number,
  costPerTooth: Number,
  totalCost: Number,
});

const PatientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  treatmentDetails: [TreatmentDetailSchema],
  totalAmount: Number,
  paidAmount: Number,
  remainingAmount: Number,
  treatmentStatus: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Patient", PatientSchema);
