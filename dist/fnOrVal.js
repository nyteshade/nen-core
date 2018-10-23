"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functionOrValue = functionOrValue;
exports.default = void 0;

/**
 * A function that will allow the presence of a function in the place of a 
 * value that can, instead generate the value. Any function supplied will 
 * use `this` bound to `functionOrValue()` as the `this` value for the 
 * supplied function; unless, of course, the supplied function is a big 
 * arrow function that cannot be rebound.
 *
 * @param {Function|mixed} fnOrVal either a function or value
 * @param {Array<mixed>} args an array of input that will be passed to any 
 * supplied function and ignored otherwise
 * @return {mixed} if the supplied input is a function the result of 
 * calling said function will be returned instead of the supplied input.
 */
function functionOrValue(fnOrVal) {
  var result = fnOrVal;

  if (typeof fnOrVal === 'function') {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    result = fnOrVal.apply(this, args);
  }

  return result;
}

var _default = functionOrValue;
exports.default = _default;