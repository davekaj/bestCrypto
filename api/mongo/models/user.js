const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: {type: String, required: true, unique: true},
    password: String,
    email: {type: String, required: true, unique: true},
   // _id: String, //i think this will be populated by mongo
    //will be token data, will incorpate once everything else is working **************
    //some_authorization_data: String, //not sure what it will look like right now. i think it is the cryptic password . so this may not exist 
    crypto_amounts: [{
        text: String,
        amount: Number,
        price: Number,
        originalPrice: Number,
        symbol: String,
    }]
})

const User = mongoose.model("user", UserSchema)

module.exports = User
