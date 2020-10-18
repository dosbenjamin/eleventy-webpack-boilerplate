module.exports = {
  plugins: {
    '@fullhuman/postcss-purgecss': {
      content: [ './src/**/*.njk', './src/**/*.js']
    },
    'postcss-combine-duplicated-selectors': { removeDuplicatedProperties: true },
    'postcss-combine-media-query': {},
    'postcss-sort-media-queries': { sort: 'mobile-first' },
    autoprefixer: {},
    cssnano: { preset: 'advanced' }
  }
}
