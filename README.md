![alt text](https://i.ibb.co/f1NkDKP/11ty-webpack.png "Eleventy/Webpack Boilerplate Image")

# Eleventy/Webpack Boilerplate 🙈

This boilerplate is a ready-to-go front-end workflow to start a new project using the static site generator [Eleventy](https://www.11ty.dev) and [Webpack](https://webpack.js.org) to bundle assets.
Originally built for a personal use, the project is very opinionated and is focus on SEO, performance and accessibility. Feel free to use and modify.

## Get started 🎉

### Installation 📦
1. `git clone https://github.com/dosbenjamin/eleventy-webpack-boilerplate`
2. `npm install`

### Link to your GitHub 🔧
Modify the remote url to use with your own GitHub account. <br>

`git remote set-url origin git@github.com:USERNAME/REPOSITORY.git` <br>

⚠️ You need a SSH key for this → [How to generate a SSH key](https://docs.github.com/en/enterprise-server@2.20/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)


### Edit environnement variables ✏️
These variables are use across pages, configuration files and editable in `.env` file.
```
APP_TITLE = 'My new 11ty website'
APP_SHORT_TITLE = 'New site'
APP_TITLE_DIVIDER = '—'
APP_AUTHOR = 'John Doe'
APP_BASE_URL = 'https://example.com'
APP_COLOR = '#fff'
APP_FAVICON = 'favicon.png'
```
⚠️ Don't forget to rename `.env.example` into `.env` !

## Features ✨
- [Browserslist](https://github.com/browserslist/browserslist) set to *defaults*
- Cache busting all the assets files
- Compile `*.scss` files into a single `main.css` file
- Convert `*.svg` files used in `*.scss` into `sprite.svg`
- Copy `robots.txt` to `public` folder
- Copy `.htaccess` to `public` folder
- Generate favicons, `manifest.webmanifest`, `browserconfig.xml` and inject them inside html
- Generate `sitemap.xml` and paste it in `public`
- Inject `main.css` path in `.htaccess` for HTTP/2 Server Push
- Inject resources hint in `*.html` to preload `*.woff2` fonts
- Inject SEO meta tags (Twitter and Open Graph) in `*.html`
- Minify and transform `*.html` with [PostHTML](https://posthtml.org/) (check `.posthtmlrc.js`)
- Minify `main.js` with [Terser](https://github.com/terser/terser)
- Optimize, prefix and minify `main.css` with [PostCSS](https://postcss.org) (check `.postcssrc.js`)
- Optimize images and convert `*.jpg` & `*.png` to `*.webp` (check `.imageminrc.js`)
- Precompress files with [Brotli](https://github.com/google/brotli) and [Gzip](https://www.gzip.org) ([Zopfli](https://github.com/google/zopfli))
- Transpile and optimize `*.js` into a single `main.js` with [Babel](https://babeljs.io) (check `.babelrc.js`)
- Use [Nunjucks](https://mozilla.github.io/nunjucks/) `.njk` as templating engine
- Use [sanitize.css](https://csstools.github.io/sanitize.css) as reset

## Eleventy filters 🔍

### GetPath 🗃
#### `Input`
```html
<link href="{{ '/assets/css/main.css' | getPath }}" rel="stylesheet" />

<video controls width="1200">
  <source src="{{ '/assets/videos/matteo-singing.webm' | getPath }}" type="video/webm">
  <source src="{{ '/assets/videos/matteo-singing.mp4' | getPath }}" type="video/mp4">
</video>
```
#### `Output`
```html
<link href="/assets/css/main.f3ef3fdf.css" rel="stylesheet" />

<video controls width="1200">
  <source src="/assets/videos/matteo-singing.qm92kd09.webm" type="video/webm">
  <source src="/assets/videos/matteo-singing.po0820qn.mp4" type="video/mp4">
</video>
```
*Note: Can be use for any file that will be in `public`*

### Resize 📏
#### `Input`
```html
<img src="{{ '/assets/images/maxou.jpg' | resize(200) }}" alt="Maxime at the beach">
<img src="{{ '/assets/images/maxou.webp' | resize(600) }}" alt="Maxime at the beach">
```
#### `Output`
```html
<img src="/assets/images/maxou-200.dk9d65d1.jpg" alt="Maxime at the beach">
<img src="/assets/images/maxou-600.kj4kf923.webp" alt="Maxime at the beach">
```
*Note<sup>1</sup>: `*.webp` versions are always generated even if you don't ask for it in `*.njk`* <br>
*Note<sup>2</sup>: Resize is not available for `*.gif`*

## Commands 🚀
- `npm run clean`: clean `public` folder
- `npm run build`: lint and build in `public` folder for production
- `npm run serve`: lint, watch and build and on files changes

## Coding Style 🎨
- [JavaScript Standard](https://standardjs.com) (check `.eslintrc.js`)
- [Stylelint Standard](https://github.com/stylelint/stylelint-config-standard) + Custom (check `.stylelintrc.js`)

## To-do 🚧
- [ ] Service worker
- [ ] Cleaning `package.json`
- [ ] Writing `readme.md`
