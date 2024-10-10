module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){ //isAuth check user signed in or logged in
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}