import _ from 'lodash';
import moment from 'moment';

import React from 'react'

const GraylogFields = [ '_id', 'gl2_source_input', 'gl2_source_node', 'streams', 'level', 'tag' ];
const DockerFields = [ 'image_id', 'image_name', 'container_id', 'container_name', 'command', 'created' ];
const VisibleFields = [ 'source', 'timestamp', 'task_id', 'logger', 'message', 'zaplevel', 'service_trace' ];
const OtherFields = [ 'zapts', 'stacktrace', 'caller' ] ;
const ExcludingFields = [ ...GraylogFields, ...DockerFields, ...VisibleFields, ...OtherFields ];

class LogEntry extends React.Component {
    render() {
        const { entry } = this.props;

        const { timestamp, task_id, source, logger, message, zaplevel, service_trace } = entry.message;
        const ts = moment(timestamp).format("ddd, h:mm:ss");

        const fields = _.pickBy(entry.message, (value, key) => {
            return !_.includes(ExcludingFields, key);
        });

        const extras = _.map(fields, (value, key) => {
            return (<span key={key} className="extra"><span className="key">{key}</span>: <span className="value">{value}</span></span>);
        });

        const classes = "row entry level-" + zaplevel;

        const taskUrl = "https://code.conservify.org/logs/search?rangetype=relative&fields=message%2Csource%2clogger%2ctask_id%2czaplevel%2cservice_trace&width=1916&highlightMessage=&relative=0&q=task_id%3A" + task_id;

        return (
            <div>
                <div className={classes}>
                    <div className="col-md-1 ts"> <a target="_blank" href={taskUrl}>{ts}</a> <span className="level">{zaplevel}</span> </div>
                    <div className="col-md-1 source"> {source} </div>
                    <div className="col-md-1 logger"> {logger} </div>
                    <div className="col-md-9 message"> {message} {extras}</div>
                </div>
            </div>
        )
    }
}

export default class LogsViewer extends React.Component {
    render() {
        const { logs } = this.props;

        if (!logs.messages) {
            return <div>Loading</div>;
        }

        return (
            <div className='container-fluid logs'>
                {logs.messages.map(e => <LogEntry key={e.message._id} entry={e} />)}
            </div>
        )
    }
}
