

const express = require('express');
const app = express();
const axios = require("axios")
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.static(__dirname + './../build'));

app.get('*', (req, res) => {
    res.sendFile(path.resolve((__dirname + './../build/index.html')));
});

app.listen(PORT, () => {
    console.log('Server Started on ' + PORT);
    console.log('Press CTRL + C to stop server');
});
//*********************************BACKEND STARTS. BELOW IS API CALL********************************************** */

//this is for CORS so I can access the coin market cap API
const url = 'https://api.coinmarketcap.com/v1/ticker/?limit=50';
app.get('/cmcAPI', (req, res) => {
    let coinMarketCapAPI = axios.get(url);
    coinMarketCapAPI.then(response => {
        res.send(response.data);
    })
        .catch(error => {
            console.log(error);
        });
});

//*****************************AUTHORIZATION and DATABASE MIXED ***************************** */
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authorize = require('./middleware/authorize'); //middleware
const secretKeyJWT = "a12$%sdfw@K>"; //this is used to hash the password the user gives the database so that their password is not actually saved on the database

//POST endpoint for password encryption and creating user profiles AUTHORIZATION AND DATABASE code in here
app.post('/encrypt', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email
    //generate salt and create a hash the password
    bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(password, salt, (error, hash) => {
            // Store hash in the password DB. 
            if (error) console.log(error);
            //this will be making a new user input in database, takes all the user input and then uses the bitcoin basic seed
            let formInput = {
                userName: username,
                email: email,
                password: hash,
                crypto_amounts: []
            };
            //using mongo save to acutally post the user to the db
            let newUser = User(formInput);
            newUser.save()
                .then(savedUser => {
                    // console.log(formInput);
                    res.json(savedUser);
                })
                .catch(error => {
                    console.log(error);
                    res.status(400).json(error);
                })
        })
        //     .catch(error => {
        //         return res.status(500).json(error); //this is causing an error when not greened out
        //     })
    });
});

//POST endpoint for logging in to the server
app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    User.find({ "userName": username })
        .then(User => {
            let hash = User[0].password;
            //this checks the password the user provided, and hashes it, and sees if it matches the hashed password in the DB
            bcrypt.compare(password, hash, (err, result) => {
                if (result == true) {// if the passwords match, a token is created that allows for the user to access to application
                    let token = jwt.sign({ username: username }, secretKeyJWT)
                    res.status(200).json({ token: token });
                } else {
                    res.status(403).json({ error: "invalid credentials" })
                }
            })
        })
        .catch(error => {
            return res.status(500).json(error);
        })
})

//used for the authorization
app.get('/private/:token', authorize, (req, res) => {
    res.json(req.decoded.username);
});

//************************************Database stuff below only. this section is updating and getting user profile *********************************************************** */
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/data/db/');
mongoose.Promise = global.Promise
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("connected to db at /data/db");
})
const User = require('./mongo/models/user');

//once the user is actually logged in, and when the component mounts, it calls this api and it returns what the database has saved
app.get("/getPortfolio", (req, res) => {
    let portfolioUserName = req.query.username
    //console.log(portfolioUserName);
    User.find({ "userName": portfolioUserName })
        .then(singleUser => {
            return res.json(singleUser[0]['crypto_amounts']);
        })
        .catch(error => {
            return res.status(500).json(error);
        })
})

//this will be called upon whenever anything is updated, based upon componentDidUpdate
app.put('/updatePortfolio', (req, res) => {
    let jsonCrypto = JSON.parse(req.query.portfolio);
    let cryptoUpdate = {
        crypto_amounts: jsonCrypto
    };
    let query = { "userName": req.query.username }
    User.findOneAndUpdate(query, cryptoUpdate, { new: true, runValidators: true })
        .then(updatedObject => {
            //console.log(updatedObject);
            res.json(updatedObject);
        })
        .catch(err => {
            console.log(err)
            res.status(400).json({ err });
        })
});

//************************************Historical Data Seeding and Updating Below *********************************************************** */

const HistoricalData = require('./mongo/models/historicalData');
const date = 1485927000; //date chosen is Feb 1 2017 to give us four months
const addDay = 86400; // this adds a full day to the timestamp
let currentTimeStamp = Math.round((new Date()).getTime() / 1000); //grabs the curent real time 

