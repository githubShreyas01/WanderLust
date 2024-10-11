const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

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

const initDB = async() =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "67078788b966cdfbfed4548c",}));// instead of updating owner for each in data.js we have done it here and as map fn create new arr, we are storing the same back to the arr
    await Listing.insertMany(initData.data);
    console.log("data initialized");
};

initDB();
