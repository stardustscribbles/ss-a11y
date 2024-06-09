const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",
    entry: {
        background: "./src/background.ts",
        content: "./src/content.ts",
        panel: "./src/panel.ts",
        "panel-header": "./src/panel-header.ts",
        devtools: "./src/devtools.ts",
        styles: "./src/styles.scss",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
                exclude: /node_modules/,
            },
        ],
    },
    devtool: "source-map",
    plugins: [
        new MiniCssExtractPlugin({
            filename: "styles.css",
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "manifest.json", to: "" },
                { from: "devtools.html", to: "" },
                { from: "panel.html", to: "" },
                // Add any other static files you need to copy
            ],
        }),
    ],
};
