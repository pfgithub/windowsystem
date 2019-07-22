const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["@babel/preset-typescript"],
          plugins: ["./babel-scss-transform.js"]
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new HTMLWebpackPlugin({
      title: "Window Simulator",
      template: "index.html"
    })
  ]
};
