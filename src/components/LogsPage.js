import React from 'react';

import { Api } from '../lib/api.js';

import LogsViewer from './LogsViewer';

export default class LogsPage extends React.Component {
    constructor() {
        super();

        const params = new URLSearchParams(window.location.search);

        this.state = {
            timer: null,
            logs: { },
            query: params.get("query") || "",
            range: params.get("range"),
            from: params.get("from"),
            to: params.get("to"),
        };
    }

    componentDidMount() {
        this.query();

        this.refs.query.value = this.state.query;
    }

    componentWillUnmount() {
        const { timer } = this.state;

        if (timer) {
            clearInterval(timer);
        }
    }

    schedule(data) {
        const timer = setTimeout(() => {
            this.query();
        }, 5000);

        if (data) {
            this.setState({ logs: data, timer: timer });
        }
        else {
            this.setState({ timer: timer });
        }
    }

    query() {
        const { query } = this.state;

        return Api.getLogs(this.getCriteria()).then(data => {
            this.schedule(data);
        }, () => {
            this.schedule(null);
        });
    }

    setQuery(ev) {
        ev.preventDefault();
    }

    onSearch(ev) {
        ev.preventDefault();

        const query = this.refs.query.value;

        this.setState({
            query: query
        });

        Api.getLogs(this.getCriteria()).then(data => {
            this.setState({ logs: data });
        });
    }

    getCriteria() {
        const { query, range, from, to } = this.state;

        const c = {
            query, range, from, to
        };

        return c;
    }


    render() {
        const { logs } = this.state;

        return (
            <div className=''>
              <form onSubmit={this.onSearch.bind(this)}>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="input-group">
                      <span className="input-group-btn">
                        <button className="btn btn-primary" type="submit">Search</button>
                      </span>
                      <input className="form-control" type="text" placeholder="Search" ref="query" />
                    </div>
                  </div>
                </div>
              </form>
              <LogsViewer logs={logs} />
            </div>
        );
    }
}
