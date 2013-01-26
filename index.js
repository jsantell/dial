/**
 * Module dependencies
 */

var
  Emitter   = require('emitter'),
  events    = require('event'),
  domify    = require('domify'),
  rotate    = require('rotate'),
  extend    = require('extend'),
  template  = require('./template');

/**
 * Expose `Dial`
 */

module.exports = Dial;

/**
 * A constructor for a Dial object,
 * creating a radial UI dial controlling
 * an input field
 *
 * Options
 *
 * - `min` minimum value
 * - `max` maximum value
 * - `float` boolean determing whether floats are allowed
 * - `increment` value to increment by
 * - `value` starting value
 *
 * @param {HTMLInputElement} input
 * @param {Object} options
 * @api public
 */

function Dial (input, options) {
  this.input = input;
  this.options = extend(false,
    Dial.defaults,
    optionsFromAttrs(this.input),
    options
  );

  Emitter(this);

  this.value = this.options.value;

  this
    .setDefaultIncrement()
    .render()
    .bind()
    .hideInput();

  this.input.parentNode.appendChild(this.el);
  this.rotate();
}

/**
 * Defaults for each dial.
 * Increment is handled in setDefaultIncrement
 */

Dial.defaults = {
  min: 0,
  max: 10,
  value: 5,
  float: false,
  increment: null
};

/**
 * Creates the dial's `el` property
 *
 * @return {Dial}
 * @api public
 */

Dial.prototype.render = function () {
  this.el = domify(template)[0];
  return this;
};

/**
 * Binds mouse events for the dial element,
 * and on document if not already bound
 *
 * @return {Dial}
 * @api public
 */

Dial.prototype.bind = function () {
  var that = this;

  events.bind(this.el, 'mousedown', mouseDownHandler);
  events.bind(this.input, 'change', inputChangeHandler);

  // Bind mouseup and movemouse handlers
  // to document for better dragging
  if (!Dial.docEventsBound) {
    events.bind(document, 'mouseup', onMouseUp);
    events.bind(document, 'mousemove', onMouseMove);

    Dial.docEventsBound = true;
  }
  
  /**
   * Unbinds dial's events, not on prototype
   * due to unbinding event on input element in scope
   *
   * @return {Dial}
   * @api public
   */
  
  this.unbind = function () {
    events.unbind(this.el, 'mousedown');
    events.unbind(this.input, 'change', inputChangeHandler);
    return this;
  };

  function mouseDownHandler () {
    onMouseDown.apply(that, arguments);
  }

  function inputChangeHandler () {
    that.set(this.value);
  }

  return this;
};

/**
 * Removes dial element, reveals original input element,
 * unbinds dial events.
 *
 * @return {Dial}
 * @api public
 */

Dial.prototype.destroy = function () {
  var parent = this.el.parentElement;
  this.unbind();
  this.showInput();
  parent.removeChild(this.el);
  return this;
};

/**
 * Sets the dial's value if in allowed range,
 * rounds to integer if needed, updates the corresponding
 * input element, rotates dial and fires a change event
 *
 * @param {Number} val
 * @return {Dial}
 * @api public
 */

Dial.prototype.set = function (val) {
  if (val < this.options.min || val > this.options.max) {
    return;
  }
  if (!this.options.float) {
    val = ~~val;
  }
  this.input.value = val;
  this.value = val;
  this.emit('change', val);
  this.rotate();
  return this;
};

/**
 * Rotates the dial el based off of current
 * dial's value
 *
 * @return {Dial}
 * @api public
 */

Dial.prototype.rotate = function () {
  var MAX_DEG = 270;
  var shift = 405;
  var relative = (MAX_DEG / (this.options.max - this.options.min)) *
    (this.value - this.options.min);
  var degrees = relative - MAX_DEG + shift;

  rotate(this.el, degrees);

  return this;
};

/**
 * Hides original input element
 *
 * @return this;
 */

Dial.prototype.hideInput = function () {
  this.originalDisplay = this.originalDisplay || this.input.style.display;
  this.input.style.display = 'none';
  return this;
};

/**
 * Shows original input element
 *
 * @return this;
 */

Dial.prototype.showInput = function () {
  this.input.style.display = this.originalDisplay;
  return this;
};

/**
 * If no increment specific in config or attributes,
 * set an increment of a 1/25th of the allowable range.
 * Round to integer if necessary.
 *
 * @return this
 * @api public
 */

Dial.prototype.setDefaultIncrement = function () {
  var options = this.options;
  var increment;
  if (!options.increment) {
    increment = (options.max - options.min) / 25;
    if (!options.float) {
      increment = ~~increment || 1;
    }
    options.increment = increment;
  }

  return this;
};

/**
 * Takes an input element and parses attributes
 * and returns an object containing the attributes
 * if not empty.
 *
 * @param {HTMLInputElement} input
 * @return {Object}
 * @api private
 */

function optionsFromAttrs (input) {
  var options = {};
  var min = parseFloatAttr(input, 'min');
  var max = parseFloatAttr(input, 'max');
  var value = parseFloatAttr(input, 'value');
  var float = !!input.getAttribute('data-float');
  var inc = parseFloatAttr(input, 'increment');

  min   != undefined && (options.min       = min);
  max   != undefined && (options.max       = max);
  float != undefined && (options.float     = float);
  inc   != undefined && (options.increment = inc);
  value !== ''       && (options.value     = value);

  return options;
}

/**
 * Parses an attribute on an element
 * and returns as float if it exists
 *
 * @param {HTMLInputElement} el
 * @param {String} attr
 * @return {Mixed}
 * @api private
 */

function parseFloatAttr (el, attr) {
  var value = attr === 'value' ?
    el.value :
    el.getAttribute('data-' + attr);

  value = value && parseFloat(value);

  return value;
}

function onMouseMove (e) {
  var dial = Dial.activeDial;

  if (!dial) { return; }

  var options = dial.options;
  var curPos = e.pageX;
  var lastPos = dial.pos !== undefined ? dial.pos : curPos;

  // Increase
  if (curPos > lastPos) {
    dial.set(dial.value + options.increment);
  // Decrease
  } else if (curPos < lastPos) {
    dial.set(dial.value - options.increment);
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
