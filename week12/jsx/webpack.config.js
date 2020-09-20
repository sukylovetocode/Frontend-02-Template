module.exports = {
    entry: './main.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [["@babel/plugin-transform-react-jsx", {pragma: 'Feiting.createElement'}]]
                    }
                }
            }
        ]
    },
    mode: "development" // code not compressed
}