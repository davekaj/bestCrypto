import './App.css';
import React, { Component } from 'react';
import './App.css';

class LoginApp extends Component {
   render() {
        return (
            <div>
                <div>
                    <header className="header">
                        <div>
                            <h1 className="col-xs-12 col-sm-8">Practice Cryptocurrency Portfolio</h1>
                            <div>
                                <a href="/home" className="col-xs-3 col-sm-1 text-center" >Home</a>
                                <a href="/about" className="col-xs-3 col-sm-1 text-center">About</a>
                                <span><a href="/login" className="col-xs-3 col-sm-1 text-center">Login</a></span>
                                <span><a href="/Register" className="col-xs-3 col-sm-1 text-center">Sign up</a></span>                                
                            </div>
                        </div>
                    </header>
                    <nav>
                    </nav>
                    {this.props.children}            
                </div>
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

export default LoginApp;