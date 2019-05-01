import _ from 'lodash';

import Promise from 'bluebird';
import path from 'path';

import crypto from 'crypto';

import express from 'express';
import bodyParser from 'body-parser';

import graylog from 'graylog-api';

import Config from './config';

class SimpleToken {
    create(username) {
        const cipher = crypto.createCipher('aes-256-ctr', Config.password);
        let crypted = cipher.update(username, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    verify(cipher) {
        try {
            const decipher = crypto.createDecipher('aes-256-ctr', Config.password);
            let plain = decipher.update(cipher, 'hex', 'utf8');
            plain += decipher.final('utf8');
            return _(Config.users).filter(u => u.username == plain).some();
        }
        catch (e) {
            return false;
        }
    }

    verifyHeaders(req) {
        const header = req.headers['auth-token'];
        if (!_.isString(header) || header.length === 0) {
            return false;
        }
        return this.verify(header);
    }
}

const Token = new SimpleToken();

const app = express();

if (true) {
    const config = require('../webpack.config');
    const webpack = require('webpack');
    const middleware = require('webpack-dev-middleware');
    const compiler = webpack(config);
    app.use(middleware(compiler, {
        publicPath: config.output.publicPath
    }));
}

app.use('/logs-viewer', express.static(path.join(__dirname, "..", "public")));
app.use(bodyParser.json());
app.use((req, res, chain) => {
    chain();
});

const api = graylog.connect(Config.graylog);

function getPage(query, number, perPage) {
    return new Promise((resolve, reject) => {
        api.searchRelative({
            query: query,
            range: 500,
            limit: perPage,
            offset: number * perPage,
            sort: 'desc'
        }, (err, data) => {
            if (err != null) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

function getPages(query, number) {
    console.log("Querying", number);
    return getPage(query, number).then(data => {
        console.log("Page", number, data.messages.length);
        if (data.messages.length == 0) {
            return [];
        }
        else {
            return getPages(query, number + 1).then(n => {
                return [ data, ...n ];
            });
        }
    });
}

app.post("/logs-viewer/login.json", function(req, res) {
    if (_(Config.users).filter(u => u.username == req.body.username && u.password == req.body.password).some()) {
        res.status(200).send(JSON.stringify({ token: Token.create(req.body.username) })).end();
    }
    else {
        res.status(401).send(JSON.stringify({})).end();
    }
});

app.get("/logs-viewer/logs.json", function(req, res) {
    if (!Token.verifyHeaders(req)) {
        res.status(401).send(JSON.stringify({})).end();
        return;
    }

    const { query } = req.query;

    console.log(query);

    getPage(query, 0, 200).then(page => {
        res.end(JSON.stringify(page));
    });
});

const server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
