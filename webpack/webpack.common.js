
const gameName = require('./gameName.js');
const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.base.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(base, {
    entry: {
        storyscript: './src/UI/main.ts'
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, '../dist')
    },
    module: {
        rules: [
            {
                test: /\.css?$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/UI/index.html'
        }),
        new CopyWebpackPlugin([{ 
            from: path.resolve(__dirname, `../src/Games/${gameName}/resources`),
            to: 'resources'
        },
        { 
            from: path.resolve(__dirname, `../src/Games/${gameName}/gameinfo.json`),
            to: '[name].[ext]'
        }])
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            automaticNameDelimiter: '-',
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor'
                }
            }
        }
    }
});