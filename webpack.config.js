const path = require('path')
const { merge } = require('webpack-merge')

const TerserPlugin = require('terser-webpack-plugin')
const globImporter = require('node-sass-glob-importer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
const WebpackPluginPWAManifest = require('webpack-plugin-pwa-manifest')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

require('dotenv').config()
const env = process.env.APP_ENV

const filename = {
  development: '[name]',
  production: '[name].[contenthash:8]'
}
const head = {
  development: `<title>{{ title }} ${process.env.APP_TITLE_DIVIDER} ${process.env.APP_TITLE}</title>
  <link rel="icon" type="image/png" href="/assets/images/${process.env.APP_FAVICON}">`,
  production: '{% headTags title, description, thumbnail, page.url, type %}'
}

const config = {
  development: {
    devtool: 'source-map'
  },

  production: {
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          cache: true,
          parallel: true,
          terserOptions: {
            output: {
              comments: false
            }
          }
        })
      ],
      usedExports: true,
      sideEffects: true
    },
    plugins: [
      new WebpackPluginPWAManifest({
        name: process.env.APP_TITLE,
        shortName: process.env.APP_TITLE,
        display: 'minimal-ui',
        startURL: '/',
        theme: process.env.APP_COLOR,
        generateIconOptions: {
          baseIcon: `./src/assets/images/${process.env.APP_FAVICON}`,
          sizes: [192, 512],
          genFavicons: true
        }
      }),
      new HtmlReplaceWebpackPlugin([
        {
          pattern: '/browserconfig.xml',
          replacement: '{{ \'/browserconfig.xml\' | hashFile(\'public\') }}'
        },
        {
          pattern: '/manifest.webmanifest',
          replacement: '{{ \'/manifest.webmanifest\' | hashFile(\'public\') }}'
        }
      ]),
      new StylelintPlugin(),
      new ESLintPlugin()
    ]
  },

  common: {
    mode: env,
    entry: {
      main: ['./src/assets/js/main.js', './src/assets/scss/main.scss']
    },
    output: {
      path: path.resolve('public'),
      filename: `assets/js/${filename[env]}.js`
    },
    stats: {
      children: false
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: ['babel-loader']
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  importer: globImporter(),
                  outputStyle: 'expanded'
                }
              }
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'assets',
                name: `images/${filename[env]}.[ext]`,
                publicPath: '../'
              }
            }
          ]
        },
        {
          test: /\.(woff?2|otf|ttf|eot)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'assets',
                name: `fonts/${filename[env]}.[ext]`,
                publicPath: '../'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: `assets/css/${filename[env]}.css`
      }),
      new WebpackAssetsManifest({
        output: path.resolve('src/views/data/assets.json')
      }),
      new HtmlWebpackPlugin({
        templateContent: `<head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${head[env]}
          <script defer src="{{ 'main.js' | assetPath }}"></script>
          <link href="{{ 'main.css' | assetPath }}" rel="stylesheet">
        </head>`,
        filename: path.resolve('src/views/includes/head.njk'),
        minify: false,
        excludeAssets: [/\.js/, /\.css/],
        cache: true
      }),
      new ExcludeAssetsPlugin()
    ]
  }
}

module.exports = merge(config.common, config[env])
