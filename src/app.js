import React from 'react';
import './App.css';

class App extends React.Component {

    render() {
        return (
            <div>
                <header className="header col-xs-12">
                    <div className="">
                        <h1 className="col-xs-12 col-sm-8">Practice Cryptocurrency Portfolio</h1>
                        <span>
                            <a href="/login" onClick={() => { localStorage.clear() }} className="col-xs-12 col-sm-4 text-center">Logout</a>
                        </span>
                    </div>
                </header>
                {this.props.children}
                <footer className="footer">
                    <div className="container">
                        <div className="col-xs-6">
                            <a href="https://github.com/davekaj" target="_blank"><i className="fa fa-github"></i></a>
                            <a href="https://twitter.com/davidkajpust" target="_blank"><i className="fa fa-twitter"></i></a>
                            <a href="https://ca.linkedin.com/in/davidkajpust" target="_blank"><i className="fa fa-linkedin"></i></a>
                            <a href="https://www.facebook.com/david.kajpust" target="_blank"><i className="fa fa-facebook"></i></a>
                        </div>
                        <div className="col-xs-6 text-right">
                            <span>DESIGNED BY DAVID KAJPUST © 2017</span>
                        </div>
                    </div>
                </footer>
            </div>
        )
    }
}



export default App;