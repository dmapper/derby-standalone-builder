var derby = require('derby');
var coffeeify = require('coffeeify');
var yamlify = require('yamlify');
var fs = require('fs');
var path = require('path');
var overrideApp = require('./App.server');
var Memory = require('derby/node_modules/racer/node_modules/share/node_modules/livedb/lib/memory');
derby.use(require('racer-bundle'));

module.exports = function(app, publicPath, buildPath, initBundle, cb){
  buildPath || (buildPath = path.join(publicPath, 'derby'));

  var store = derby.createStore({db: new Memory()});
  var restoreApp = overrideApp( Object.getPrototypeOf(app) );

  store.on('bundle', prepareBundle(initBundle));

  bundleApp(app, store, publicPath, buildPath, function(){
    restoreApp();
    if (cb) cb(buildPath);
  });
};

function bundleApp(app, store, publicPath, buildPath, cb){

  app.views.register('HeadElement',
    '<meta charset="utf-8">' +
    '<view name="{{$render.prefix}}TitleElement"></view>' +
    '<view name="{{$render.prefix}}Styles"></view>' +
    '<view name="{{$render.prefix}}Head"></view>'
  );

  app.writeScripts(store, publicPath, {
    extensions: ['.coffee', '.yaml'],
    disableScriptMap: process.env.NODE_ENV === 'production',
    minify: process.env.NODE_ENV === 'production'
  }, function(err) {
    writeIndexHtml(app.scriptFilename, buildPath);
    cb();
  });
}

function writeIndexHtml(scriptPath, buildPath) {
  var skeleton = fs.readFileSync(path.join(__dirname, 'derby-standalone.html'));
  var scriptName = path.basename(scriptPath);
  var indexPath = path.join(buildPath, 'index.html');
  var outScriptPath = path.join(buildPath, scriptName);
  if (outScriptPath !== scriptPath) {
    fs.writeFileSync(outScriptPath, fs.readFileSync(scriptPath));
  }
  fs.writeFileSync(indexPath, skeleton +
    '<script src="./' + scriptName + '"></script>');
}

function prepareBundle(initBundle) {
  return function(browserify){
    if (initBundle) initBundle(browserify);

    // Transforms
    browserify.transform({global: true}, coffeeify);
    browserify.transform(yamlify);

    var pack = browserify.pack;
    browserify.pack = function(opts) {
      var detectTransform = opts.globalTransform.shift();
      opts.globalTransform.push(detectTransform);
      return pack.apply(this, arguments);
    };
  };
}