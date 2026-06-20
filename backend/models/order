const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  num:        { type: Number, required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tableId:    { type: String },
  tableNum:   { type: Number },
  customer:   { type: String, default: "Guest" },
  customerId: { type: String },
  items:      [{
    id:    Number,
    name:  String,
    emoji: String,
    price: Number,
    tax:   Number,
    qty:   Number,
  }],
  sub:       Number,
  tax:       Number,
  disc:      { type: Number, default: 0 },
  discLabel: String,
  total:     Number,
  payMethod: String,
  status:    { type: String, enum: ["draft","paid","cancelled"], default: "draft" },
  date:      { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.model("Order", OrderSchema);