module.exports = {
  extends: ['standard', 'plugin:compat/recommended'],
  env: { es6: true, node: true, browser: true },
  ignorePatterns: ['public/**/*.js'],
  settings: { polyfills: [] }
}
