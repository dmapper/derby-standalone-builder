var derby = require('derby');
var coffeeify = require('coffeeify');
var yamlify = require('yamlify');
var fs = require('fs');
var path = require('path');
var overrideApp = require('./App.server');
var Memory = require('derby/node_modules/racer/node_modules/share/node_modules/livedb/lib/memory');
derby.use(require('racer-bundle'));

module.exports = function(app, publicPath, outPath, initBundle, cb){
  outPath || (outPath = path.join(publicPath, 'derby/index.html'));

  var store = derby.createStore({db: new Memory()});
  var restoreApp = overrideApp( Object.getPrototypeOf(app) );

  store.on('bundle', prepareBundle(initBundle));

  bundleApp(app, store, publicPath, outPath, function(){
    restoreApp();
    if (cb) cb(outPath);
  });
};

function bundleApp(app, store, publicPath, outPath, cb){

  app.views.register('HeadElement',
    '<meta charset="utf-8">' +
    '<view name="{{$render.prefix}}TitleElement"></view>' +
    '<view name="{{$render.prefix}}Styles"></view>' +
    '<view name="{{$render.prefix}}Head"></view>'
  );

  app.writeScripts(store, publicPath, {
    extensions: ['.coffee', '.yaml'],
    disableScriptMap: process.env.NODE_ENV === 'production'
  }, function(err) {
    writeIndexHtml(app.scriptFilename, outPath);
    cb();
  });
}

function writeIndexHtml(scriptFilepath, outPath) {
  var skeleton = fs.readFileSync(path.join(__dirname, 'derby-standalone.html'));
  var script = fs.readFileSync(scriptFilepath);
  fs.writeFileSync(outPath, skeleton +
    '<script charset="UTF-8">\n' +
      '<!--\n' +
      '(function(){\n' +
        'window.isStandalone = true;\n' +
        script +
      '\n})();\n' +
      '// -->\n' +
    '</script>');
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