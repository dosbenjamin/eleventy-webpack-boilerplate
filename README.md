# Eleventy/Webpack Boilerplate 🙈

This boilerplate is a ready-to-go front-end workflow to start a new project using the static generator [Eleventy](https://www.11ty.dev) and [Webpack](https://webpack.js.org) to bundle assets.
Originally built for a personal use, the project is strongly opinionated but feel free to use and modify it.

## Get started 🎉

### Installation 📦
1. `git clone https://github.com/dosbenjamin/eleventy-webpack-boilerplate`
2. `npm install`

### Set up the project 🔧
Modify the remote url to use with your own GitHub account. <br>
`git remote set-url origin git@github.com:USERNAME/REPOSITORY.git` <br>
⚠️ You need an SSH key for this. <br>
[Guide to generate an SSH key](https://docs.github.com/en/enterprise-server@2.20/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)


#### Edit environnement variables ✏️
These variables are use across pages and configuration files so you only have to declare it once.
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
- Cache busting all the assets files
- Compile SCSS files into CSS
- Convert SVG files used in CSS into `sprite.svg`
- Copy `robots.txt` to `public` folder
- Copy `.htaccess` to `public` folder
- Generate `manifest.webmanifest`, `browserconfig.xml`, favicons and inject it inside html
- Generate `sitemap.xml`
- Inject resources hint in HTML to preload WOFF2 fonts
- Inject CSS path in `.htaccess` for HTTP/2 Server Push
- Minify HTML using PostHTML
- Optimize and minify CSS with PostCSS
- Optimize images and convert JPG & PNG to WEBP
- Transpile JavaScript using Babel and optimize it

## Eleventy filters
### GetPath
*Input*
```html
<link href="{{ '/assets/css/main.css' | getPath }}" rel="stylesheet" />
```
*Output*
```html
<link href="/assets/css/main.f3ef3fdf.css" rel="stylesheet" />
```

### Resize
*Input*
```html
<img src="{{ '/assets/images/maxou.jpg' | resize(200) }}" alt="Maxime at the beach">
```
*Output*
```html
<img src="maxou-200.dk9d65d1.jpg" alt="Maxime at the beach">
```

## Commands 🚀
- `npm run clean`: clean `public` folder
- `npm run build`: lint and build in `public` folder for production
- `npm run serve`: lint, watch and build and on files changes

## To-do
- [] Service worker
- [] Cleaning package.json

## Resources