let arrayOfCryptos = ["BTC", "ETH", "XRP", "XEM", "ETC", "LTC", "STRAT", "DASH", "XMR", "WAVES", "BCN", "SC", "DGB", "GNT", "XLM", "DOGE", "ZEC", "STEEM", "REP", "BAT",
    "GNO", "GAME", "BTS", "MAID", "FCT", "BCC", "LSK", "DGD", "DCR", "ARDR", "ROUND", "GBYTE", "KMD", "SNGLS", "ICN", "SYS", "USDT", "RDD", "RLC", "NXT",
    "PIVX", "XVG", "1ST", "ANT", "SJCX", "BTCD", "ANS", "WINGS", "UBQ", "XDN",
    "PPC", "ARK", "UNITY", "EMC", "NLG", "LKK", "AMP", "MLN", "TRST", "XCP", "MOON", "NMC", "NXS", "XAUR", "OMNI", "BURST", "BLOCK", "MCAP", "GUP", "TKN",
    "SWT", "NAV", "EXP", "TAAS", "EDG", "IOC", "EAC", "LBC", "EDR", "BAY", "YBC", "HMQ", "POT", "CLOAK", "GRC", "BCAP", "XBY", "BLK", "NXC", "GOLOS",
    "SHIFT", "RADS", "BITB", "TIME", "OBITS", "VTC", "XZC", "UNY", "B@", "IFC",];

/*this function updates the database with current dates. it was built on june 5 2017, so it will continue to grab dates onwards whenever it is turned on
 the other two functions are basically SEEDS. will said i could seperate them out so that they would be SEED files, and not have them commented like a weird big chunk
 I am assuming it is just working right now, i will check for june 6th whenever it gets uploaded 
 would be nice to have it update more than one date at a time. not going to bother now */
