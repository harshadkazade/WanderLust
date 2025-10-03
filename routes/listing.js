const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema }= require("../Schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400,msg);
    }else{
        next();
    }
}

//index route
router.get("/", wrapAsync( async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", {listings});
}));

//new route
router.get("/new",(req,res) => {
    res.render("listings/new.ejs");
});

//show listing route
router.get("/:id", wrapAsync( async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id).populate("reviews");
    //console.log (listing);
    if(!listing){
        req.flash("error","Listing you Requsted for does not Exists!");
        res.redirect("/listings");
    }else{
        res.render("listings/show.ejs", {listing});
    }
    
}));

//create listing route
router.post("/", validateListing, wrapAsync( async (req,res,next) => {
    
    let newListing = Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing added!");
    res.redirect("/listings");
}));

//edit listing route
router.get("/:id/edit", wrapAsync( async (req,res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update listing route
router.put("/:id", validateListing, wrapAsync( async (req,res) =>{
    if(! req.body){
        throw(new ExpressError(400,"send valid data for listing"));
    }
    let id = req.params.id;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success", "Listing edited!");
    res.redirect(`/listings/${id}`);
}));

//delete listing route
router.delete("/:id", wrapAsync( async (req,res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;