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
const EnvoyFIelds = [
    'user_agent',
    'forwarded_for',
    'protocol',
    'upstream_host',
    'upstream_time',
    'envoy',
    'start_time',
    'response_duration',
]
const JavaFields = ['java_thread_name', 'sequence', 'java_pid', 'java_level', 'java_thread_id']
const DockerFields = ['image_id', 'image_name', 'container_id', 'container_name', 'command', 'created']
const VisibleFields = ['source', 'timestamp', 'task_id', 'logger', 'message', 'zaplevel', 'service_trace', 'req_id', 'application_name']
const OtherExcludedFields = [
    'zapts',
    'stacktrace',
    'caller',
    'pid',
    'program',
    'old_message',
    'old_time',
    'time_converted',
    'ts_converted',
    'envoy_time',
    'levels',
    'raw',
]
const ExcludingFields = [
    ...GraylogFields,
    ...DockerFields,
    ...VisibleFields,
    ...OtherExcludedFields,
    ...FbFields,
    ...JavaFields,
    ...EnvoyFIelds,
]
const ClickableFields = ['device_id', 'queue', 'source_id', 'handler', 'message_type', 'api_url', 'modules', 'user_id', 'from']

class LogEntry extends React.Component {
    getUrl(query) {
        return '/logs-viewer?range=864000&query=' + encodeURIComponent(query)
    }

    getEntryUrl(entry) {
        const { _id, task_id } = entry.message

        if (_.isUndefined(task_id)) {
            return this.getUrl('_id:"' + _id + '"')
        }

        return this.getUrl('task_id:"' + task_id + '"')
    }

    onClickExtra(entry, key, value) {
        const url = this.getUrl(key + ':"' + value + '"')
        window.open(url, '_blank')
    }

    getVisibleFields(entry, extraExcludedFields, extraIncludedFields) {
        if (_.some(extraIncludedFields)) {
            return extraIncludedFields
        }

        return _(entry.message)
            .keys()
            .filter((key) => {
                return !_.includes(ExcludingFields, key) && !_.includes(extraExcludedFields, key)
            })
            .value()
    }

    getExtras(entry, extraExcludedFields, extraIncludedFields) {
        const visibleFields = this.getVisibleFields(entry, extraExcludedFields, extraIncludedFields)

        const visibleData = _(visibleFields)
            .filter((key) => entry.message[key])
            .map((key) => {
                return {
                    key: key,
                    value: entry.message[key],
                }
            })
            .keyBy('key')
            .mapValues('value')
            .value()

        return _.map(visibleData, (value, key) => {
            if (_.isObject(value) || _.isArray(value)) {
                return (
                    <span key={key} className="extra">
                        <span className="key">{key}</span>: <span className="value">{JSON.stringify(value)}</span>
                    </span>
                )
            }
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
        const { entry, extraExcludedFields, extraIncludedFields, focusedTask, onFocus } = this.props
        const { timestamp, task_id, application_name, logger, message, zaplevel, service_trace, program } = entry.message

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
        const source = ['source', 'source_host']
            .map((key) => entry.message[key])
            .filter((v) => v)
            .join(', ')

        const level = ['zaplevel', 'levels']
            .map((key) => entry.message[key])
            .filter((v) => v)
            .join(', ')

        const detail = ['program', 'application_name', 'logger']
            .map((key) => entry.message[key])
            .filter((v) => v)
            .join(', ')

        return (
            <div>
                <div className={allClasses} onClick={(e) => onFocus(entry)}>
                    <div className="col-md-1 ts">
                        {' '}
                        <a target="_blank" href={clickUrl}>
                            {ts}
                        </a>{' '}
                        <span className="level">{level}</span>{' '}
                    </div>
                    <div className="col-md-1 source"> {source} </div>
                    <div className="col-md-1 logger"> {detail} </div>
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

    onFocus(entry) {
        if (entry) {
            const { task_id } = entry.message
            this.setState({
                focusedTask: task_id,
            })
        } else {
            this.setState({
                focusedTask: null,
            })
        }
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
                {logs.messages.map((e) => (
                    <LogEntry
                        key={e.message._id}
                        entry={e}
                        focusedTask={focusedTask}
                        onFocus={(entry) => this.onFocus(entry)}
                        extraExcludedFields={extraExcludedFields}
                        extraIncludedFields={extraIncludedFields}
                    />
                ))}
            </div>
        )
    }
}
