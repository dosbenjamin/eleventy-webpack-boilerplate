# Eleventy/Webpack Boilerplate 🙈

This boilerplate is a ready-to-go front-end workflow to start a new project using the static generator [Eleventy](https://www.11ty.dev) and [Webpack](https://webpack.js.org) to bundle assets.
Originally built for a personal use, the project is strongly opinionated but feel free to use and modify it.

## Get started

### Installation 📦
1. `git clone https://github.com/dosbenjamin/eleventy-webpack-boilerplate` <br>
2.  `npm install`

### Setting up the project 🔧
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
⚠️ Don't forget to rename `.env.example` to `.env` !

## Features 🔥
•
• Add resources hint preload in html to preload WOFF2 fonts <br>
• Optimize images and convert JPG & PNG to WEBP

## Commands 🚀
• `npm run clean`: clean `public` folder <br>
• `npm run serve`: lint, watch and build and on files changes <br>
• `npm run build`: lint and build in `public` folder for production
