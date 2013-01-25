/**
 * Module dependencies
 */

var
  Emitter   = require('emitter'),
  events    = require('event'),
  domify    = require('domify'),
  rotate    = require('rotate'),
  template  = require('./template');

module.exports = Dial;

function Dial (input, options) {
  this.input = input;
  this.options = optionsFromAttrs(this.input, options);

  this.value = this.options.value;

  this.render();
  this.bind();
  this.hideInput();

  Emitter(this);

  this.input.parentNode.appendChild(this.el);
  this.rotate();
}

Dial.defaults = {
  min: 0,
  max: 10,
  value: 5,
  float: false
};

Dial.defaults.floatIncrement = (function () {
  var defaults = Dial.defaults;
  return (defaults.max - defaults.min) / 1000;
})();

Dial.prototype.render = function () {
  this.el = domify(template)[0];
  return this;
};

Dial.prototype.bind = function () {
  var that = this;

  events.bind(this.el, 'mousedown', function () {
    onMouseDown.apply(that, arguments);
  });

  // TODO HOW TO UNBIND THIS?
  events.bind(this.input, 'change', function () {
    that.set(this.value);
  });

  // Bind mouseup and movemouse handlers
  // to document for better dragging
  if (!Dial.docEventsBound) {
    events.bind(document, 'mouseup', onMouseUp);
    events.bind(document, 'mousemove', onMouseMove);

    Dial.docEventsBound = true;
  }

  return this;
};

Dial.prototype.destroy = function () {
  var parent = this.el.parentElement;
  events.unbind(this.input, 'mousedown');
  this.showInput();
  parent.removeChild(this.el);
  return this;
};

Dial.prototype.set = function (val) {
  if (val < this.options.min || val > this.options.max) {
    return;
  }
  this.input.value = val;
  this.value = val;
  this.emit('change');
  console.log('set: ' + val);
  this.rotate();
};

Dial.prototype.rotate = function () {
  var MIN_DEG = 0;
  var MAX_DEG = 270;
  var relative = (MAX_DEG / (this.options.max - this.options.min)) * this.value;
  rotate(this.el, (relative - MAX_DEG) * -1);
  console.log('rotating : ' + (relative - MAX_DEG) * -1);
};

Dial.prototype.hideInput = function () {
  this.originalDisplay = this.originalDisplay || this.input.style.display;
  this.input.style.display = 'none';
};

Dial.prototype.showInput = function () {
  this.input.style.display = this.originalDisplay;
};

function optionsFromAttrs (input, options) {
  return options;
}

function onMouseMove (e) {
  var dial = Dial.activeDial;

  if (!dial) { return; }

  var curPos = e.x;
  var lastPos = dial.pos !== undefined ? dial.pos : curPos;
  var sensitivity = 1;//dial.options.sensitivity;

  // Increase
  if (curPos > lastPos + sensitivity) {
    dial.set(dial.value + 1);
  // Decrease
  } else if (curPos < lastPos - sensitivity) {
    dial.set(dial.value - 1);
  }

  dial.pos = curPos;
}

function onMouseDown (e) {
  Dial.activeDial = this;
  e.preventDefault();
}

function onMouseUp (e) {
  Dial.activeDial = null;
}
