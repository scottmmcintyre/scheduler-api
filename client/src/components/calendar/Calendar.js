import React, { Component } from 'react'
import 'react-big-scheduler/lib/css/style.css'
import Scheduler, { SchedulerData, ViewTypes } from 'react-big-scheduler'
import withDragDropContext from '../../util/withDnDContext';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadEvents, loadResources, deleteShift } from '../../actions/shiftActions';

class Calendar extends Component{

    constructor(props){
        super(props);

        let schedulerData = new SchedulerData(new Date(), ViewTypes.Week);
        schedulerData.localeMoment.locale('en');

        this.state = {
            viewModel: schedulerData,
        }
    }

    componentWillMount() {
        this.props.loadEvents();
        this.props.loadResources();
    }

    componentDidMount() {
        if(!this.props.auth.isAuthenticated) {
            this.props.history.push("/login");
          }
    }

    render(){
        const { loadingEvents, loadingResources } = this.props;

        if(loadingEvents || loadingResources) {
            return <div>Loading...</div>;
        }

        const {viewModel} = this.state;
        viewModel.setResources(this.props.shift.resources);
        viewModel.setEvents(this.props.shift.events);
        return (
            <div>
                <div>
                    <Scheduler schedulerData={viewModel}
                               prevClick={this.prevClick}
                               nextClick={this.nextClick}
                               onSelectDate={this.onSelectDate}
                               onViewChange={this.onViewChange}
                               eventItemClick={this.eventClicked}
                               viewEventClick={this.delete}
                               viewEventText="Delete"
                               moveEvent={this.moveEvent}
                               newEvent={this.newEvent}
                               onScrollLeft={this.onScrollLeft}
                               onScrollRight={this.onScrollRight}
                               onScrollTop={this.onScrollTop}
                               onScrollBottom={this.onScrollBottom}
                    />
                </div>
            </div>
        )
    }

    prevClick = (schedulerData)=> {
        schedulerData.prev();
        schedulerData.setEvents(this.props.shift.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    nextClick = (schedulerData)=> {
        schedulerData.next();
        schedulerData.setEvents(this.props.shift.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    onViewChange = (schedulerData, view) => {
        schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
        schedulerData.setEvents(this.props.shift.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        schedulerData.setEvents(this.props.shift.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    eventClicked = (schedulerData, event) => {
        this.props.history.push(`/shift/edit/${event.id}`);
    };

    delete = (schedulerData, event) => {
        this.props.deleteShift(event.id);
    };

    ops2 = (schedulerData, event) => {
        alert(`You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`);
    };

    onScrollRight = (schedulerData, schedulerContent, maxScrollLeft) => {
        if(schedulerData.ViewTypes === ViewTypes.Day) {
            schedulerData.next();
            schedulerData.setEvents(this.props.shift.events);
            this.setState({
                viewModel: schedulerData
            });
    
            schedulerContent.scrollLeft = maxScrollLeft - 10;
        }
    }

    onScrollLeft = (schedulerData, schedulerContent, maxScrollLeft) => {
        if(schedulerData.ViewTypes === ViewTypes.Day) {
            schedulerData.prev();
            schedulerData.setEvents(this.state.events);
            this.setState({
                viewModel: schedulerData
            });

            schedulerContent.scrollLeft = 10;
        }
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    shift: state.shift,
    loadingEvents: state.shift.loadingEvents,
    loadingResources: state.shift.loadingResources
})

export default withDragDropContext(connect(mapStateToProps, { loadEvents, loadResources, deleteShift })(withRouter(Calendar)))
