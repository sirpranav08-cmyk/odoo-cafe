
const mongoose=require("mongoose");

const ProductSchema=new mongoose.Schema({
 name:String,
 category:Number,
 price:Number,
 tax:Number,
 uom:String,
 desc:String,
 emoji:String
});

module.exports=mongoose.model("Product",ProductSchema);
