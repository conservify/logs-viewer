import React from 'react'

import { Api } from '../lib/api';

export default class LoginPage extends React.Component {
    onLogin(ev) {
        const { onLoggedIn } = this.props;

        const body = {
            username: this.refs.username.value,
            password: this.refs.password.value,
        };

        Api.login(body).then(response => {
            Api.setToken(response.token);
            onLoggedIn(response.token);
        })

        ev.preventDefault();
    }

    render() {
        return (
            <div className='container-fluid' style={{ width: '300px', margin: '0 auto', float: 'none' }} onSubmit={this.onLogin.bind(this)}>
                <h2>Pretty Log Viewer</h2>
                <form>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" ref="username" id="username" className="form-control"></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="text" ref="password" type="password" id="password" className="form-control"></input>
                    </div>

                    <button type="SUBMIT" className="btn btn-primary">Login</button>
                </form>
            </div>
        )
    }
}
