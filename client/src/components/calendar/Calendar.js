import React, { Component } from 'react'
import 'react-big-scheduler/lib/css/style.css'
import Scheduler, { SchedulerData, ViewTypes } from 'react-big-scheduler'
import withDragDropContext from '../../util/withDnDContext';
import { connect } from 'react-redux';
import { loadEvents, loadResources } from '../../actions/shiftActions';



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

    render(){
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
                               viewEventClick={this.ops1}
                               viewEventText="Ops 1"
                               viewEvent2Text="Ops 2"
                               viewEvent2Click={this.ops2}
                               updateEventStart={this.updateEventStart}
                               updateEventEnd={this.updateEventEnd}
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
        schedulerData.setEvents(this.state.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    nextClick = (schedulerData)=> {
        schedulerData.next();
        schedulerData.setEvents(this.state.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    onViewChange = (schedulerData, view) => {
        schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
        schedulerData.setEvents(this.state.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        schedulerData.setEvents(this.state.events);
        this.setState({
            viewModel: schedulerData
        })
    }

    eventClicked = (schedulerData, event) => {
        alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);
    };

    ops1 = (schedulerData, event) => {
        alert(`You just executed ops1 to event: {id: ${event.id}, title: ${event.title}}`);
    };

    ops2 = (schedulerData, event) => {
        alert(`You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`);
    };

    // newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    //     if(confirm(`Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, start: ${start}, end: ${end}, type: ${type}, item: ${item}}`)){

    //         let newFreshId = 0;
    //         schedulerData.events.forEach((item) => {
    //             if(item.id >= newFreshId)
    //                 newFreshId = item.id + 1;
    //         });

    //         let newEvent = {
    //             id: newFreshId,
    //             title: 'New event you just created',
    //             start: start,
    //             end: end,
    //             resourceId: slotId,
    //             bgColor: 'purple'
    //         }
    //         schedulerData.addEvent(newEvent);
    //         this.setState({
    //             viewModel: schedulerData
    //         })
    //     }
    // }

    // updateEventStart = (schedulerData, event, newStart) => {
    //     if(confirm(`Do you want to adjust the start of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newStart: ${newStart}}`)) {
    //         schedulerData.updateEventStart(event, newStart);
    //     }
    //     this.setState({
    //         viewModel: schedulerData
    //     })
    // }

    // updateEventEnd = (schedulerData, event, newEnd) => {
    //     if(confirm(`Do you want to adjust the end of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newEnd: ${newEnd}}`)) {
    //         schedulerData.updateEventEnd(event, newEnd);
    //     }
    //     this.setState({
    //         viewModel: schedulerData
    //     })
    // }

    // moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    //     if(confirm(`Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}`)) {
    //         schedulerData.moveEvent(event, slotId, slotName, start, end);
    //         this.setState({
    //             viewModel: schedulerData
    //         })
    //     }
    // }

    onScrollRight = (schedulerData, schedulerContent, maxScrollLeft) => {
        if(schedulerData.ViewTypes === ViewTypes.Day) {
            schedulerData.next();
            schedulerData.setEvents(this.state.events);
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
    shift: state.shift
})

export default withDragDropContext(connect(mapStateToProps, { loadEvents, loadResources })(Calendar))
