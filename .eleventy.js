const path = require('path')
const fs = require('fs')
const assign = require('lodash.assign')
const md5File = require('md5-file')
const sharp = require('sharp')

const posthtml = require('posthtml')
const pluginSitemap = require('@quasibit/eleventy-plugin-sitemap')

require('dotenv').config()
const {
  APP_ENV,
  APP_TITLE,
  APP_TITLE_DIVIDER,
  APP_AUTHOR,
  APP_BASE_URL
} = process.env

/**
 * Move sitemap.njk depending on the environnement.
 *
 * @returns {void} Nothing
 */
const moveSitemap = (() => {
  const prodPath = path.resolve('src/views/sitemap.njk')
  const devPath = path.resolve('src/sitemap.njk')
  const move = {
    development: () => fs.rename(prodPath, devPath, () => {}),
    production: () => fs.rename(devPath, prodPath, () => {})
  }
  return move[APP_ENV]()
})()

/**
 * Extract the folder of a file path.
 *
 * @param {string} file Relative path of the file starting from public folder.
 * @returns {string} Folder extracted from the complete file path.
 */
const getFolderPath = file => {
  const folder = file.split('.')[0].split('/')
  folder.pop()
  return folder.join('/')
}

/**
 * Split the path of the file.
 *
 * @param {string} file Relative path of the file starting from public folder.
 * @returns {object} Splitted folder, filename and extension of the file.
 */
const splitPath = file => {
  return {
    folder: getFolderPath(file),
    filename: file.split('/').pop().split('.')[0],
    extension: file.split('.').pop()
  }
}

/**
 * Hash and rename a file based on its content.
 *
 * @param {string} file Relative path of the file starting from public folder.
 * @returns {string} New path of the file with hash.
 */
const hash = file => {
  const { folder, filename, extension } = splitPath(file)
  const fileToHash = path.resolve(`public/${file}`)
  const hash = md5File.sync(fileToHash).substring(0, 8)
  const newFilename = `${filename}.${hash}.${extension}`
  const pathToAsset = `${folder}/${newFilename}`
  fs.renameSync(fileToHash, path.resolve(`public/${pathToAsset}`))
  return pathToAsset
}

/**
 * Find if a file exists in the public folder.
 *
 * @param {string} file Relative path of the file starting from public folder.
 * @returns {string} Filename and extension of the file found.
 */
const find = file => {
  const { folder, filename, extension } = splitPath(file)
  return fs.readdirSync(`public/${folder}`)
    .filter(fn => fn.startsWith(filename))
    .filter(fn => fn.endsWith(extension))
    .pop()
}

/**
 * Filter to find and inject the right path when the file is hashed.
 *
 * @param {string} file Relative path of the file starting from public folder.
 * @returns {string} New path of the file with hash.
 */
const getAssetPath = file => {
  if (file.endsWith('webp')) return hash(file)
  const { folder } = splitPath(file)
  const asset = find(file)
  return `${folder}/${asset}`
}

/**
 * Duplicate original webp image in the public folder.
 *
 * @param {string} file Relative path of the file starting from public folder.
 * @returns {void} Nothing.
 */
const duplicateOriginal = file => {
  const { folder } = splitPath(file)
  const originalFile = find(file)
  const source = path.resolve(`public/${folder}/${originalFile}`)
  const destination = `${path.resolve('public/')}${file}`
  fs.copyFile(source, destination, fs.constants.COPYFILE_EXCL, () => {})
}

/**
 * Filter to resize images at the right size.
 *
 * @param {string} file Relative path of the file starting from public folder.
 * @param {number} size Width size of the image.
 * @param {string} callback Asynchronous function that returns the path of the file resized and hashed.
 * @returns {void} Nothing.
 */
const resizeImage = (file, size, callback) => {
  const { folder, filename, extension } = splitPath(file)
  const isWebp = extension === 'webp'
  isWebp && duplicateOriginal(file)
  const sourceFolder = isWebp ? 'public' : 'src'
  const fileToResize = path.resolve(`${sourceFolder}/${file}`)
  const resizedFile = `${folder}/${filename}-${size}.${extension}`
  sharp(fileToResize).resize(size)
    .toFile(path.resolve(`public/${resizedFile}`), () => callback(null, hash(resizedFile)))
  setTimeout(() => isWebp && fs.unlink(fileToResize, () => {}), 1000)
}

