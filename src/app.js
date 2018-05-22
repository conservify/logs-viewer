import React from 'react'
import ReactDOM from 'react-dom'

import { Api } from './lib/api';

import LoginPage from './components/LoginPage'
import LogsPage from './components/LogsPage'

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            authenticated: Api.authenticated()
        };
    }

    onLoggedIn() {
        this.setState({
            authenticated: true
        });
    }

    render() {
        const { authenticated } = this.state;

        if (!authenticated) {
            return <LoginPage onLoggedIn={this.onLoggedIn.bind(this)} />;
        }

        return <LogsPage />;
    }
}

ReactDOM.render(<App />, document.getElementById('app'))
