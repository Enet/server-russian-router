const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    module: {
        rules: [{
            test: /\.js$/,
            use: 'babel-loader'
        }]
    },
    externals: {
        'russian-router': {
            commonjs: 'russian-router',
            commonjs2: 'russian-router',
            amd: 'RussianRouter',
            root: 'RussianRouter'
        }
    },
    output: {
        filename: 'dist/server-russian-router.js',
        libraryTarget: 'umd',
        library: 'ServerRussianRouter'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        })
    ]
};
