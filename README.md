![alt text](https://i.ibb.co/f1NkDKP/11ty-webpack.png "Eleventy/Webpack Boilerplate Image")

# Eleventy/Webpack Boilerplate 🙈

This boilerplate is a ready-to-go front-end workflow to start a new project using the static site generator [Eleventy](https://www.11ty.dev) and [Webpack](https://webpack.js.org) to bundle assets.
Originally built for personal use, the project is very opinionated and is focus on SEO, performance and accessibility. Feel free to use and modify.

## Get started 🎉

### Installation 📦
1. `git clone https://github.com/dosbenjamin/eleventy-webpack-boilerplate`
2. `npm install`

### Edit environnement variables ✏️
These variables are use across pages, configuration files and editable in `.env` file.
```.env
# Title used accross all the project, to this will be added the page title
APP_TITLE = 'My new 11ty website'

# Only used in webmanifest
APP_SHORT_TITLE = 'New site'

# Sign that separates APP_TITLE and page title
APP_TITLE_DIVIDER = '—'

# Only used for author meta tag
APP_AUTHOR = 'John Doe'

# Used for canonical links, permalink of page will be added to this
APP_BASE_URL = 'https://example.com'

# Used in webmanifest and meta tag
APP_COLOR = '#fff'

# Name and location of favicon. By default it is located in the src folder
APP_FAVICON = 'favicon.png'

# Enable this to convert jpg/png to webp
APP_WEBP = true
```
⚠️ Don't forget to rename `.env.example` into `.env`!

## Features ✨
- Bundle assets with [Webpack](https://webpack.js.org) (check [`webpack.config.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/webpack.config.js))
- [Browserslist](https://github.com/browserslist/browserslist) set to *defaults* (check [`.browserslistrc`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.browserslistrc))
- Cache-buster all the assets files
- Cache files and add an offline page as fallback with [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) (check [`sw.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/src/sw.js))
- Compile `*.scss` files into a single `main.css` file
- Convert `*.svg` files used in `*.scss` into `sprite.svg`
- Copy `robots.txt` to `public` folder
- Copy `.htaccess` to `public` folder
- Generate favicons, `manifest.webmanifest`, `browserconfig.xml` and inject in `*.html`
- Generate `sitemap.xml` and paste it in `public`
- Generate `*.html` with [Eleventy](https://www.11ty.dev) (check [`eleventy.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/eleventy.js))
- Inject `main.css` path in `.htaccess` for HTTP/2 Server Push
- Inject resources hint in `*.html` to preload `*.woff2` fonts
- Inject SEO meta tags (Twitter and Open Graph) in `*.html`
- Lint `*.js` files with [ESLint](https://eslint.org) (check [`.eslintrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.eslintrc.js))
- Lint `*.scss` files with [Stylelint](https://stylelint.io) (check [`.stylelintrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.stylelintrc.js))
- Live reload server on file changes with [Browsersync](http://browsersync.io)
- Minify and transform `*.html` with [PostHTML](https://posthtml.org/) (check [`.posthtmlrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.posthtmlrc.js))
- Minify `main.js` with [Terser](https://github.com/terser/terser)
- Optimize, prefix and minify `main.css` with [PostCSS](https://postcss.org) (check [`.postcssrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.postcssrc.js))
- Optimize images and convert `*.jpg` & `*.png` to `*.webp` with [Imagemin](https://github.com/imagemin/imagemin) (check [`.imageminrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.imageminrc.js))
- Precompress files with [Brotli](https://github.com/google/brotli) and [Gzip](https://www.gzip.org) ([Zopfli](https://github.com/google/zopfli))
- Transpile and optimize `*.js` into a single `main.js` with [Babel](https://babeljs.io) (check [`.babelrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.babelrc.js))
- Use [Nunjucks](https://mozilla.github.io/nunjucks/) `.njk` as templating engine
- Use [sanitize.css](https://csstools.github.io/sanitize.css) as reset

## Eleventy filters 🔍

### GetPath 🗃
```html
<!-- Input / index.njk -->

<link href="{{ '/assets/css/main.css' | getPath }}" rel="stylesheet" />

<video width="1200">
  <source src="{{ '/assets/videos/matteo-singing.webm' | getPath }}" type="video/webm">
  <source src="{{ '/assets/videos/matteo-singing.mp4' | getPath }}" type="video/mp4">
</video>
```
```html
<!-- Output / index.html -->

<link href="/assets/css/main.f3ef3fdf.css" rel="stylesheet" />

<video width="1200">
  <source src="/assets/videos/matteo-singing.qm92kd09.webm" type="video/webm">
  <source src="/assets/videos/matteo-singing.po0820qn.mp4" type="video/mp4">
</video>
```
*Note: Can be use for any file that will be in `public`*

### Resize 📏
```html
<!-- Input / index.njk -->

<img src="{{ '/assets/images/maxou.jpg' | resize(200) }}" alt="Maxime at the beach">
<img src="{{ '/assets/images/maxou.webp' | resize(600) }}" alt="Maxime at the beach">
```
```html
<!-- Output / index.html -->

<img src="/assets/images/maxou-200.dk9d65d1.jpg" alt="Maxime at the beach">
<img src="/assets/images/maxou-600.kj4kf923.webp" alt="Maxime at the beach">
```
- ⚠️ Be sure to have `APP_WEBP = true` in `.env` before using resize with `*.webp` <br>
- ⚠️ Resize is not available for `*.gif`. Use `GetPath` instead.

## Commands 🚀
- `npm run build`: lint and build in `public` folder for production
- `npm run clean`: clean `public` folder
- `npm run lint`: lint `*.scss` and `*.js` files
- `npm run serve`: lint, watch and build on file changes

## Coding Style 🎨
- [JavaScript Standard](https://standardjs.com) (check [`.eslintrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.eslintrc.js))
- [Stylelint Standard](https://github.com/stylelint/stylelint-config-standard) + Custom (check [`.stylelintrc.js`](https://github.com/dosbenjamin/eleventy-webpack-boilerplate/blob/main/.stylelintrc.js))
