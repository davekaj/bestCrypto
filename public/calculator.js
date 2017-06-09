import React from 'react';
import './App.css';
import axios from 'axios';
import {appleStock} from '@vx/mock-data';
import { scaleTime, scaleLinear} from '@vx/scale';
import { extent, max } from 'd3-array';
import { AreaClosed } from '@vx/shape';
import { Rows, Columns } from '@vx/grid';
import { curveMonotoneX } from '@vx/curve';
import { LinearGradient } from '@vx/gradient';
import { Group } from '@vx/group';
import { AxisLeft, AxisBottom } from '@vx/gradient';

const currency = 'https://openexchangerates.org/api/latest.json?app_id=08f3469489ec48b9a3d673bd4dbace51'
const backendServer = 'http://localhost:8080';

//main component of the app is the calculator. it does most of the work 
class Calculator extends React.Component {
	constructor() {
		super();
		this.state = {
			singleCrypto: [],
			currencyRate: 1.00, //starts at 1.00 as default for USD
			currencyName: "USD",
			authorization: { data: null, loading: true, auth: false }
		}

		this.addCryptoLine = this.addCryptoLine.bind(this);
		this.updateAmountOfCrypto = this.updateAmountOfCrypto.bind(this);
		this.updateCryptoPricesAPI = this.updateCryptoPricesAPI.bind(this);
		this.callCurrencyAPI = this.callCurrencyAPI.bind(this);
		this.deleteCryptoLine = this.deleteCryptoLine.bind(this);
		this.recordOriginalPrice = this.recordOriginalPrice.bind(this);
	}

	componentWillMount() {
		//this is getting the value from the query string that was passed to us from the login page. 
		//it is a bit redundant as we could just take the query string. but it is more robust
		let queryString = window.location.search;
		let searchParams = new URLSearchParams(queryString);
		let username = searchParams.get("username")

		console.log(typeof (localStorage.authToken));
		//checks authorization of the person trying to log in.
		if (localStorage.authToken !== "undefined" && localStorage.authToken !== undefined && localStorage.authToken !== null && username !== null) {
			console.log(typeof (localStorage.authToken));

			axios.get('http://localhost:8080/private/' + localStorage.authToken)
				.then((res) => {
					console.log(res);
					if (res.status === 200) {
						let tokenData = res.data;
						axios.get("http://localhost:8080/getPortfolio?username=" + username)
							.then((res) => {
								if (res.status === 200) {
									this.setState(
										{
											authorization: {
												loading: false,
												auth: true,
												data: tokenData
											},
											singleCrypto: res.data //needs to be res.data not res.data[0]
										})
									//here is where I will build out the axios call to get the backend to give me the historical data to vizualize my own profile
									let stringAllCryptosForHistory = JSON.stringify(this.state.singleCrypto)
									console.log(stringAllCryptosForHistory);
									axios.get("http://localhost:8080/graphData?userCryptos=" + stringAllCryptosForHistory)
										.then((res) => {
											console.log(res)
										})
										.catch(error => {
											console.log(error);
										})



								}
							})
					}
				})
		} else {
			location.href = 'http://localhost:3000/login';
		}

		//	let userCurrencysForHistory = this.state;
		//	console.log(userCurrencysForHistory);


	}

	//this method takes user input, and makes a new list. name will be the user input. price auto updates when this item is created. all prices for all cryptos will update
	addCryptoLine(newItem) {
		//getting the three letter symbol, like ETH, or GNT
		let newItemSymbol = "";
		let getThreeLetterSymbol = axios.get(`${backendServer}/cmcAPI`);
		getThreeLetterSymbol.then(response => {
			for (let j = 0; j < response.data.length; j++) {
				if (newItem.toLowerCase() === response.data[j].name.toLowerCase()) {
					newItemSymbol = response.data[j].symbol;
					break;
				}
			}

			let copyOfList = this.state.singleCrypto.slice();
			let newObjectList = {
				text: newItem,
				price: 0.00,
				amount: 0,
				originalPrice: 0.00,
				symbol: newItemSymbol,
			};
			copyOfList.push(newObjectList);

			this.setState({
				singleCrypto: copyOfList,
			})
			let neededForOriginalPrice = "not undefined"; // i need to just pass a value in, as a condition. the condition is only valid when a new crypto is added to the list, thus avoiding updating the "original price"
			this.updateCryptoPricesAPI(neededForOriginalPrice);
		})
	}

