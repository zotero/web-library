'use strict';

var extend = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
};

var render = require('./render.js');
var readstate = require('./readstate.js');
var misc = require('./misc.js');
var init = require('./init.js');
var format = require('./format.js');

var ui = extend({}, render, readstate, misc, init, format);

module.exports = ui;
