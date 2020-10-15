![alt text](https://i.ibb.co/289wDTT/11ty-webpack.png "Logo Title Text 1")

# Eleventy/Webpack Boilerplate 🙈

This boilerplate is a ready-to-go front-end workflow to start a new project using the static site generator [Eleventy](https://www.11ty.dev) and [Webpack](https://webpack.js.org) to bundle assets.
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


#### Edit environnement variables `.env` ✏️
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
- Cache busting all the assets files
- Compile `*.scss` files into a single `main.css` file
- Convert `*.svg` files used in CSS into `sprite.svg`
- Copy `robots.txt` to `public` folder
- Copy `.htaccess` to `public` folder
- Generate favicons, `manifest.webmanifest`, `browserconfig.xml` and inject it inside html
- Generate `sitemap.xml` and paste it in `public`
- Inject `main.css` path in `.htaccess` for HTTP/2 Server Push
- Inject resources hint in `*.html` to preload `*.woff2` fonts
- Inject SEO meta tags (Twitter and OpenGrah) in HTML
- Minify `*.html` using PostHTML
- Optimize and minify `main.css` with PostCSS
- Optimize images and convert `*.jpg` & `*.png` to `*.webp`
- Transpile and optimize JavaScript into a single `main.js` using Babel
- Use Nunjucks as templating engine

## Eleventy filters

### GetPath
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
*Note: sdsdqs*

### Resize
#### `Input`
```html
<img src="{{ '/assets/images/maxou.jpg' | resize(200) }}" alt="Maxime at the beach">
<img src="{{ '/assets/images/maxou.webp' | resize(600) }}" alt="Maxime at the beach">
```
#### `Output`
```html
<img src="maxou-200.dk9d65d1.jpg" alt="Maxime at the beach">
<img src="maxou-600.kj4kf923.webp" alt="Maxime at the beach">
```
*Note 1: `*.webp` versions are always generated even if you don't ask for it in `*.njk`* <br>
*Note 2: Resize is not available for `*.gif`*

## Commands 🚀
- `npm run clean`: clean `public` folder
- `npm run build`: lint and build in `public` folder for production
- `npm run serve`: lint, watch and build and on files changes

## Coding Style
- JavaScript Standard
- Stylelint Standard + Custom

## To-do
- [] Service worker
- [] Cleaning package.json
- [] Readme

## Resources
[Eleventy](https://www.11ty.dev)
[Eleventy](https://www.11ty.dev)
[Eleventy](https://www.11ty.dev)
[Eleventy](https://www.11ty.dev)
[Eleventy](https://www.11ty.dev)
[Webpack](https://webpack.js.org)