	recordOriginalPrice() {
		let copyState = this.state.singleCrypto.slice()
		copyState[copyState.length - 1].originalPrice = copyState[copyState.length - 1].price;
		this.setState({
			singleCrypto: copyState,
		})
	}

	//this updates the crypto incase the user has changed the amount he owns 
	updateAmountOfCrypto(newAmount) {
		let copyCryptosUpdateAmount = this.state.singleCrypto.slice();
		let indexOfUpdatedCrypto = copyCryptosUpdateAmount.findIndex((element, index) => {
			return element.text === newAmount.text; // this is saying when you find the names that match, return the index of the one that matches
		})
		copyCryptosUpdateAmount[indexOfUpdatedCrypto] = newAmount; // with the index the old object is fully replaced with the new
		this.setState({
			singleCrypto: copyCryptosUpdateAmount,
		})
	}


	//calling the currency values vs. USD amounts to change the denomination
	callCurrencyAPI(e) {
		let selectedCurrency = e.target.value;
		let currencyAPI = axios.get(currency);
		currencyAPI.then(response => {
			this.setState({
				currencyRate: response.data.rates[selectedCurrency],
				currencyName: selectedCurrency,
			})
		})
			.catch(error => {
				console.log(error);
			});
	}

	// calling the API to the backend server, which connects to coinmarketcap, which must be done because of CORS
	updateCryptoPricesAPI(neededForOriginalPrice) {
		let getListOfCoins = axios.get(`${backendServer}/cmcAPI`);
		getListOfCoins.then(response => {
			let updateAllPrices = this.state.singleCrypto.slice();
			//did a double for loop, as I couldn't figure out which higher order functions to choose. this loop finds all the existing cryptos [i] and then goes out and loops all cryptos till it finds the [j] crypto and its USD price
			for (let i = 0; i < updateAllPrices.length; i++) {
				for (let j = 0; j < response.data.length; j++) {
					if (updateAllPrices[i].text.toLowerCase() === response.data[j].name.toLowerCase()) {
						updateAllPrices[i].price = response.data[j].price_usd;
						break;
					}
				}
			}
			this.setState({
				singleCrypto: updateAllPrices
			})
			if (neededForOriginalPrice !== undefined) { //only used when an new crypto is added to make the originalPrice only updated once
				this.recordOriginalPrice();
			}
		})
			.catch(error => {
				console.log(error);
			});
	}
	//function used to delete a crypto that the person doesn't want anymore
	deleteCryptoLine(removeItem) {
		let copy = this.state.singleCrypto.slice();
		let index;
		for (let i = 0; i < copy.length; i++) {
			if (copy[i].text === removeItem.target.name)
				index = i;
		}
		copy.splice(index, 1)
		this.setState({
			singleCrypto: copy,
		})
	}

