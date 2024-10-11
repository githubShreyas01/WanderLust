const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");


//Index Route
router.get("/",  wrapAsync(async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

// New Route
router.get("/new",isLoggedIn,  (req, res) =>{
    res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {
        path: "author",// we want with every listing reviews get printed along with every review its author also gets printed  
        }
    })
    .populate("owner"); // populate used to show data of reviews array
    if(!listing){
        req.flash("error", "Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
}));

 //Create Route
router.post("/",isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    console.log(req.body); // Log the request body
    const { listing } = req.body;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
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

// old Create Route
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
router.get("/:id/edit",isLoggedIn,isOwner,  wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
router.put("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
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

// old Update Route
// router.put("/:id", wrapAsync(async (req, res) =>{
//     let {id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
//         let url = req.body.listing.image;
//         listing.image.url = {url};
//         await listing.save();
//     res.redirect(`/listings/${id}`);
// }));

//Delete Route
router.delete("/:id",isLoggedIn,isOwner,  wrapAsync(async (req, res) =>{
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;