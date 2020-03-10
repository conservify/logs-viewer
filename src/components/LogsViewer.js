import _ from 'lodash'
import moment from 'moment'

import React from 'react'

const GraylogFields = [
    '_id',
    'gl2_source_input',
    'gl2_source_node',
    'gl2_remote_ip',
    'gl2_remote_port',
    'gl2_accounted_message_size',
    'gl2_message_id',
    'streams',
    'level',
    'tag',
    'format',
]
const FbFields = [
    '@timestamp',
    '@metadata_beat',
    '@metadata_type',
    '@metadata_version',
    '@metadata_pipeline',
    'agent_ephemeral_id',
    'agent_hostname',
    'agent_id',
    'agent_type',
    'agent_version',
    'beats_type',
    'cloud_account_id',
    'cloud_availability_zone',
    'cloud_image_id',
    'cloud_instance_id',
    'cloud_machine_type',
    'cloud_provider',
    'cloud_region',
    'ecs_version',
    'host_architecture',
    'host_containerized',
    'host_hostname',
    'host_id',
    'host_name',
    'host_os_codename',
    'host_os_family',
    'host_os_kernel',
    'host_os_name',
    'host_os_platform',
    'host_os_version',
    'input_type',
    'log_file_path',
    'log_offset',
    'event_module',
    'event_dataset',
    'event_timezone',
    'fileset_name',
    'service_type',
]
const DockerFields = ['image_id', 'image_name', 'container_id', 'container_name', 'command', 'created']
const VisibleFields = ['source', 'timestamp', 'task_id', 'logger', 'message', 'zaplevel', 'service_trace', 'req_id', 'application_name']
const OtherFields = ['zapts', 'stacktrace', 'caller', 'pid', 'program']
const ExcludingFields = [...GraylogFields, ...DockerFields, ...VisibleFields, ...OtherFields, ...FbFields]
const ClickableFields = ['device_id', 'queue', 'source_id', 'handler', 'message_type', 'api_url', 'modules']

class LogEntry extends React.Component {
    getUrl(query) {
        return (
            'https://code.conservify.org/logs/search?rangetype=relative&fields=message%2Csource%2clogger%2cdevice_id%2cfirmware_version%2ctask_id%2czaplevel%2cservice_trace&width=1916&highlightMessage=&relative=0&q=' +
            query
        )
    }

    getEntryUrl(entry) {
        const { _id, task_id } = entry.message

        if (_.isUndefined(task_id)) {
            return this.getUrl('_id%3A' + _id)
        }

        return this.getUrl('task_id%3A' + task_id)
    }

    onClickExtra(entry, key, value) {
        const url = this.getUrl(key + '%3A' + value)
        window.open(url, '_blank')
    }

    getVisibleFields(entry, extraExcludedFields, extraIncludedFields) {
        if (_.some(extraIncludedFields)) {
            return extraIncludedFields
        }

        return _(entry.message)
            .keys()
            .filter(key => {
                return !_.includes(ExcludingFields, key) && !_.includes(extraExcludedFields, key)
            })
            .value()
    }

    getExtras(entry, extraExcludedFields, extraIncludedFields) {
        const visibleFields = this.getVisibleFields(entry, extraExcludedFields, extraIncludedFields)

        const visibleData = _(visibleFields)
            .filter(key => entry.message[key])
            .map(key => {
                return {
                    key: key,
                    value: entry.message[key],
                }
            })
            .keyBy('key')
            .mapValues('value')
            .value()

        return _.map(visibleData, (value, key) => {
            if (_.includes(ClickableFields, key)) {
                return (
                    <span key={key} className="extra clickable" onClick={() => this.onClickExtra(entry, key, value)}>
                        <span className="key">{key}</span>: <span className="value">{value}</span>
                    </span>
                )
            } else {
                return (
                    <span key={key} className="extra">
                        <span className="key">{key}</span>: <span className="value">{value}</span>
                    </span>
                )
            }
        })
    }

    render() {
        const { entry, extraExcludedFields, extraIncludedFields, focusedTask, onEnter, onLeave } = this.props
        const { timestamp, task_id, source, application_name, logger, message, zaplevel, service_trace, program } = entry.message

        const classes = ['row', 'entry']

        if (zaplevel) {
            classes.push('level-' + zaplevel)
        }
        if (task_id) {
            classes.push('task-' + task_id)
            if (task_id == focusedTask) {
                classes.push('focused')
            }
        }

        const allClasses = classes.join(' ')
        const ts = moment(timestamp).format('ddd, hh:mm:ss')
        const extras = this.getExtras(entry, extraExcludedFields, extraIncludedFields)
        const clickUrl = this.getEntryUrl(entry)

        return (
            <div>
                <div className={allClasses} onMouseEnter={e => onEnter(entry)} onMouseLeave={e => onLeave(entry)}>
                    <div className="col-md-1 ts">
                        {' '}
                        <a target="_blank" href={clickUrl}>
                            {ts}
                        </a>{' '}
                        <span className="level">{zaplevel}</span>{' '}
                    </div>
                    <div className="col-md-1 source"> {source} </div>
                    <div className="col-md-1 logger">
                        {' '}
                        {program}
                        {application_name}
                        {logger}{' '}
                    </div>
                    <div className="col-md-9 message">
                        {' '}
                        {message} {extras}
                    </div>
                </div>
            </div>
        )
    }
}

export default class LogsViewer extends React.Component {
    constructor() {
        super()
        this.state = {
            focusedTask: null,
        }
    }

    onEnter(entry) {
        const { task_id } = entry.message
        this.setState({
            focusedTask: task_id,
        })
    }

    onLeave(entry) {
        this.setState({
            focusedTask: null,
        })
    }

    render() {
        const { logs, exclude, include } = this.props
        const { focusedTask } = this.state

        if (!logs.messages) {
            return (
                <div className="page-loading">
                    <h2>Loading</h2>
                </div>
            )
        }

        function splitFields(fields) {
            if (!fields || fields.length == 0) {
                return []
            }
            return fields.split(',')
        }

        const extraExcludedFields = splitFields(exclude)
        const extraIncludedFields = splitFields(include)

        return (
            <div className="container-fluid logs">
                {logs.messages.map(e => (
                    <LogEntry
                        key={e.message._id}
                        entry={e}
                        focusedTask={focusedTask}
                        onEnter={entry => this.onEnter(entry)}
                        onLeave={entry => this.onLeave(entry)}
                        extraExcludedFields={extraExcludedFields}
                        extraIncludedFields={extraIncludedFields}
                    />
                ))}
            </div>
        )
    }
}
