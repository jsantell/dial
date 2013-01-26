rotate
====

A UI dial component for use with [component](https://github.com/component/component). Bind to an input field and turn it into a sleek dial.

## Installation

```
component install jsantell/dial
```

## API

### new Dial(input, [options])

Create a new dial instance, linked to `inputEl`. May also pass in an options object, details in options section. Upon instantiation, the dial is rendered, the input is hidden, and events are bound to the dial.

```js
var Dial = require('dial');
var input = document.getElementById('inputEl');
var dial = new Dial(input, {
  min: -25,
  max: 25
});
```

### Dial#set(val)

If `val` is within the allowed range, it is set on the input field and the dial is updated accordingly. A `change` event is fired with the `val` passed in as the only argument.

### Dial#destroy()

Destroys the dials element, reveals original input element and unbinds dial events

## Events

Dial inherits from [Emitter](https://github.com/component/emitter), so all emitter methods apply. By default, only a `change` event is fired when the dial's value changes, which can be hooked into via:

```js
var dial = new Dial(input);
dial.on('change', function (val) {
  console.log('Dial value is now: ' + val);
});
```

## Options

Configuration options can be set up via the option object in the constructor, data attributes in the input element, or by default -- this is also the order in which they're checked on a property by property basis.

Using options object:

```js
var dial = new Dial(input, {
  min: -10,
  max: 10,
  value: 0,
  float: true,
  increment: 0.5
});
```

Or using data attributes (and value) on an input element:

```
<input type="text" data-min="-10" data-max="10" float="true" data-increment="0.5" value="0" />
```

Or just falling back to defaults which are:

```js
min   : 0
max   : 10
value : 5
float : false
increment : // 1/25th of the range between min and max
```
