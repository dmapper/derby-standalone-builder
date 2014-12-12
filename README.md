# derby-standalone-builder

> Build **Derby-standalone** app from regular **Derby.js** app

The result you get is a single file with your Derby app that can be 
run offline and hosted on a static website hosting providers like
[GitHub Pages](https://pages.github.com/)


## Usage

### builder.build(app, publicPath, outPath, initBundle, cb)

`outPath` by default is `publicPath + '/derby/index.html'`

### Simplest example:

```js
// build.js

var app = require('./src/app');
var builder = require('derby-standalone-builder')

builder.build(app, __dirname);
```

Run with `node build.js` and open the generated `./derby/index.html` file
directly in your browser to check that it's working offline.

### Example with more options and a test server running to quickly test build.

```coffee
# build.coffee

# Require your regular Derby.js app
app = require './src/app'

builder = require 'derby-standalone-builder'
path = require 'path'

publicPath = path.normalize(__dirname + '/public') 

builder.build app, publicPath, null
, (browserify) ->
  # Put here some additional scripts to include into bundle 
  # or expose via browserify.require  

  # I.e. jQuery installed via Bower:
  browserify.add path.join publicPath, 'vendor/jquery/dist/jquery.js'  
  
, (outPath) ->  
  console.log 'Derby-standalone build created: ' + outPath
  builder.runTestServer(publicPath)
```

Run 

```bash
coffee build.coffee
```

This will genenate a **Derby-standalone** app from your regular **Derby.js** 
app and run a simple server on `localhost:3000` which serves the result of 
the build -- single static `index.html` file.


## licence

MIT