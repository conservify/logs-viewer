const webpack = require('webpack')
const path = require('path')

module.exports = {
    entry: path.resolve(__dirname, 'src/app'),
    mode: 'development',
    output: {
        path: __dirname + '/dist',
        publicPath: '/logs-viewer/public/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'public')
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader']},
            {test: /(\.css)$/, loaders: ['style-loader', 'css-loader']}
        ]
    }
}
