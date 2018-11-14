import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { createUser } from '../../actions/authActions';
import TextField from '../common/TextField';

class CreateUser extends Component {

    state = {
        username: '',
        name: '',
        email: '',
        password: '',
        password2: '',
        role: '',
        errors: {}
    }

    componentDidMount() {
        if(this.props.auth.isAuthenticated) {
          this.props.history.push("/");
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.errors) {
            this.setState({errors: nextProps.errors});
        }
    }

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { username, name, email, password, password2, role } = this.state;

        const newUser = {
            username,
            name,
            email,
            password,
            password2,
            role
        };

        //withRouter wrapping below allows us to pass in this.props.history to do the redirect in the action creator
        this.props.createUser(newUser, this.props.history);
    }    

    render() {
        const { errors } = this.state;
    
        return (
            <div className="create-user">
                <div className="container">
                <div className="row">
                    <div className="col-md-8 m-auto">
                    <h1 className="display-4 text-center">Sign Up</h1>
                    <p className="lead text-center">Create your Scheduler API account</p>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField 
                            placeholder="Name"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleChange}
                            error={errors.name}
                        />
                        <TextField
                            placeholder="Username"
                            name="username"
                            value={this.state.username}
                            onChange={this.handleChange}
                            error={errors.username}
                        />
                        <TextField
                            placeholder="Role"
                            name="role"
                            value={this.state.role}
                            onChange={this.handleChange}
                            error={errors.role}
                            info="Must be either 'manager' or 'employee'"
                        />
                        <TextField 
                            placeholder="Email"
                            type="email"
                            name="email"
                            value={this.state.email}
                            onChange={this.handleChange}
                            error={errors.email}
                        />
                        <TextField 
                            placeholder="Password"
                            name="password"
                            type="password"
                            value={this.state.password}
                            onChange={this.handleChange}
                            error={errors.password}
                        />
                        <TextField 
                            placeholder="Confirm Password"
                            name="password2"
                            type="password"
                            value={this.state.password2}
                            onChange={this.handleChange}
                            error={errors.password2}
                        />
                        <input type="submit" className="btn btn-info btn-block mt-4" />
                    </form>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}

CreateUser.propTypes = {
    createUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(mapStateToProps, {createUser})(withRouter(CreateUser));