	render() {
		let chosenCurrencyRate = ["USD", "AUD", "CAD", "CNY", "EUR", "GBP", "HKD", "JPY", "KRW"]; //choosing just the top 9 right now. to add all currencies is a little pointless and a lot of extra work
		let queryString = window.location.search;
		let searchParams = new URLSearchParams(queryString);
		let username = searchParams.get("username")

		//just makes a dropdown menu with the above 9 items. plugged in below
		let dropDownCurrencies = chosenCurrencyRate.map((oneCurrency, i) => {
			return (
				<option value={oneCurrency} key={i}>{oneCurrency}</option>
			)
		})
		return (
			<div className="container">
				<h1 className="text-center">{username}'s Portfolio</h1>
				<div>
					<p>How to use the app</p>
					<ul>
						<li>Add a cryptocurrency in the add bar. Search results will automatically pupulate</li>
						<li>Choose your currency with the button at the top right</li>
						<li>Choose the amount you own and submit it to save your data</li>
						<li>Delete the Cryptocurrency from your portfolio with the red X if you no longer want it</li>
					</ul>
				</div>
				<div className="row text-right list-text white">
					Choose your countries currency : &nbsp;
					<select className="dropdown" onClick={(e) => { this.callCurrencyAPI(e) }}>
						{dropDownCurrencies}
					</select>
				</div>
				<div>
					<AddNewCrypto onSubmitProp={this.addCryptoLine}> </AddNewCrypto><br></br>
					<RenderCryptoList currentCryptoList={this.state.singleCrypto} updateAmount={this.updateAmountOfCrypto} updateCryptoPricesAPI={this.updateCryptoPricesAPI} deleteCryptoLine={this.deleteCryptoLine} currencyState={this.state.currencyRate} currencyName={this.state.currencyName}></RenderCryptoList>
					<UserGraph></UserGraph>
				</div>
			</div>
		)
	}

	//every time the user makes an update this will go and update the database
	componentDidUpdate() {
		let queryString = window.location.search;
		let searchParams = new URLSearchParams(queryString);
		let username = searchParams.get("username")
		let stringCryptoData = JSON.stringify(this.state.singleCrypto);
		axios.put("http://localhost:8080/updatePortfolio?username=" + username + "&portfolio=" + stringCryptoData)
			.then((res) => {
				if (res.status === 200) {
					console.log("database updated successfully");
				}
			})
	}
}
//**************************************Calulator ends. ********************************************** */

//this renders the list from the user inputs. it will also update it. 
class RenderCryptoList extends React.Component {
	constructor(props) {
		super(props);
		this.onInputList = this.onInputList.bind(this);
		this.onSubmitList = this.onSubmitList.bind(this);
		this.state = {
			updateAmountState: {},
		}
	}

	//updates the state of the child component so it is up to date when the form will be submitted
	onInputList(e) {
		this.setState({
			//had to use title for price, since I ran out of ways to transport the data. THERE HAS TO BE A BETTER WAY. Jin said don't build out state as a state that is an object. build it out as the indiviudal pieces of the object. since react can only go one level deep 
			updateAmountState: { text: e.target.name, price: e.target.title, originalPrice: e.target.className, amount: e.target.value, symbol: e.target.id },
		});
	}
	//this strickly deals with updating the amount of crypto a person owns, and sending it back to the parent
	onSubmitList(e, ref) {
		e.preventDefault();
		this.props.updateAmount(this.state.updateAmountState);
		this.props.updateCryptoPricesAPI();
		this.refs[ref].value = ""; //clearing input whenever the user enters anything!
	}

