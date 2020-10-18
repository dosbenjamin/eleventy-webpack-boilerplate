module.exports = {
  presets: [
    ['@babel/preset-env'],
    ['optimizations', { simplify: true,  undefinedToVoid: true }]
  ],
  plugins: [
    'wildcard',
    'babel-plugin-loop-optimizer',
    'array-includes',
    [
      'groundskeeper-willie',
      { removeConsole: true, removeDebugger: true, removePragma: true }
    ],
    ['@babel/plugin-transform-runtime', { 'corejs': 3 }],
    'object-to-json-parse',
    'closure-elimination',
  ]
}
