const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  color: { type: String, default: "#E8A020" },
}, { timestamps: true });
module.exports = mongoose.model("Category", CategorySchema);