import React from 'react';


class About extends React.Component{

    render(){
        return(
            <div>
                <h1> About Page</h1>
                <div className=" col-xs-12 col-sm-6 col-sm-offset-3 about container about-page">
                    <h2>What is it? (In one sentance)</h2>
                    <p>This is a simple fake cryptocurrency investing web app built for fun. It calls upon a cryptocurrency API to get live prices.
                        These prices can also be shown in the following currencies: 
                    </p>
                    <ul>
                        <li>USD</li>
                        <li>AUD</li>
                        <li>CAD</li>
                        <li>CNY</li>
                        <li>EUR</li>
                        <li>GBP</li>
                        <li>HKD</li>
                        <li>JPY</li>
                        <li>KRW</li>
                    </ul>
                    <h2>Longer Description</h2>
                    <p> It pulls the live data of the fiat currencies in order to view your portfolio in your countries currency.
                        You can sign up for an account, and your entry will be stored in our database so that you can come back to it whenever 
                        you would like. It will keep track of the price you paid for the cryptocurrencys when you entered them into your portfolio.
                        You can see the book value and the market value of your portfolio, and they are compared to show you if you are a good
                        investor and you've made some money, or you are a bad investor and you've lost! 
                    </p>
                </div>
            </div>
        )
    }
}







export default About;