import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logoutUser } from '../../actions/authActions';

class Navbar extends Component {

    onLogoutClick = (e) => {
        e.preventDefault();
        this.props.logoutUser();
        this.props.history.push("/login");
    }

    render() {

        const { isAuthenticated, user } = this.props.auth;

        const authLinks = (
            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <span className="navbar-text">User: {user.name}</span>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/shift/create">Create Shift</Link>
                </li>
                <li className="nav-item">
                    <Link to="/login" onClick={this.onLogoutClick} className="nav-link">Log Out</Link>
                </li>
            </ul>
        );

        const guestLinks = (
            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <Link className="nav-link" to="/user/create">Sign Up</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/login">Log In</Link>                    
                </li>
            </ul>
        );

        return (
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark mb-4">
                <div className="container">
                    <Link className="navbar-brand" to="/">Scheduler API</Link>
                    { isAuthenticated ? authLinks : guestLinks }
                </div>
            </nav>
        )
    }
}

Navbar.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
    auth: state.auth
})

export default connect(mapStateToProps, { logoutUser })(withRouter(Navbar))
