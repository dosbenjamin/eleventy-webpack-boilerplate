const path = require('path')
const fs = require('fs')
const { merge } = require('webpack-merge')

const TerserPlugin = require('terser-webpack-plugin')
const globImporter = require('node-sass-glob-importer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
const WebpackPluginPWAManifest = require('webpack-plugin-pwa-manifest')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const SpritePlugin = require('extract-svg-sprite-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

require('dotenv').config()
const {
  APP_ENV,
  APP_TITLE,
  APP_SHORT_TITLE,
  APP_TITLE_DIVIDER,
  APP_COLOR,
  APP_FAVICON
} = process.env

const isProd = APP_ENV === 'production'

const filename = { development: '[name]', production: '[name].[contenthash:8]' }

const head = {
  development: `<link rel="icon" href="/${APP_FAVICON}">`,
  production: '{% headTags title, description, thumbnail, page.url, type %}'
}

/**
 * Check wich assets to include as entries with js and scss.
 *
 * @returns {object} Array of entries and images to convert in webp.
 */
const getAssets = () => {
  const entries = ['./src/assets/js/main.js', './src/assets/scss/main.scss']
  const exclude = ['import', '.keep', '.DS_Store']
  const loadAssets = folder => {
    const assets = fs.readdirSync(folder).filter(item => !exclude.includes(item))
    entries.push(...assets.map(asset => folder + asset))
    return assets
  }
  const images = loadAssets('./src/assets/images/')
  loadAssets('./src/assets/videos/')
  return { images, entries }
}

const { entries, images } = getAssets()

// TODO: Service Worker -> Which files ??
// TODO: Writing readme.md & clean package.json

const config = {
  development: {
    devtool: 'source-map',
    plugins: [new CopyPlugin({ patterns: [{ from: `src/${APP_FAVICON}`, to: `${APP_FAVICON}` }] })]
  },

  production: {
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          cache: true,
          parallel: true,
          terserOptions: { output: { comments: false } }
        })
      ],
      usedExports: true,
      sideEffects: true
    },
    plugins: [
      new WebpackPluginPWAManifest({
        name: APP_TITLE,
        shortName: APP_SHORT_TITLE,
        display: 'minimal-ui',
        startURL: '/',
        theme: APP_COLOR,
        generateIconOptions: { baseIcon: `./src/${APP_FAVICON}`, sizes: [192, 512], genFavicons: true }
      }),
      new HtmlReplaceWebpackPlugin([
        { pattern: '/browserconfig.xml', replacement: '{{ \'/browserconfig.xml\' | hash }}' },
        { pattern: '/manifest.webmanifest', replacement: '{{ \'/manifest.webmanifest\' | hash }}' }
      ])
    ]
  },

  common: {
    mode: APP_ENV,
    entry: { main: entries },
    output: { path: path.resolve('public'), filename: `assets/js/${filename[APP_ENV]}.js` },
    stats: { children: false },
    module: {
      rules: [
        { test: /\.js$/, exclude: /(node_modules)/, use: ['babel-loader'] },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            { loader: 'postcss-loader', options: { postcssOptions: { config: isProd } } },
            SpritePlugin.cssLoader,
            {
              loader: 'sass-loader',
              options: { sassOptions: { importer: globImporter(), outputStyle: 'expanded' } }
            }
          ]
        },
        { test: /\.svg$/, loader: SpritePlugin.loader },
        {
          test: /\.(png|jpe?g|gif|webp)$/i,
          use: [{
            loader: 'file-loader',
            options: { publicPath: '/', name: `assets/images/${filename[APP_ENV]}.[ext]` }
          }]
        },
        {
          test: /\.(png|jpe?g)$/i,
          use: [
            {
              loader: ImageMinimizerPlugin.loader,
              options: {
                cache: true,
                deleteOriginalAssets: false,
                filename: 'assets/images/[name].webp',
                filter: (source, sourcePath) => images.some(img => sourcePath.includes(img)),
                minimizerOptions: { plugins: [['imagemin-webp', { quality: 80 }]] }
              }
            }
          ]
        },
        {
          test: /\.(mp4|webm)$/i,
          use: [{
            loader: 'file-loader',
            options: { publicPath: '/', name: `assets/videos/${filename[APP_ENV]}.[ext]` }
          }]
        },
        {
          test: /\.(woff|woff2|otf|ttf|eot)$/i,
          use: [{
            loader: 'file-loader',
            options: { publicPath: '/', name: `assets/fonts/${filename[APP_ENV]}.[ext]` }
          }]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: `assets/css/${filename[APP_ENV]}.css` }),
      new HtmlWebpackPlugin({
        templateContent: `<head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${isProd ? '{% preloadFonts \'\' %}' : ''}
          <link href="{{ '/assets/css/main.css' | getPath }}" rel="stylesheet">
          <script defer src="{{ '/assets/js/main.js' | getPath }}"></script>
          <title>{{ title }} ${APP_TITLE_DIVIDER} ${APP_TITLE}</title>
          <meta name="description" content="{{ description }}">
          ${head[APP_ENV]}
        </head>`,
        filename: path.resolve('src/views/includes/head.njk'),
        minify: false,
        excludeAssets: [/\.js/, /\.css/],
        cache: true
      }),
      new ExcludeAssetsPlugin(),
      new SpritePlugin({
        publicPath: '/',
        filename: isProd ? 'assets/images/sprite.[contenthash:8].svg' : 'assets/images/sprite.svg',
        spriteType: 'stack'
      })
    ]
  }
}

module.exports = merge(config.common, config[APP_ENV])
