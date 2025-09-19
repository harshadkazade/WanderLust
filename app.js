const express = require("express");
const app = express();
const mongoose =require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

main().then(()=> {
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res) => {
    res.send("This is root");
});

// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing({
//         title:"my new villa",
//         description:"By the beach",
//         price:12000,
//         location:"Calangute,Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved.");
//     res.send(sampleListing);
// });

//index route
app.get("/listings", async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", {listings});
});

//new route
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    //console.log (listing);
    res.render("listings/show.ejs", {listing});
});

//create route
app.post("/listings",async (req,res) => {
    let newListing = Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//edit route
app.get("/listings/:id/edit",async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//update route
app.put("/listings/:id", async (req,res) =>{
    let id = req.params.id;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listing/:id", async (req,res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

app.listen(8080,() => {
    console.log("server is listening on port 8080");
});