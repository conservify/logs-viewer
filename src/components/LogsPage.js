import React from 'react'

import LogsViewer from './LogsViewer';

export default class LogsPage extends React.Component {
    constructor() {
        super();

        this.state = {
            timer: null,
            logs: { }
        };
    }

    componentDidMount() {
        this.query();
    }

    componentWillUnmount() {
        const { timer } = this.state;

        if (timer) {
            clearInterval(timer);
        }
    }

    query() {
        return fetch("logs.json")
            .then(response => response.json())
            .then(data => {
                const timer = setTimeout(() => {
                    this.query();
                }, 5000);

                this.setState({ logs: data, timer: timer });
            });
    }

    render() {
        const { logs } = this.state;

        return (
            <div className=''>
                <LogsViewer logs={logs} />
            </div>
        )
    }
}
