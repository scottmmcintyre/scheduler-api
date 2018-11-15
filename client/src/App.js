import React, { Component } from 'react';
import store from './store';
import Calendar from './components/calendar/Calendar';
import Navbar from './components/layout/Navbar';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import CreateUser from './components/auth/CreateUser';
import jwt_decode from 'jwt-decode';
import setAuthToken from './util/setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authActions';
import CreateShift from './components/shift/CreateShift';
import EditShift from './components/shift/EditShift';

if(localStorage.jwtToken) {
  //set Auth token header auth
  setAuthToken(localStorage.jwtToken);
  //decode token and get user info and expiration
  const decoded = jwt_decode(localStorage.jwtToken);
  //set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  //check for expired token, logout and redirect to login if expired
  const currentTime = Date.now() / 1000;
  if(decoded.exp < currentTime) {
    store.dispatch(logoutUser());
    //Redirect to login
    window.location.href = "/login";
  }
}

class App extends Component {
  render() {
    return (
        <Router>
          <div className="App">
              <Navbar />
              <Route exact path="/" component={Calendar} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/user/create" component={CreateUser} />
              <Route exact path="/shift/create" component={CreateShift} />
              <Route exact path="/shift/edit/:id" component={EditShift} />
          </div>
        </Router>
    );
  }
}

export default App;
