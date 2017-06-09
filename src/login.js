import './App.css';
import React, { Component } from 'react';
import {Link} from 'react-router';
import axios from 'axios';
import './App.css';

class Login extends Component {
  constructor(){
    super();
    this.state = {username:null,password:null,warning:'no-warning'};

    this.formSubmit = this.formSubmit.bind(this);
    this.txtFieldChange = this.txtFieldChange.bind(this);
  }

  //the form posts username and password entry. if you get an authorization success (200) then it will push you to the portfolio page, where token will be authorized
  formSubmit(e){
    e.preventDefault();
    axios
      .post('http://localhost:8080/login',this.state)
      .then((res) => {
        console.log(res);
        if (res.status === 200){
          localStorage.authToken = res.data.token;
          location.href = "http://localhost:3000/portfolio/?username=" + this.state.username;
        }
      })
      .catch((err)=>{
        this.setState({
          warning:'login unsuccessfull'
        })
        console.log(err);
      })
  }

  //just updating the state to represent correct username and password
  txtFieldChange(e){
    let copyOfUsername = this.state.username;
    let copyOfPassword = this.state.password;
    if(e.target.name === "username"){copyOfUsername = e.target.value}
    else if(e.target.name === "password"){copyOfPassword = e.target.value}
    this.setState({
      username:copyOfUsername,
      password:copyOfPassword
    });
  }

  //simple login form 
  render() {
    return (
      <div id="auth">
        <h3>Login Form</h3>
        <p className={"alert alert-danger "+ this.state.warning}>Incorrect username or password</p>
        <form onSubmit={this.formSubmit}>
          <div className="form-group">
            <input 
              onChange={this.txtFieldChange}
              className="form-control"
              type="text" 
              placeholder="Username" 
              name="username" />
          </div>
          <div className="form-group">
            <input 
              onChange={this.txtFieldChange}
              className="form-control"
              type="password" 
              placeholder="Password" 
              name="password" />
          </div>
          <div className="form-group">
            <button className="btn">Login</button>
          </div>
        </form>
      </div>
    );
  }
}


class Register extends Component {
  constructor(){
    super();
    this.state = {username:null,password:null, email: null, warning: "no-warning"};

    this.formSubmit = this.formSubmit.bind(this);
    this.txtFieldChange = this.txtFieldChange.bind(this);
    this.backToLogin = this.backToLogin.bind(this);
  }

  backToLogin(){
     location.href="http://localhost:3000/login"; 
  }

  //will go to the server to check the password and see if the hashes are equal, and then allow access
  formSubmit(e){
    e.preventDefault();
    axios
      .post('http://localhost:8080/encrypt',this.state)
      .then( (res) =>{
        console.log(res);
        this.backToLogin();
      })
      .catch((err)=>{
        this.setState({
          warning:'duplicateEmail'
        })
        console.log(err);
      })
  }

  //updating state so all fields are accurate
  txtFieldChange(e){
    let copyUsername = this.state.username;
    let copyPassword = this.state.password;
    let copyEmail = this.state.email;

    if(e.target.name === "username"){
        copyUsername = e.target.value;
    }
    else if(e.target.name === "password"){
        copyPassword = e.target.value;
    }    
    else if(e.target.name === "email"){
        copyEmail = e.target.value;
    }    
    this.setState({
      username:copyUsername,
      password:copyPassword,
      email:copyEmail
    });
  }

  //simple registration form
  render() {
    return (
      <div id="auth">
        <h3>Registration Form</h3>
        <p className={"alert alert-danger "+ this.state.warning}>Sorry, that username or email already exists. Please pick a new one.</p>        
        <form onSubmit={this.formSubmit}>
          <div className="form-group">
            <input 
              onChange={this.txtFieldChange}
              className="form-control"
              type="text" 
              placeholder="Username" 
              name="username" />
          </div>
          <div className="form-group">
            <input 
              onChange={this.txtFieldChange}
              className="form-control"
              type="password" 
              placeholder="Password" 
              name="password" />
          </div>
          <div className="form-group">
            <input 
              onChange={this.txtFieldChange}
              className="form-control"
              type="email" 
              placeholder="email" 
              name="email" />
          </div>
          <div className="form-group">
            <button className="btn btn-primary">Register</button>
          </div>
        </form>
      </div>
    );
  }
}

class Home extends Component {
  render() {
    return (
            <div id="auth">
                <h1> Welcome</h1>
                <div>
                    <p> If you want to practice investing in cryptocurrencies to see if you could make some money, you have come to the right place!
                      Please login if you have an existing account, or sign up if you are just getting started.
                    </p>
                </div>
                
                <div>
                    <Link to="/login"><button className="btn"> Login </button></Link><span> </span>
                    <Link to="/register"><button className="btn"> Sign Up </button></Link>                
                </div>
            </div>
    )
  }
}

export {Register,Login, Home};



