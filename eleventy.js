const path = require('path')
const fs = require('fs')
const assign = require('lodash.assign')
const md5File = require('md5-file')
const sharp = require('sharp')
const dedent = require('dedent')

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

const sitemapLocation = {
  production: path.resolve('src/views/sitemap.njk'),
  development: path.resolve('src/sitemap.njk')
}

/**
 * Add cache to specific `function`.
 *
 * @param fn Function that need memoization.
 * @returns {object} Cache containing calculated entries.
 */
const memoize = fn => {
  const cache = {}
  return (...args) => {
    const argsKey = JSON.stringify(args)
    if (!cache[argsKey]) cache[argsKey] = fn(...args)
    return cache[argsKey]
  }
}

const assetsSubfolder = /\/(content|other|theme)/ig
const removeSubfolder = memoize(file => file.replace(assetsSubfolder, ''))

/**
 * Extract the folder from file path.
 *
 * @param {string} file Relative file path starting from `public` folder.
 * @returns {string} Folder extracted from the complete file path.
 */
const getFolderPath = file => {
  const folder = file.split('.')[0].split('/')
  folder.pop()
  return removeSubfolder(folder.join('/'))
}

/**
 * Split file path.
 *
 * @param {string} file Relative file path starting from `public` folder.
 * @returns {object} Splitted folder, filename and extension of the file.
 */
const splitPath = memoize(file => {
  return {
    folder: getFolderPath(file),
    filename: file.split('/').pop().split('.')[0],
    extension: file.split('.').pop()
  }
})

/**
 * Hash and rename a file based on its content.
 *
 * @param {string} file Relative file path starting from `public` folder.
 * @returns {string} New file path with hash.
 */
const hash = memoize(file => {
  const { folder, filename, extension } = splitPath(file)
  const fileToHash = path.resolve(`public/${file}`)
  const hash = md5File.sync(fileToHash).substring(0, 8)
  const newFilename = `${filename}.${hash}.${extension}`
  const pathToAsset = `${folder}/${newFilename}`
  const destination = path.resolve(`public/${pathToAsset}`)
  setTimeout(() => fs.rename(fileToHash, destination, () => {}), 1000)
  return pathToAsset
})

/**
 * Check if a file exists in the `public` folder.
 *
 * @param {string} file Relative file path starting from `public` folder.
 * @returns {string} Name and extension of the file found.
 */
const find = file => {
  const { folder, filename, extension } = splitPath(file)
  return fs.readdirSync(`public/${folder}`)
    .filter(fn => fn.startsWith(filename))
    .filter(fn => fn.endsWith(extension)).pop()
}

/**
 * Filter to find and inject the right path when the file is hashed.
 *
 * @param {string} file Relative file path starting from `public` folder.
 * @returns {string} New file path with hash.
 */
const getAssetPath = memoize(file => {
  if (file.endsWith('webp')) return hash(removeSubfolder(file))
  const { folder } = splitPath(file)
  const asset = find(file)
  return `${folder}/${asset}`
})

/**
 * Filter to resize images at the right size.
 *
 * @param {string} file Relative file path starting from `public` folder.
 * @param {number} size Image width size.
 * @param {string} callback Function that returns file path.
 * @returns {void} Nothing
 */
const resizeImage = (file, size, callback) => {
  const { folder, filename, extension } = splitPath(file)
  const isWebp = extension === 'webp'
  const sourceFile = isWebp
    ? `public${folder}/${filename}.${extension}`
    : `src${file}`
  const fileToResize = path.resolve(sourceFile)
  const resizedFile = `${folder}/${filename}-${size}.${extension}`
  const destination = path.resolve(`public/${resizedFile}`)
  sharp(fileToResize)
    .resize(size)
    .toFile(destination, () => callback(null, hash(resizedFile)))
}

/**
 * Append things to a file and copy it to a new destination.
 *
 * @param {string} template Things to inject in the file.
 * @param {string} from File source location.
 * @param {string} to File destination path.
 * @returns {void} Nothing
 */
const appendToFile = (template, from, to = from) => {
  const source = path.resolve(`src/${from}`)
  const destination = path.resolve(`public/${to}`)
  fs.copyFile(
    source,
    destination,
    fs.constants.COPYFILE_EXCL, () => fs.appendFileSync(destination, template)
  )
}

/**
 * Inject `sitemap.xml` links to `robots.txt`.
 *
 * @returns {void} Nothing
 */
const injectSitemap = () => {
  const template = dedent`\nSitemap: ${APP_BASE_URL}/sitemap.xml
  Sitemap: ${APP_BASE_URL}/sitemap.xml.gz
  Sitemap: ${APP_BASE_URL}/sitemap.xml.br\n`
  appendToFile(template, 'robots.txt')
}

/**
 * Inject HTTP/2 Server Push with hashed `main.css` to `.htaccess`.
 *
 * @returns {void} Nothing
 */
const injectServerPush = () => {
  const css = '/assets/css/main.css'
  const cssPath = getAssetPath(css)
  const template = dedent`\n<IfModule http2_module>
      SetEnvIf Cookie "css-loaded=1" css-loaded
      <filesMatch "\.([hH][tT][mM][lL]?)">
          Header add Link "<${cssPath}>;rel=preload;as=style" env=!css-loaded
          Header add Set-Cookie "css-loaded=1; Path=/; Secure; HttpOnly" env=!css-loaded
      </filesMatch>
  </IfModule>\n`
  appendToFile(template, '.htaccess')
}

const config = {
  development: eleventyConfig => {
    eleventyConfig.addFilter('getPath', asset => removeSubfolder(asset))
    eleventyConfig.addFilter('resize', asset => removeSubfolder(asset))
    eleventyConfig.setBrowserSyncConfig({ logLevel: 'info' })
    fs.rename(sitemapLocation.production, sitemapLocation.development, () => {})
    fs.writeFileSync('src/views/includes/head.njk', '')
  },

  production: eleventyConfig => {
    eleventyConfig.addFilter('getPath', getAssetPath)
    eleventyConfig.addFilter('hash', hash)
    eleventyConfig.addNunjucksAsyncFilter('resize', resizeImage)

    eleventyConfig.addShortcode('headTags', (
      title,
      description,
      thumbnail,
      url,
      type,
      robots
    ) => {
      return dedent`<meta name="author" content="${APP_AUTHOR}">
      <meta name="robots" content="${robots}">
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
        const htmlTags = fonts
          .filter(font => font.endsWith('.woff2'))
          .map(font => toHtml(font))
        return htmlTags.join('')
      } catch (error) { return '' }
    })

    eleventyConfig.addTransform('posthtml', async (content, outputPath) => {
      const file = path.resolve('.posthtmlrc.js')
      const config = await require(file)
      const result = await posthtml(config.plugins).process(content)
      return await result.html
    })

    eleventyConfig.addPlugin(pluginSitemap, {
      sitemap: { hostname: APP_BASE_URL }
    })

    fs.rename(sitemapLocation.development, sitemapLocation.production, () => {})

    injectSitemap()
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

module.exports = eleventyConfig => assign(
  config.common(eleventyConfig),
  config[APP_ENV](eleventyConfig)
)
