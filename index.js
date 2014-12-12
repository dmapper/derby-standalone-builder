exports.build = require('./lib/build');

exports.runTestServer = function(publicPath){
  var app = require('connect')();
  var serveStatic = require('serve-static');
  app.use(serveStatic(path.join(publicPath, 'derby')));
  app.use(serveStatic(publicPath));
  var port = process.env.PORT || 3000;
  app.listen(port, function(err){
    console.log('Derby-standalone test server is running at http://localhost:' +
      port);
  });
};
