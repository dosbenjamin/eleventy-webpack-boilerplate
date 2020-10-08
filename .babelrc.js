module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        corejs: 3
      }
    ],
    [
      'optimizations',
      {
        simplify: true,
        undefinedToVoid: true
      }
    ]
  ],
  plugins: [
    'wildcard',
    'babel-plugin-loop-optimizer',
    'closure-elimination',
    [
      'groundskeeper-willie',
      {
        removeConsole: true,
        removeDebugger: true,
        removePragma: true
      }
    ]
  ]
}
