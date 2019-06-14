import Promise from 'bluebird';

class WebApi {
    constructor() {
        this.token = localStorage.getItem("authToken");
    }

    authenticated() {
        return this.token != null && this.token != "";
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem("authToken", token);
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

    getLogs(criteria) {
        if (!this.authenticated()) {
            return Promise.reject(new Error("Not authenticated"));
        }

        const options = {
            headers: {
                'Auth-Token': this.token
            }
        };

        const query = Object.keys(criteria).filter(k => criteria[k]).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(criteria[k])).join('&');
        return fetch("logs.json?" + query, options).then(response => response.json());
    }
}

const api = new WebApi();

export const Api = api;
