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

        return (
            <div>
                <div className="row entry">
                    <div className="col-md-1 ts"> {ts} {zaplevel} </div>
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