	render() {
		const list = this.props.currentCryptoList;
		const rate = this.props.currencyState;
		const mappedList = list.map((oneCrypto, i) => {
			return (
				//this is creating one single row of a crypto. but it maps to make multiple
				<form onSubmit={(e) => { this.onSubmitList(e, `clearAmount${i}`) }} key={i}>
					<li className="customList col-xs-12" >
						<span className="col-xs-12 col-sm-5 col-md-5 col-lg-5" id="listBorders">
							<div>
								<label>{list[i].text}</label>
							</div>
							<div>
								<input type="text" style={{ width: '200px' }} placeholder="insert amount you own" onChange={this.onInputList} name={list[i].text} id={list[i].symbol} title={list[i].price} ref={`clearAmount${i}`} className={list[i].originalPrice}></input>
								<span> </span>
								<button type="submit" value="Submit" className="btn">Submit</button>
							</div>
							<div>Amount of {list[i].text} You Own {Number(list[i].amount).toFixed(2)}</div>
						</span>
						<span className="col-xs-12 col-sm-2 col-md-2 col-lg-2" id="listBorders">
							<div> Current Price</div>
							<div>${(list[i].price < 0.01) ? Number(list[i].price * rate).toPrecision(2) : Number(list[i].price * rate).toFixed(2)}</div>
							<div> Purchase Price</div>
							<div> ${(list[i].originalPrice * rate).toFixed(2)} </div>
						</span>
						<span className="col-xs-12 col-sm-2 col-md-2 col-lg-2" id="">
							<div>Book Value </div>
							<div>${(list[i].amount * list[i].originalPrice * rate).toFixed(2)}</div>
							<div>Market Value </div>
							<div>${(list[i].amount * list[i].price * rate).toFixed(2)}</div>
						</span>
						<span className="col-xs-12 col-sm-2 col-md-2 col-lg-2" id="listBorders leftBorder">
							<div>Percentage Change</div>
							<div id={`${(list[i].price >= list[i].originalPrice) ? "gains" : "losses"}`}>{(list[i].amount === 0) ? 0 : (100 * (list[i].amount * list[i].price * rate) / (list[i].amount * list[i].originalPrice * rate) - 100).toFixed(2)}%</div>
							<div>Change in Dollars</div>
							<div id={`${(list[i].price >= list[i].originalPrice) ? "gains" : "losses"}`}> ${((list[i].amount * list[i].price * rate) - (list[i].amount * list[i].originalPrice * rate)).toFixed(2)}</div>
						</span>
						<span className="col-xs-12 col-sm-1 col-md-1 col-lg-1">
							<button onClick={(e) => { this.props.deleteCryptoLine(e) }} name={list[i].text} className="btn-delete glyphicon glyphicon-remove"></button>
						</span>
					</li>
				</form>
			);
		})
		//suming all existing cryptos into USD. outside of mapping function because you only need 1
		let sumOfAllMoneyMarketValue = 0;
		for (let j = 0; j < mappedList.length; j++)
			sumOfAllMoneyMarketValue += Number(list[j].amount * list[j].price * rate);
		let sumOfAllMoneyMarketValueFixed = sumOfAllMoneyMarketValue.toFixed(2);

		//book value 
		let sumOfAllMoneyBookValue = 0;
		for (let j = 0; j < mappedList.length; j++)
			sumOfAllMoneyBookValue += Number(list[j].amount * list[j].originalPrice * rate);
		let sumOfAllMoneyBookValueFixed = sumOfAllMoneyBookValue.toFixed(2);

		//combines the mapped list and the single entry of sum of cryptos together to look nice
		const combinedListItems =
			<ul className="list-group list-text">
				<li className="customList col-xs-12" id="summary-header">
					<div id="borderBottom"> Portfolio Performance ({this.props.currencyName})</div>
					<span className="col-xs-12 col-sm-6 col-md-3 col-lg-3">Total Book Value {this.props.currencyName} ${sumOfAllMoneyBookValueFixed}</span>
					<span className="col-xs-12 col-sm-6 col-md-3 col-lg-3">Total Market Value {this.props.currencyName} ${sumOfAllMoneyMarketValueFixed}</span>
					<span className="col-xs-12 col-sm-6 col-md-3 col-lg-3" id={`${(sumOfAllMoneyBookValueFixed <= sumOfAllMoneyMarketValueFixed) ? "gains" : "losses"}`}>Total Percentage Change {(sumOfAllMoneyBookValue === 0) ? 0 : (100 * (sumOfAllMoneyMarketValueFixed / sumOfAllMoneyBookValue) - 100).toFixed(2)}%</span>
					<span className="col-xs-12 col-sm-6 col-md-3 col-lg-3" id={`${(sumOfAllMoneyBookValueFixed <= sumOfAllMoneyMarketValueFixed) ? "gains" : "losses"}`}>Change in {this.props.currencyName} ${(sumOfAllMoneyMarketValueFixed - sumOfAllMoneyBookValue).toFixed(2)}</span>
				</li>
				{mappedList}
			</ul>

		return (
			combinedListItems
		);
	}
}
//**************************************Rendered Crypto List ends*********************************** */

