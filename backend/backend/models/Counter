const mongoose = require("mongoose");
const CounterSchema = new mongoose.Schema({
  _id:   String,
  value: { type: Number, default: 0 },
});
CounterSchema.statics.next = async function(name) {
  const doc = await this.findByIdAndUpdate(name, { $inc: { value: 1 } }, { new: true, upsert: true });
  return doc.value;
};
module.exports = mongoose.model("Counter", CounterSchema);