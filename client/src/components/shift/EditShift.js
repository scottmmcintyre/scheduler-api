import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { editShift, loadCurrentShift } from '../../actions/shiftActions';
import TextField from '../common/TextField';

class EditShift extends Component {

    state = {
        id: '',
        name: '',
        start_date: '',
        end_date: '',
        errors: {}
    }

    componentDidMount() {
        if(!this.props.auth.isAuthenticated) {
          this.props.history.push("/login");
        }
        let { id } = this.props.match.params
        this.props.loadCurrentShift(id);
    }

    componentDidUpdate() {
        if (this.props.currentShift._id !== this.state.id){
            const { _id, name, start_date, end_date, user } = this.props.currentShift;
            this.setState({id: _id, name: name, start_date: start_date, end_date: end_date, user: user, selectValue: user, errors: {}})
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
        const { id, name, start_date, end_date, user } = this.state;

        const newShift = {
            id,
            name,
            start_date,
            end_date,
            user
        };
        //withRouter wrapping below allows us to pass in this.props.history to do the redirect in the action creator
        this.props.editShift(newShift, this.props.history);
    }

    render() {

        const { loadingCurrentShift } = this.props;

        if(loadingCurrentShift || this.state.id === undefined) {
            return <div>Loading...</div>
        }
        const { errors } = this.state;

        return (
            <div className="create-user">
                <div className="container">
                <div className="row">
                    <div className="col-md-8 m-auto">
                    <h1 className="display-4 text-center">Edit Shift</h1>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField 
                            placeholder="Name"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleChange}
                            error={errors.name}
                            readOnly={true}
                        />
                        <TextField 
                            placeholder="Start Date"
                            name="start_date"
                            value={this.state.start_date}
                            onChange={this.handleChange}
                            error={errors.start_date}
                            info="Must be entered in a vaid ISO 8601 format like: YYYY-MM-DDTHH:MM:SS"
                        />
                        <TextField
                            placeholder="End Date"
                            name="end_date"
                            value={this.state.end_date}
                            onChange={this.handleChange}  
                            error={errors.end_date}
                            info="Must be entered in a valid ISO 8601 format like: YYYY-MM-DDTHH:MM:SS"
                        />
                        <div name="shiftoverlap" error={errors.shiftoverlap}></div>
                        <input type="submit" className="btn btn-info btn-block mt-4" />
                    </form>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}

EditShift.propTypes = {
    editShift: PropTypes.func.isRequired,
    loadCurrentShift: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    auth: state.auth,
    currentShift: state.shift.currentShift,
    loadingCurrentShift: state.shift.loadingCurrentShift,
    errors: state.errors
});

export default connect(mapStateToProps, {editShift, loadCurrentShift})(withRouter(EditShift));
