import Promise from 'bluebird';

class WebApi {
    constructor() {
        this.token = sessionStorage.getItem("authToken");
    }

    authenticated() {
        return this.token != null && this.token != "";
    }

    setToken(token) {
        this.token = token;
        sessionStorage.setItem("authToken", token);
    }

    login(body) {
        return fetch("login.json", {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(new Error("Error"));
        });
    }

    getLogs() {
        if (!this.authenticated()) {
            return Promise.reject(new Error("Not authenticated"));
        }
        const options = {
            headers: {
                'Auth-Token': this.token
            }
        };
        return fetch("logs.json", options).then(response => response.json());
    }
}

const api = new WebApi();

export const Api = api;
