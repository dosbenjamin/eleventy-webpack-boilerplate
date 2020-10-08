module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-normalize': { forceImport: 'sanitize.css' },
    '@fullhuman/postcss-purgecss': {
      content: ['./src/**/*.njk', './src/**/*.js']
    },
    'postcss-sort-media-queries': {
      sort: 'mobile-first'
    },
    'postcss-combine-media-query': {},
    'postcss-combine-duplicated-selectors': {
      removeDuplicatedProperties: true
    },
    'css-declaration-sorter': { order: 'concentric-css' },
    cssnano: { preset: 'advanced' }
  }
}
