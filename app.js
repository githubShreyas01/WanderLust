const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
    console.log("connected to db");
    })
    .catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expire: Date.now() + 1000*60*60*24*3,
        maxAge: 1000*60*60*24*3,
    },
};

app.get("/", (req, res) =>{
    res.send("HI root");
});

app.use(session(sessionOptions)); // flash and passport both will use session
app.use(flash());

app.use(passport.initialize()); // initialize passport whenever a req comes
app.use(passport.session()); // web app needs ability to identify user as they browse from page to page, the series of req and res each associated with same user 
passport.use(new LocalStrategy(User.authenticate())); // user should be authenticated from this local strategy and to auth use authenticate method which is static added by local-mongoose

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); // store user related info is serialize
passport.deserializeUser(User.deserializeUser());// unstoring or removing of user related data is deserialize

//Middleware for using flash msg
app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async (req, res) =>{
    let fakeUser = new User({
        email: "student@lnct.com",
        username: "mernstack-student",
    });
    let registeredUser = await User.register(fakeUser, "helloworld"); //register method is static and Convenience method to register a new user instance with a given password. Checks if username is unique
    res.send(registeredUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//User searching for invalid or not existing route or page
app.all("*",(req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
});

//Error Handling MiddleWare
app.use((err, req, res, next) =>{
    let{statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () =>{
    console.log("listening to 8080 port");
});