/**
 * Inject server push header with hashed css.
 *
 * @returns {void} Nothing
 */
const injectServerPush = () => {
  const source = path.resolve('src/.htaccess')
  const destination = path.resolve('public/.htaccess')
  const css = '/assets/css/main.css'
  const cssPath = getAssetPath(css)
  const template = `<IfModule http2_module>
  SetEnvIf Cookie "cssloaded=1" cssloaded
  <filesMatch "\.([hH][tT][mM][lL]?)">
    Header add Link "<${cssPath}>;rel=preload;as=style" env=!cssloaded
    Header add Set-Cookie "cssloaded=1; Path=/; Secure; HttpOnly" env=!cssloaded
  </filesMatch>
</IfModule>`
  fs.copyFile(source, destination, fs.constants.COPYFILE_EXCL, () => fs.appendFileSync(destination, template))
}

const config = {
  development: eleventyConfig => {
    eleventyConfig.addFilter('getPath', asset => asset)
    eleventyConfig.addFilter('resize', resizeImage => resizeImage)
    eleventyConfig.addWatchTarget('src/assets/**/*')
    fs.writeFileSync('src/views/includes/head.njk', '')
  },

  production: eleventyConfig => {
    eleventyConfig.addFilter('getPath', getAssetPath)
    eleventyConfig.addFilter('hash', hash)
    eleventyConfig.addNunjucksAsyncFilter('resize', resizeImage)

    eleventyConfig.addShortcode('headTags', (title, description, thumbnail, url, type) => {
      return `<meta name="author" content="${APP_AUTHOR}">
      <meta name="robots" content="index, follow">
      <link rel="canonical" href="${APP_BASE_URL}${url}">
      <meta property="og:title" content="${title} ${APP_TITLE_DIVIDER} ${APP_TITLE}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${APP_BASE_URL}${getAssetPath(thumbnail)}">
      <meta property="og:url" content="${APP_BASE_URL}${url}">
      <meta property="og:type" content="${type}">
      <meta itemprop="name" content="${title} ${APP_TITLE_DIVIDER} ${APP_TITLE}">
      <meta itemprop="description" content="${description}">
      <meta itemprop="image" content="${APP_BASE_URL}${getAssetPath(thumbnail)}">
      <meta name="twitter:title" content="${title} ${APP_TITLE_DIVIDER} ${APP_TITLE}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${APP_BASE_URL}${getAssetPath(thumbnail)}">
      <meta name="twitter:card" content="summary_large_image">`
    })

    eleventyConfig.addShortcode('preloadFonts', () => {
      const toHtml = font => `<link
        rel="preload" href="/assets/fonts/${font}"
        as="font" type="font/woff2"
        crossorigin="anonymous">
      </link>`
      try {
        const fonts = fs.readdirSync('public/assets/fonts')
        const htmlTags = fonts.filter(font => font.endsWith('.woff2')).map(font => toHtml(font))
        return htmlTags.join('')
      } catch (error) {}
    })

    eleventyConfig.addTransform('posthtml', async (content, outputPath) => {
      const file = await path.resolve('.posthtmlrc.js')
      const config = await require(file)
      const result = await posthtml(config.plugins).process(content)
      return await result.html
    })

    eleventyConfig.addPlugin(pluginSitemap, {
      sitemap: {
        hostname: APP_BASE_URL
      }
    })

    eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' })
    injectServerPush()
  },

  common: eleventyConfig => {
    eleventyConfig.setQuietMode(true)
    return {
      dir: {
        input: 'src/views',
        output: 'public',
        includes: 'includes',
        layouts: 'templates',
        data: 'data'
      }
    }
  }

}

module.exports = eleventyConfig => assign(config.common(eleventyConfig), config[APP_ENV](eleventyConfig))
