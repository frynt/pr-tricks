# PR Tricks Chrome Extension

An extension for google chrome to automatically analyse pull requests

![image](https://user-images.githubusercontent.com/16685940/112637090-12d50900-8e3e-11eb-8ce5-b6f10cc2d342.png)


## Prerequisites

* [node + npm](https://nodejs.org/) (Current Version)

## Project Structure

* src/.ts: TypeScript source files
* dist: Chrome Extension directory

## Setup

```
npm install
```

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

In Chrome, go to [extensions](chrome://extensions/)
If not already the case, activate the developer mode (top right of the view)
In the developer menu (just below the header), select "load unpacked" (charger l'extension non empaquetée) and load your local `dist` directory

## Test
`npx jest` or `npm run test`
