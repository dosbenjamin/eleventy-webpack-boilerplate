module.exports = {
  plugins: [
    require('posthtml-minifier')({
      collapseWhitespace: true,
      removeComments: true
    }),
    require('posthtml-alt-always')(),
    require('posthtml-link-noreferrer')({ attr: ['noopener', 'noreferrer'] })
  ]
}
