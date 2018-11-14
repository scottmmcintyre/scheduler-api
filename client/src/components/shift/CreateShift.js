import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { createShift } from '../../actions/shiftActions';
import TextField from '../common/TextField';

class CreateShift extends Component {

    state = {
        name: '',
        start_date: '',
        end_date: '',
        user: '',
        errors: {}
    }

    componentDidMount() {
        if(!this.props.auth.isAuthenticated) {
          this.props.history.push("/login");
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
        const { name, start_date, end_date, user } = this.state;

        const newUser = {
            name,
            start_date,
            end_date,
            user
        };

        //withRouter wrapping below allows us to pass in this.props.history to do the redirect in the action creator
        this.props.createShift(newUser, this.props.history);
    }    

    render() {
        const { errors } = this.state;
    
        return (
            <div className="create-user">
                <div className="container">
                <div className="row">
                    <div className="col-md-8 m-auto">
                    <h1 className="display-4 text-center">Create A New Shift</h1>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField 
                            placeholder="Name"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleChange}
                            error={errors.name}
                        />
                        <TextField 
                            placeholder="Start Date"
                            name="start_date"
                            value={this.state.start_date}
                            onChange={this.handleChange}
                            error={errors.name}
                            info="Must be entered in ISO 8601 format like: YYYY-MM-DDTHH:MM:SS"
                        />
                        <TextField
                            placeholder="End Date"
                            name="end_date"
                            value={this.state.end_date}
                            onChange={this.handleChange}
                            error={errors.name}
                            info="Must be entered in ISO 8601 format like: YYYY-MM-DDTHH:MM:SS"
                        />
                        <TextField
                            placeholder="User"
                            name="user"
                            value={this.state.user}
                            onChange={this.handleChange}
                            error={errors.user}
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

CreateShift.propTypes = {
    createShift: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(mapStateToProps, {createShift})(withRouter(CreateShift));
