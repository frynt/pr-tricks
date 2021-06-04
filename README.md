# PR Tricks : Intro

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

## Test
`npx jest` or `npm run test`

#### ⚠️ Before starting the tutorial, you need to run `npm run build` once to generate `dist` directory. This dir is require to add the extension in chrome. 

## Tutorial : How to use the PR Tricks

### First Setup

- First, clone this repository, you will need the `dist` folder ton install the extension
- In Chrome, go to [extensions](chrome://extensions/)
![image](https://user-images.githubusercontent.com/82021898/120197967-e49aed80-c221-11eb-8251-d3bbdd0112ef.png)
- If not already the case, activate the developer mode (top right of the view)
- In the developer menu (just below the header), select "load unpacked" (charger l'extension non empaquetée) and load your local `dist` directory in PR Tricks project

- Once the extension is intalled, you should see it in the upper right corner of chrome
![image](https://user-images.githubusercontent.com/82021898/119953680-89a59400-bf9e-11eb-9ce8-f477f41522c6.png)


- Pin the extension on chrome is really recommended to easily access to the options, open the extension to start it


- Now go to your pull request and refresh de page, the extension should work and you should see highlight
![image](https://user-images.githubusercontent.com/82021898/120171664-90ccdc00-c202-11eb-8021-ca82bfbcd89a.png)

- Let's review the extension's options below
![image](https://user-images.githubusercontent.com/82021898/120172033-ef925580-c202-11eb-8b63-89c06371b26c.png)  


### Use "Mode formation"

- "Mode formation" allows to filter each tricks type foreach different trickList
![image](https://user-images.githubusercontent.com/82021898/119955268-30d6fb00-bfa0-11eb-9f7d-cdca7e0fc695.png)

### Use "Afficher les details"

- "Afficher les details" just show trick details on mouse hover foreach PR tricks

### Use "Couleur du thème"

- This option allows to change the extension background color and tricks highlight color on PR
- ![image](https://user-images.githubusercontent.com/82021898/119956616-91b30300-bfa1-11eb-8053-6bc27ad19388.png)

### Use "Ajouter une trickList externe"

- First, you need to create you own JSON file with all tricks propertys (You can you this as a model: https://mocki.io/v1/2d2d322f-8f8c-4158-8283-d081898f4df5). If you want to start from scratch you can do it. To host your JSON file, you can use https://mocki.io/.
![image](https://user-images.githubusercontent.com/82021898/119957372-4fd68c80-bfa2-11eb-8cba-6ebb8b06ed26.png)
![image](https://user-images.githubusercontent.com/82021898/119957440-5d8c1200-bfa2-11eb-9f55-7d63c8fdc55f.png)

- Then go to PR Tricks and choose a name for your trickList, paste your hosted JSON and press OK.
![image](https://user-images.githubusercontent.com/82021898/119957627-857b7580-bfa2-11eb-8c10-13a09517bfd3.png)

- Your list should appears below, you can activate, desactivate et delete it whenever you want.
- If you are using "Mode formation" you can see all the tricks of your import
![image](https://user-images.githubusercontent.com/82021898/119958055-f1f67480-bfa2-11eb-9653-ef47ff60559d.png)   

- You can import multiple trickList, but i advise to keep a maximum of 3 imports   


## Contributors

![Needone](https://static.wixstatic.com/media/4546b3_1dab3f320024483091b29f9b99da0e4e~mv2.png/v1/fill/w_166,h_60,al_c,q_80,usm_0.66_1.00_0.01/LogoNeedoneFull.webp)

Copyright © [Needone](https://www.needone.fr/)

## License 

Copyright (c) 2012-2021 apini

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
