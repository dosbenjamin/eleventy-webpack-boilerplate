const path = require('path')
const fs = require('fs')
const assign = require('lodash.assign')
const md5File = require('md5-file')

const posthtml = require('posthtml')
const pluginSitemap = require('@quasibit/eleventy-plugin-sitemap')

require('dotenv').config()
const env = process.env.APP_ENV

const moveSitemap = (() => {
  const prodPath = path.join(__dirname, 'src/views/sitemap.njk')
  const devPath = path.join(__dirname, 'src/sitemap.njk')
  const move = {
    development: () => fs.rename(prodPath, devPath, () => {}),
    production: () => fs.rename(devPath, prodPath, () => {})
  }
  return move[env]()
})()

const getAssetPath = asset => {
  const manifestPath = path.resolve(__dirname, "src/views/data/assets.json")
  const manifest = JSON.parse(fs.readFileSync(manifestPath))
  return `/${manifest[asset]}`
}

const config = {

  development: eleventyConfig => {
    fs.writeFile('src/views/includes/head.njk', '', () => {})

    eleventyConfig.addWatchTarget('src/assets/**/*')
  },

  production: eleventyConfig => {
    eleventyConfig.addTransform('posthtml', async (content, outputPath) => {
      const file = await path.resolve('.posthtmlrc.js')
      const config = await require(file)
      const result = await posthtml(config.plugins).process(content)
      return await result.html
    })

    eleventyConfig.addPlugin(pluginSitemap, {
      sitemap: {
        hostname: process.env.APP_BASE_URL,
      }
    })

    eleventyConfig.addShortcode('headTags', (title, description, thumbnail, url, type) => {
      return `
      <title>${title} ${process.env.APP_TITLE_DIVIDER} ${process.env.APP_TITLE}</title>
      <meta name="description" content="${description}">
      <meta name="author" content="${process.env.APP_AUTHOR}">
      <meta name="robots" content="index, follow">
      <link rel="canonical" href="${process.env.APP_BASE_URL}${url}">
      <meta property="og:title" content="${title} ${process.env.APP_TITLE_DIVIDER} ${process.env.APP_TITLE}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${process.env.APP_BASE_URL}${getAssetPath(thumbnail)}">
      <meta property="og:url" content="${process.env.APP_BASE_URL}${url}">
      <meta property="og:type" content="${type}">
      <meta itemprop="name" content="${title} ${process.env.APP_TITLE_DIVIDER} ${process.env.APP_TITLE}">
      <meta itemprop="description" content="${description}">
      <meta itemprop="image" content="${process.env.APP_BASE_URL}${getAssetPath(thumbnail)}">
      <meta name="twitter:title" content="${title} ${process.env.APP_TITLE_DIVIDER} ${process.env.APP_TITLE}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${process.env.APP_BASE_URL}${getAssetPath(thumbnail)}">
      <meta name="twitter:card" content="summary_large_image">
      `
    })

    eleventyConfig.addFilter('hashFile', (file, folder) => {
      const item = path.join(__dirname, `${folder}${file}`)
      const hash = md5File.sync(item).substring(0,8)
      const name = file.split('/').pop().split('.').shift()
      const extension = file.split('.').pop()
      const filename = `${name}.${hash}.${extension}`
      setTimeout(() => fs.rename(item, path.join(__dirname, `${folder}/${filename}`), () => {}), 100)
      return `/${filename}`
    })

    eleventyConfig.addPassthroughCopy({
      'src/.htaccess': '.htaccess',
      'src/robots.txt': 'robots.txt'
    })
  },

  common: eleventyConfig => {
    eleventyConfig.setQuietMode(true)

    eleventyConfig.addFilter('assetPath', getAssetPath)

    return {
      dir: {
        input: 'src/views',
        output: 'public',
        includes: 'includes',
        layouts: 'layouts',
        data: 'data'
      }
    }
  }

}

module.exports = eleventyConfig => assign(config.common(eleventyConfig), config[env](eleventyConfig))
