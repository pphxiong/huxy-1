const webpack = require('webpack');
const path = require('path');
const {merge} = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const rimraf = require('rimraf');

const CompressionPlugin = require('compression-webpack-plugin');

const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const {GenerateSW}=require('workbox-webpack-plugin');

const webpackConfig = require('./webpack.config');

const configs=require('../configs');
const appName=require('../configs/appName')||'app';
const {PRD_ROOT_DIR,BUILD_DIR}=configs(appName);

const rootDir=PRD_ROOT_DIR;

// const appName=configs.APP_NAME;
const app=path.resolve(__dirname,`../${appName}`);
const build=path.resolve(app,BUILD_DIR);

rimraf(build,err=>console.log(err));

const postcssOptions={
  stage: 0,
  features: {
    'nesting-rules': true,
  },
  // autoprefixer: { grid: true }
  browsers: 'last 2 versions',
  importFrom:[
    // './playground/src/layoutOpt/global.css',
    // './configs/themeCfg.js',
    ()=>{
      const environmentVariables={'--viewport-1':'1200px'};
      return {environmentVariables};
    },
  ],
};

const plugins=[
  new MiniCssExtractPlugin({
    filename:'css/[name]_[contenthash:8].css',
    chunkFilename:'css/[id]_[name]_[contenthash:8].css',
    // publicPath:'../',
  }),
  new webpack.DefinePlugin({
    'process.env':{
      // NODE_ENV:JSON.stringify('production'),
      isDev:false,
    },
    EMAIL:JSON.stringify('ah.yiru@gmail.com'),
    VERSION:JSON.stringify('0.0.x'),
  }),
  new GenerateSW({
    // importWorkboxFrom: 'local',
    cacheId: 'demo-pwa',
    clientsClaim: true,
    skipWaiting: true,
  }),
  new CompressionPlugin({
    test: /\.(js|css)(\?.*)?$/i,
    filename: '[path].gz[query]',
    algorithm: 'gzip',
    threshold: 10240,
    minRatio: 0.8,
    deleteOriginalAssets: false,
  }),
];

const {ANALYZE}=process.env;

if(ANALYZE){
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = merge(webpackConfig, {
  mode:'production',
  devtool:'cheap-module-source-map',
  cache:false,
  output:{
    path:build,
    publicPath:rootDir,
  },
  optimization:{
    minimizer:[
      new TerserPlugin({
        // cache: true,
        parallel: true,
        // sourceMap: true,
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          compress: {
            drop_console:true,
          },
          mangle: true,
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset:['default',{
            discardComments:{removeAll:true},
            // calc: false,
            // normalizePositions: false,
          }],
        },
      }),
    ],
  },
  module:{
    rules:[{
      test:/\.css$/,
      use:[
        {
          loader:MiniCssExtractPlugin.loader,
          options:{
            // publicPath: '../',
          },
        },
        {
          loader:'css-loader',
          options:{
            importLoaders:1,
            modules: {
              mode:'global',
              localIdentName:'[hash:base64:5]',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [
              postcssPresetEnv(postcssOptions),
            ],
          },
        },
      ],
      // exclude: /components/,
    },{
      test:/\.less$/,
      use:[
        {
          loader:MiniCssExtractPlugin.loader,
          options:{
            // publicPath: '../',
          },
        },
        {
          loader:'css-loader',
          options:{
            importLoaders:1,
            modules: {
              mode:'global',
              localIdentName:'[hash:base64:5]',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [
              postcssPresetEnv(postcssOptions),
            ],
          },
        },
        {
          loader:'less-loader',
          options: {
            // javascriptEnabled:true,
            // strictMath: true,//'parens-division',
            // strictUnits: true,
            // noIeCompat: true,
          },
        },
      ],
      // exclude: /components/,
    }],
  },
  plugins,
});
