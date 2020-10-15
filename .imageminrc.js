const imagemin = require('imagemin-keep-folder')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const imageminSvgo = require('imagemin-svgo')
const imageminGifsicle = require('imagemin-gifsicle')

imagemin(['public/**/*.{jpg,png,webp,svg,gif}'], {
  use: [
    imageminMozjpeg({ quality: 70, progressive: true }),
    imageminPngquant({ quality: [0.65, 0.8] }),
    imageminSvgo({
      plugins: [{
        removeDimensions: true,
        removeRasterImages: true,
        cleanupNumericValues: { floatPrecision: 1 }
      }]
    }),
    imageminGifsicle({ interlaced: true, optimizationLevel: 3 })
  ]
})
