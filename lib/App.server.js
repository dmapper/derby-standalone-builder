var crypto = require('crypto');
var through = require('derby/node_modules/through');

module.exports = function(AppProto) {

  var origBundle = AppProto.bundle;
  util = { isProduction: false };

  AppProto.bundle = function (store, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = null;
    }
    options || (options = {});
    if (options.minify == null) options.minify = util.isProduction;
    // Turn all of the app's currently registered views into a javascript
    // function that can recreate them in the client

    // [Standalone] Derby-standalone also needs server views to be present
    var viewsSource = this._viewsSource({server: true});

    var bundleFiles = [];
    store.once('bundle', function (bundle) {

      // [Standalone] Expose derby-standalone as derby
      bundle.require(path.join(__dirname, 'derby-standalone.js'),
        {expose: 'derby'});

      // Hack to inject the views script into the Browserify bundle by replacing
      // the empty _views.js file with the generated source
      // [Standalone] Path to _views from derby module
      var viewsFilename = require.resolve('derby/lib/_views');
      bundle.transform(function (filename) {
        if (filename !== viewsFilename) return through();
        return through(
          function write() {
          }
          , function end() {
            this.queue(viewsSource);
            this.queue(null);
          }
        );
      });
      bundle.on('file', function (filename) {
        bundleFiles.push(filename);
      });
    });
    var app = this;
    store.bundle(app.filename, options, function (err, source, map) {
      if (err) return cb(err);
      app.scriptHash = crypto.createHash('md5').update(source).digest('hex');
      source = source.replace('{{DERBY_SCRIPT_HASH}}', app.scriptHash);
      source = source.replace(/['"]{{DERBY_BUNDLED_AT}}['"]/, Date.now());
      if (!util.isProduction) {
        app._autoRefresh(store);
        app._watchBundle(bundleFiles);
      }
      cb(null, source, map);
    });
  };

  // Return function that can revert original state of App
  return function(){
    AppProto.bundle = origBundle;
  };

};