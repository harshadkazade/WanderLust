const express = require("express");
const app = express();
const mongoose =require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Joi = require("joi");
const {listingSchema,reviewSchema }= require("./Schema.js");
const Review = require("./models/reviews.js");

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
// app.use(express.json()); // to parse JSON bodies


const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400,msg);
    }else{
        next();
    }
}

const validateReview = (req,res,next) => {
    let {error, value} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400,msg);
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
//         price:12000,req
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

//show listing route
app.get("/listings/:id", wrapAsync( async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id).populate("reviews");
    //console.log (listing);
    res.render("listings/show.ejs", {listing});
}));

//create listing route
app.post("/listings", validateListing, wrapAsync( async (req,res,next) => {
    
    let newListing = Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//edit listing route
app.get("/listings/:id/edit", wrapAsync( async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update listing route
app.put("/listings/:id", validateListing, wrapAsync( async (req,res) =>{
    if(! req.body){
        throw(new ExpressError(400,"send valid data for listing"));
    }
    let id = req.params.id;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete listing route
app.delete("/listings/:id", wrapAsync( async (req,res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//reviews
//post review route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req ,res) => {
    let listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing.id}`)
}));

//delete review route 
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req,res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`)
}))

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