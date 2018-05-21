import Promise from 'bluebird';
import path from 'path';

import express from 'express';

import graylog from 'graylog-api';

import Config from './config';

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

const api = graylog.connect(Config.graylog);

function getPage(number, perPage) {
    return new Promise((resolve, reject) => {
        api.searchRelative({
            query: 'tag:fkdev',
            range: 500,
            limit: perPage,
            offset: number * perPage,
            sort: 'desc'
        }, (err, data) => {
            if (err != null) {
                reject(err)
            }
            else {
                resolve(data)
            }
        });
    });
}

function getPages(number) {
    console.log("Querying", number);
    return getPage(number).then(data => {
        console.log("Page", number, data.messages.length);
        if (data.messages.length == 0) {
            return [];
        }
        else {
            return getPages(number + 1).then(n => {
                return [ data, ...n ];
            });
        }
    });
}

app.get("/logs-viewer/logs.json", function(req, res) {
    getPage(0, 200).then(page => {
        res.end(JSON.stringify(page));
    });
});

const server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