updateDataBase(0);
function updateDataBase(incrementToUpdateNext) {
    let query = { "symbol": arrayOfCryptos[incrementToUpdateNext] } //get the symbol. this will repeat for top 50 

    //need to find the old copy so we can check and see if we can push a new date and price onto it.
    HistoricalData.findOne({ "symbol": arrayOfCryptos[incrementToUpdateNext] })
        .then(oldVersion => {
            let latestDate = oldVersion.dateData[oldVersion.dateData.length - 1].date;
            let latestDatePlusOneDay = latestDate + addDay;
            if (latestDatePlusOneDay < currentTimeStamp) {
                //if we are one day behind or more, we run through this to get a new date
                let getNewPrices = axios.get("https://min-api.cryptocompare.com/data/pricehistorical?fsym=" + arrayOfCryptos[incrementToUpdateNext] + "&tsyms=USD&ts=" + latestDatePlusOneDay);
                getNewPrices.then(response => {
                    let newPriceForDate = response.data[arrayOfCryptos[incrementToUpdateNext]].USD
                    let newPriceAndDateData = {
                        date: latestDatePlusOneDay,
                        price: newPriceForDate,
                    }
                    oldVersion.dateData.push(newPriceAndDateData);

                    //actually update the database with the newly pushed item (note, this only does a one day update)
                    HistoricalData.findOneAndUpdate(query, oldVersion, { new: true, runValidators: true })
                        .then(updatedObject => {
                            //this if statement will make it recursiv to update one day for 50 items in the db
                            if (incrementToUpdateNext < 50) {
                                incrementToUpdateNext = incrementToUpdateNext + 1;
                                updateDataBase(incrementToUpdateNext);
                            }
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })
                    .catch(err => {
                        console.log(err)
                    })
            }
        })
        .catch(err => {
            console.log(err)
        })
}

//************************************Relationship of the user to the historical data below *********************************************************** */


app.get("/graphData", (req, res) => {
    let userCryptos = JSON.parse(req.query.userCryptos);
    console.log(userCryptos);
    let addingAllUsersCryptos = [];
    let addingArray = [];
    getAllHistoryForUser(0);
    function getAllHistoryForUser(incrementUserCryptos, callBackUpdate) {
        let symbols = userCryptos[incrementUserCryptos].symbol;
        let amount = userCryptos[incrementUserCryptos].amount;
        // console.log(symbols);
        HistoricalData.find({ "symbol": symbols })
            .then(singleHistoryData => {
                // console.log(singleHistoryData[0].dateData);
                //this is done to take your actual portfolio value. it multiples the amount you own by what it was worth that date :)
                let multipleByAmount = (singleHistoryData[0].dateData).map((element, i) => {
                    element.price = element.price * amount;
                    return element;
                })
                //console.log(singleHistoryData);
                // console.log(multipleByAmount);
                //    console.log(symbols);
                if (incrementUserCryptos === 0) {
                    addingAllUsersCryptos = singleHistoryData[0].dateData;
                    // console.log(addingAllUsersCryptos);
                    if (incrementUserCryptos < (userCryptos.length - 1)) {
                        incrementUserCryptos = incrementUserCryptos + 1;
                        //   console.log(symbols);
                        //addingAllUsersCrypto here is a fully multipled instance of one ETH, or BTC for a whole 125 days
                        getAllHistoryForUser(incrementUserCryptos, addingAllUsersCryptos);
                    }
                } else {
                    //console.log(singleHistoryData);
                    //adding array starts off blank. in the first case, callBackUpdate is the old array. singleHistroyData is the new one 
                    //so on the third one, callBackUpdate will be 1 and 2 added. singleHistoryData will be num 3 . etc 
                    addingArray = callBackUpdate.map((fullDateObject, i) => {
                        //console.log(fullDateObject.date);
                        //  console.log(singleHistoryData);
                        let newDate = singleHistoryData[0].dateData[i].date;
                        if (fullDateObject.date === newDate) {
                            // console.log(fullDateObject.price + " " + symbols);
                            fullDateObject.price = fullDateObject.price + singleHistoryData[0].dateData[i].price;
                            //console.log(fullDateObject.price + " " + i);
                            return fullDateObject;
                        }
                    })
                    //  console.log(symbols);
                    //this should get inputs of 1, 2 and 3. but apparently i am getting inputs of 1 and 1 
                    if (incrementUserCryptos < (userCryptos.length - 1)) {
                        // console.log(incrementUserCryptos);
                        incrementUserCryptos = incrementUserCryptos + 1;
                        // console.log(addingArray[addingArray.length -1]);
                        getAllHistoryForUser(incrementUserCryptos, addingArray);
                    } else {
                        res.json(addingArray);
                        /*    let combinedArray = [];
                            let dateArray = addingArray.map((element)=>{
                                return element.date
                            })
                            let priceArray = addingArray.map((element)=>{
                                return element.price
                            })
                            combinedArray.push(dateArray);
                            combinedArray.push(priceArray);
                            res.json(combinedArray);*/
                    }

                }
            })
    }
})











/*This code is for seeding the database. Normally I would put this in another file, but I built it in here so I am not going to worry about it for now

//starting at zero ot get the first crypto
grabTopFiftyCryptos(51);

function grabTopFiftyCryptos (cryptoIncrement){

    /*it used to try to grad the top 50 from a live list, but it had trouble with seed them all without crashing. so I hard coded the top 50 
    //const grabFifty = 'https://api.coinmarketcap.com/v1/ticker/?limit=50';
    //let threeLetter = "";
    //let fiftyAPI = axios.get(grabFifty);
    //fiftyAPI.then(response => {
    */
/*    let historyInput = {
        symbol: arrayOfCryptos[cryptoIncrement],
        dateData: [],
    }    
    let newHistory = HistoricalData(historyInput);
    newHistory.save()
        .then(savedHistory => {
            historicalData(date, historyInput.symbol, historyInput)
            if (cryptoIncrement < 75) {
                cryptoIncrement = cryptoIncrement + 1;
                grabTopFiftyCryptos(cryptoIncrement);
            }
        })
        .catch(error => {
            console.log(error);
        })
   })
    .catch(error => {
        console.log(error);
    });
}; 

//lets do last two years, how to pull the three letters? pull from DB
function historicalData (dailyTimeStamp, threeLetter, updatedHistoryCallback) {
    let query = {"symbol": threeLetter}

    let getHistoricalPrices = axios.get("https://min-api.cryptocompare.com/data/pricehistorical?fsym="+ threeLetter +"&tsyms=USD&ts="+ dailyTimeStamp);
    getHistoricalPrices.then(response => {
        let newPriceForDate = response.data[threeLetter].USD
        let priceAndDateData = {
            date: dailyTimeStamp,
            price: newPriceForDate,
        }
        updatedHistoryCallback.dateData.push(priceAndDateData);
        HistoricalData.findOneAndUpdate(query, updatedHistoryCallback, { new:true, runValidators:true })
            .then(updatedObject => {
                if (dailyTimeStamp < currentTimeStamp) {
                    dailyTimeStamp = dailyTimeStamp + addDay;
                    historicalData(dailyTimeStamp, threeLetter, updatedHistoryCallback);
                }
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({err});
            })

        })
    .catch(error => {
        console.log(error);
    });
    console.log(threeLetter + " one update");
}
*/