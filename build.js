/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-domify/index.js", function(module, exports, require){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];
  
  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return [el.removeChild(el.lastChild)];
  }
  
  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  return orphan(el.children);
}

/**
 * Orphan `els` and return an array.
 *
 * @param {NodeList} els
 * @return {Array}
 * @api private
 */

function orphan(els) {
  var ret = [];

  while (els.length) {
    ret.push(els[0].parentNode.removeChild(els[0]));
  }

  return ret;
}

});
require.register("component-event/index.js", function(module, exports, require){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-emitter/index.js", function(module, exports, require){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("gorillatron-extend/index.js", function(module, exports, require){

/*
 * @exports extend
*/

/**
  Extends a set of objects. Merges them into one new object
  @public
  @type Function
  @param {Boolean} deep Should it extend all child objects
  @param []{Object} splat objects to merge
*/
function extend( deep ) {
  var out, objs, i, obj, prop, val

  out = {}

  typeof deep === "boolean" ? ( objs = [].slice.call(arguments, 1), deep = deep ) :
                              ( objs = [].slice.call(arguments, 0), deep = false )

  for( i = 0; i < objs.length; i++ ) {

    obj = objs[ i ]

    for( prop in obj ) {
      val = obj[ prop ]
      if( deep && typeof val === "object" && typeof out[prop] === "object") {
        out[ prop ] = extend( out[prop], val )
      } else {
        out[ prop ] = val
      }
      
    }
  }

  return out
}


module.exports = extend
});
require.register("jsantell-rotate/index.js", function(module, exports, require){
/**
 * rotate becomes the function that
 * is exposed
 */

var rotate = (function () {
  var el = document.createElement('div');
  var style = el.style;
  var css3Prop = 
    (style.transform       !== undefined && 'transform')       ||
    (style.webkitTransform !== undefined && 'webkitTransform') ||
    (style.MozTransform    !== undefined && 'MozTransform')    ||
    (style.msTransform     !== undefined && 'msTransform');

  if (css3Prop) {
    return makeCSS3Rotate(css3Prop);
  } else {
    // TODO implement rotation support for < IE8 ?
    return function () {};
  }
})();

/**
 * Returns a function that takes an element
 * and rotates it by degrees, based off of
 * CSS3 syntax on style property `prop`
 *
 * @param {String} prop
 * @return {Function}
 * @api private
 */

function makeCSS3Rotate (prop) {
  return function (el, deg) {
    el.style[ prop ] = 'rotate(' + deg + 'deg)';
  };
}

/**
 * Expose generated rotate function
 */

module.exports = rotate;

});
require.register("manuelstofer-each/index.js", function(module, exports, require){
"use strict";

var nativeForEach = [].forEach;

// Underscore's each function
module.exports = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
};

});
require.register("dial/index.js", function(module, exports, require){
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

});
require.register("dial/template.js", function(module, exports, require){
module.exports =
'<div class="dial-container">' +
  '<div class="dial-point"></div>' +
  '<div class="dial-dial"></div>' +
'</div>';

});
require.alias("component-domify/index.js", "dial/deps/domify/index.js");

require.alias("component-event/index.js", "dial/deps/event/index.js");

require.alias("component-emitter/index.js", "dial/deps/emitter/index.js");

require.alias("gorillatron-extend/index.js", "dial/deps/extend/index.js");

require.alias("jsantell-rotate/index.js", "dial/deps/rotate/index.js");

require.alias("manuelstofer-each/index.js", "dial/deps/each/index.js");
