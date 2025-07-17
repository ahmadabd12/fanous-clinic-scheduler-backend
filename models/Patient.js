const mongoose = require("mongoose");

const TreatmentDetailSchema = new mongoose.Schema({
  procedure: String,
  toothCount: Number,
  costPerTooth: Number,
  totalCost: Number,
});
const PaymentHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    datePaid: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);
const PatientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  treatmentDetails: [TreatmentDetailSchema],
  treatmentStatus: String,
  paymentHistory: {
    type: [PaymentHistorySchema],
    default: [],
  },
  totalAmount: Number,
  paidAmount: Number,
  remainingAmount: Number,
  amountStatus: {
    type: String,
    default: "غير مكتمل",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Patient", PatientSchema);
