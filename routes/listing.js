const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

//Server side validation for listing Schema
const validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//Index Route
router.get("/",  wrapAsync(async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

// New Route
router.get("/new", (req, res) =>{
    res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews"); // populate used to show data of reviews array
    if(!listing){
        req.flash("error", "Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    console.log(req.body); // Log the request body
    const { listing } = req.body;
    const newListing = new Listing(listing);
    const { url } = req.body.listing.image;
    const filename = "listingimage"; // or however you want to handle the filename
    if (typeof url === 'string') {
        newListing.image = { url, filename };
    } else {
        throw new Error('Invalid image URL');
    }
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

// //Create Route
// router.post("/",  wrapAsync(async (req, res, next) =>{
//     let listing = req.body.listing;
//     const newListing = new Listing(listing);
//     let url = req.body.listing.image;        
//     let filename = "listingimage"; 
//     newListing.image = {url, filename};
//     await newListing.save();
//     res.redirect("/listings");
// })
// );

//Edit Route
router.get("/:id/edit",wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}));

router.put("/:id", wrapAsync(async (req, res) => {
    console.log(req.body); // Log the request body
    const { id } = req.params;
    const { listing } = req.body;
    const updatedListing = await Listing.findByIdAndUpdate(id, listing, { new: true });

    if (req.body.listing.image && req.body.listing.image.url) {
        updatedListing.image.url = req.body.listing.image.url;
    }

    await updatedListing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// //Update Route
// router.put("/:id", wrapAsync(async (req, res) =>{
//     let {id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
//         let url = req.body.listing.image;
//         listing.image.url = {url};
//         await listing.save();
//     res.redirect(`/listings/${id}`);
// }));

//Delete Route
router.delete("/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;