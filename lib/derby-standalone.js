var DerbyStandalone = require('derby/lib/DerbyStandalone');
var derbyTemplates = require('derby/node_modules/derby-templates');
var serializedViews = require('derby/lib/_views');

DerbyStandalone.prototype.App.prototype._init = function() {
  this.model = new this.derby.Model();
  serializedViews(derbyTemplates, this.views);
  this._contentReady();
};

DerbyStandalone.prototype.App.prototype._finishInit = function() {
  this.emit('model', this.model);
  var page = this.createPage();
  page._renderHead();
  this._waitForAttach = false;
  this.history.refresh();
  this.emit('ready', page);
};

DerbyStandalone.prototype.Page.prototype._renderHead = function() {
  this._setRenderParams();
  var headElement = document.getElementsByTagName('head')[0];
  var headFragment = this.getFragment('HeadElement');
  headElement.parentNode.replaceChild(headFragment, headElement);
};

module.exports = new DerbyStandalone();