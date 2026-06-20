
const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");

const Product=require("./models/Product");

const app=express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/odooCafe")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.get("/products", async(req,res)=>{
 const data=await Product.find();
 res.json(data);
});

app.post("/products", async(req,res)=>{
 const p=new Product(req.body);
 await p.save();
 res.json(p);
});

app.listen(3000, ()=>console.log("Server running on port 3000"));