//this deal strickly with the user input so they can add their new coin
class AddNewCrypto extends React.Component {
	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
		this.onInput = this.onInput.bind(this);
		this.state = {
			input: '',
			dropdown: []
		};
	}

	//updates the state of the child component so it is up to date when the form will be submitted
	onInput(e) {
		this.listofAllCryptoCoinsAPI();
		this.setState({
			input: e.target.value,
		});
	}
	// will return the input from user up to parent through form submission
	onSubmit(e) {
		e.preventDefault();
		//this stuff is all to make sure that the user can input Bitcoin, bitcoin, BitCoiN, etc. to still get it. fixes most bugs, but now the user can enter BiTCoin  and it will render like thatwhich I don't love
		let lowerCaseList = this.state.dropdown.map((coin, i) => {
			return coin.toLowerCase();
		});
		let lowerCaseInput = this.state.input.toLowerCase();
		let checkExists = lowerCaseList.indexOf(lowerCaseInput);
		if (checkExists > -1) {
			this.props.onSubmitProp(this.state.input);
			this.refs.dropDownRef.value = "";
		} else {
			alert("Sorry, that cryptocurrency does not Exist. Please enter one that does exist :).");
		}
	}
	//grabs the full list of the top cryptos and  allows them to be available for the dropown
	listofAllCryptoCoinsAPI() {
		let allCoins = [];
		let listOfAllCoins = axios.get(`${backendServer}/cmcAPI`);
		listOfAllCoins.then(response => {
			for (let i = 0; i < response.data.length; i++) {
				allCoins.push(response.data[i].name)
			}
			this.setState({
				dropdown: allCoins
			})
		})
			.catch(error => {
				console.log(error);
			});
	}
	render() {
		let listOfCoinsForDropDown = this.state.dropdown;
		let dropDownMenu = listOfCoinsForDropDown.map((oneCoin, i) => {
			return (
				<option value={oneCoin} key={i} />
			)
		})

		return (
			<form onSubmit={this.onSubmit}>
				<div className="input-group">
					<span className="input-group-btn">
						<button className='btn' id="addBtn" type="submit">Add</button>
					</span>
					<input list="dropdowncrypto" className='form-control' value={this.state.value} onChange={this.onInput} type="text" placeholder="Add your Crypto here" ref="dropDownRef" />
					<datalist id="dropdowncrypto">
						{dropDownMenu}
					</datalist>
				</div>
			</form>
		)
	}
}

//**************************************user input for adding a crypto ends*********************************** */

//**************************************Graph Creation component Below*********************************** */


class UserGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = { mockData:
			appleStock
		}
	}
	render() {
		const data = appleStock;

const width = 750;
const height = 400;

const x = d => new Date(d.date);
const y = d => d.close;

// Bounds
const margin = {
  top: 60,
  bottom: 60,
  left: 80,
  right: 80,
};
const xMax = width - margin.left - margin.right;
const yMax = height - margin.top - margin.bottom;

const xScale = scaleTime({
  range: [0, xMax],
  domain: extent(data, x)
});
const yScale = scaleLinear({
  range: [yMax, 0],
  domain: [0, max(data, y)],
});

return (
  <div>
    <svg width={width} height={height}>
      <LinearGradient
        from='#fbc2eb'
        to='#a6c1ee'
        id='gradient'
      />

      <Group top={margin.top} left={margin.left}>

        <AreaClosed
          data={data}
          xScale={xScale}
          yScale={yScale}
          x={x}
          y={y}
          fill={"url(#gradient)"}
          stroke={""}
        />

        <AxisLeft
          scale={yScale}
          top={0}
          left={0}
          label={'Close Price ($)'}
          stroke={'#1b1a1e'}
          tickTextFill={'#1b1a1e'}
        />

        <AxisBottom
          scale={xScale}
          top={yMax}
          label={'Years'}
          stroke={'#1b1a1e'}
          tickTextFill={'#1b1a1e'}
        />

      </Group>
    </svg>
  </div>
)
	}}
	
export default Calculator;
