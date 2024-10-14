const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

router.route("/")
.get(wrapAsync(listingController.index)) //Index Route
.post(isLoggedIn, validateListing, wrapAsync(listingController.createListing)); //Create Route

// New Route
router.get("/new",isLoggedIn,  listingController.renderNewForm );

router.route("/:id")
.get( wrapAsync(listingController.showListing)) // Show Route
.put(isLoggedIn,isOwner, wrapAsync(listingController.updateListing)) //Update Route
.delete(isLoggedIn,isOwner,  wrapAsync(listingController.destroyListing)); //Delete Route





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
router.get("/:id/edit",isLoggedIn,isOwner,  wrapAsync(listingController.renderEditForm));


// old Update Route
// router.put("/:id", wrapAsync(async (req, res) =>{
//     let {id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
//         let url = req.body.listing.image;
//         listing.image.url = {url};
//         await listing.save();
//     res.redirect(`/listings/${id}`);
// }));

module.exports = router;