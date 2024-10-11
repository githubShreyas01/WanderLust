const Listing =require("./models/listing");
const Review =require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){ //isAuth check user signed in or logged in
       // console.log(req.path, "..", req.originalUrl);
        req.session.redirectUrl = req.originalUrl;// if user not logged in we want that after login in he should be directed to the url which he was trying to access without being logged in.
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

//one problem : when we log in , passport will delete the redirectUrl which we are sending  and u will get undefined value therefore we save it in a res.locals as passport can't affect it.
module.exports.saveRedirectUrl = (req, res, next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
// if we directly click on login from all listings page we will get error - page not found (because when we are directly loggin in isLoggedIn never triggered and due to which redirectUrl is undefined as it never got saved)

//middleware for checking authority of logged in person to edit or delete listing
module.exports.isOwner = async (req, res, next) =>{
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){ // setting authorization for update route
        req.flash("error", "You are not the Owner of the listing");
         return res.redirect(`/listings/${id}`);
    }
    next();
}

//Server side validation for listing Schema
module.exports.validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//Server side validation for review Schema
module.exports.validateReview = (req, res, next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//middleware for checking authority of logged in person that is he the author of review and if yes then authority to edit or delete review
module.exports.isReviewAuthor = async (req, res, next) =>{
    const {id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){ // setting authorization for update route
        req.flash("error", "You are not the author of this review!");
         return res.redirect(`/listings/${id}`);
    }
    next();
}