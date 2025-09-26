const express = require("express");
const app = express();
const mongoose =require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const  listeningSchema  = require("./Schema.js");

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

const validateListing = (req,res,next) => {
    let {error} = listeningSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

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
app.get("/listings", wrapAsync( async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", {listings});
}));

//new route
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", wrapAsync( async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    //console.log (listing);
    res.render("listings/show.ejs", {listing});
}));

//create route
app.post("/listings", validateListing, wrapAsync( async (req,res,next) => {
    
    let newListing = Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit", wrapAsync( async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id", validateListing, wrapAsync( async (req,res) =>{
    if(! req.body){
        throw(new ExpressError(400,"send valid data for listing"));
    }
    let id = req.params.id;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync( async (req,res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

app.all("/{*any}", (req, res,next)=>{
    next(new ExpressError(404, "Page not found!"));
});

app.use((err,req,res,next) => {
     let {statusCode=500,message= "something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{err});
});

app.listen(8080,() => {
    console.log("server is listening on port 8080");
});