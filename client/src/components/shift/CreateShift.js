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
        selectValue: '',
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

    handleSelectChange = (e) => {
        this.setState({selectValue: e.target.value, user: e.target.value})
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { name, start_date, end_date, user } = this.state;

        const newShift = {
            name,
            start_date,
            end_date,
            user
        };

        console.log(newShift);
        //withRouter wrapping below allows us to pass in this.props.history to do the redirect in the action creator
        this.props.createShift(newShift, this.props.history);
    }

    createEmployeeList() {
        let employees = this.props.resources.map(resource => {
            return (
                <option key={resource.id} value={resource.id}>{resource.name}</option>
            )
        });
        return employees;
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
                            error={errors.start_date}
                            info="Must be entered in a valid ISO 8601 format (example: YYYY-MM-DDTHH:MM)"
                        />
                        <TextField
                            placeholder="End Date"
                            name="end_date"
                            value={this.state.end_date}
                            onChange={this.handleChange}  
                            error={errors.end_date}
                            info="Must be entered in a valid ISO 8601 format (example: YYYY-MM-DDTHH:MM)"
                        />
                        <p>Employee:</p>
                        <select className="form-control" value={this.state.selectValue} name="user" onChange={this.handleSelectChange} info="If no employee selected, defaults to logged in user">
                            <option value="">--Defaults to logged in user--</option>
                            {this.createEmployeeList()}
                        </select>
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
    resources: state.shift.resources,
    errors: state.errors
});

export default connect(mapStateToProps, {createShift})(withRouter(CreateShift));
