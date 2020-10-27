const path = require('path')
const fs = require('fs')
const { merge } = require('webpack-merge')
const globImporter = require('node-sass-glob-importer')
const dedent = require('dedent')

const TerserPlugin = require('terser-webpack-plugin')
const SpritePlugin = require('extract-svg-sprite-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const HTMLPlugin = require('html-webpack-plugin')
const HTMLReplacePlugin = require('html-replace-webpack-plugin')
const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
const PWAManifestPlugin = require('webpack-plugin-pwa-manifest')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const InjectPlugin = require('webpack-inject-plugin').default
const CopyPlugin = require('copy-webpack-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

require('dotenv').config()
const {
  APP_ENV,
  APP_TITLE,
  APP_SHORT_TITLE,
  APP_TITLE_DIVIDER,
  APP_COLOR,
  APP_FAVICON,
  APP_WEBP
} = process.env

const head = {
  development: `<link rel="icon" href="/${APP_FAVICON}">`,
  production: '{% headTags title, description, thumbnail, page.url, type, robots %}'
}

const filename = { development: '[name]', production: '[name].[contenthash:8]' }

const entries = ['./src/assets/js/main.js', './src/assets/scss/main.scss']

/**
 * Add files as Webpack entries.
 *
 * @param {string} folder Folder path where files are located.
 * @returns {array} Files added as entry.
 */
const addToEntries = folder => {
  const exclude = ['theme', '.keep', '.DS_Store']
  const assets = fs.readdirSync(folder)
    .filter(item => !exclude.includes(item))
  entries.push(...assets.map(asset => folder + asset))
  return assets
}

const images = addToEntries('./src/assets/images/content/')
addToEntries('./src/assets/images/other/')
addToEntries('./src/assets/videos/')

const isProd = APP_ENV === 'production'

const config = {
  development: {
    devtool: 'source-map',
    plugins: [
      new CopyPlugin({
        patterns: [{ from: `src/${APP_FAVICON}`, to: `${APP_FAVICON}` }]
      })
    ]
  },
  production: {
    optimization: {
      usedExports: true,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          cache: true,
          parallel: true,
          terserOptions: { output: { comments: false } }
        })
      ]
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: ['babel-loader']
      }]
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: 'src/sw.js', to: 'sw.js' }]
      }),
      new InjectPlugin(() => {
        return `if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
          })
        }`
      }),
      new SpritePlugin({
        publicPath: '/',
        filename: 'assets/images/sprite.[contenthash:8].svg',
        spriteType: 'stack'
      }),
      new PWAManifestPlugin({
        name: APP_TITLE,
        shortName: APP_SHORT_TITLE,
        display: 'minimal-ui',
        startURL: '/',
        theme: APP_COLOR,
        generateIconOptions: {
          baseIcon: `./src/${APP_FAVICON}`,
          sizes: [192, 512],
          genFavicons: true
        }
      }),
      new HTMLReplacePlugin([
        {
          pattern: '/browserconfig.xml',
          replacement: "{{ '/browserconfig.xml' | hash }}"
        },
        {
          pattern: '/manifest.webmanifest',
          replacement: "{{ '/manifest.webmanifest' | hash }}"
        },
        { pattern: 'sizes="180x180"', replacement: '' }
      ]),
      {
        apply: ({ hooks }) => {
          const start = '\x1b[46m\x1b[30m START \x1b[0m\x1b[36m ' +
            'The project is building! 🏗\n \x1b[0m'
          const done = 'Bundled all the static assets'
          hooks.beforeRun.tap('BeforeRunPlugin', () => console.info(start))
          hooks.afterEmit.tap('AfterEmitPlugin', ({ hash }) => {
            const serviceWorker = path.resolve('public/sw.js')
            fs.appendFileSync(serviceWorker, `//${hash}`)
            console.info(done)
          })
        }
      }
    ]
  },
  common: {
    mode: APP_ENV,
    entry: { main: entries },
    stats: { all: false, warnings: true, errors: true },
    output: {
      path: path.resolve('public'),
      filename: `assets/js/${filename[APP_ENV]}.js`
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCSSExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: { config: isProd, hideNothingWarning: true }
              }
            },
            SpritePlugin.cssLoader,
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
          test: /\.svg$/,
          use: isProd
            ? SpritePlugin.loader
            : {
              loader: 'file-loader',
              options: {
                publicPath: '/',
                name: `assets/images/${filename[APP_ENV]}.[ext]`
              }
            }
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                publicPath: '/',
                name: `assets/images/${filename[APP_ENV]}.[ext]`
              }
            }
          ]
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
                filter: (source, sourcePath) => images
                  .some(img => sourcePath.includes(img) && APP_WEBP === 'true'),
                minimizerOptions: {
                  plugins: [['imagemin-webp', { quality: 80 }]]
                }
              }
            }
          ]
        },
        {
          test: /\.(mp4|webm)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                publicPath: '/',
                name: `assets/videos/${filename[APP_ENV]}.[ext]`
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|otf|ttf|eot)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                publicPath: '/',
                name: `assets/fonts/${filename[APP_ENV]}.[ext]`
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCSSExtractPlugin({
        filename: `assets/css/${filename[APP_ENV]}.css`
      }),
      new HTMLPlugin({
        templateContent: dedent`<head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${isProd ? "{% preloadFonts '' %}" : ''}
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
      new StylelintPlugin(),
      new ESLintPlugin()
    ]
  }
}

module.exports = merge(config.common, config[APP_ENV])
