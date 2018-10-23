"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ObjectPath = exports.compress = exports.expand = exports.getVal = void 0;

var _fnOrVal = require("./fnOrVal");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ProtoProp = function ProtoProp(self, prop) {
  return self.constructor.prototype[prop];
};
/**
 * A way of, without using `eval` to reach deeply into an object in
 * search of a value.
 * 
 * @param {string} path a typical object path portion found after the
 * dot or brackets used in coding; if you are tring to access the 
 * value of `object.prop.array[3]` you would specify either one of
 * `prop.array[3]` or `prop.array.3`. Both of which would work
 * @param {Object} object the object that will be checked for a given
 * value
 */


var getVal = function getVal(path, object) {
  return compress(expand(path)).split('.').reduce(function (xs, x) {
    return xs && xs[x] ? xs[x] : null;
  }, object);
};
/**
 * Does some expansion from dot separated numerical indices to typical
 * bracketed notation
 * 
 * @param {string} path a path whose bracketed array indices are typically
 * eschewed for dots. Such as `array.3`. 
 * @return A `array.3` string would become `array[3]`
 */


exports.getVal = getVal;

var expand = function expand(path) {
  return path.replace(/\.(\d+)/g, '[$1]');
};
/**
 * Does some expansion from bracketed numerical indices to a compressed
 * dot separated notation.
 * 
 * @param {string} path a path whose bracketed array indices are typically
 * eschewed for dots. Such as `array[3]`. 
 * @return A `array[3]` string would become `array.3`
 */


exports.expand = expand;

var compress = function compress(path) {
  return path.replace(/\[(\d+)\]/g, '.$1');
};
/**
 * A class that provides deep getter/setter access to any real object
 * that it is used upon. A need arose for programmatic access to objects
 * repeatedly without having to test into each property access. A way 
 * that could be easily reused.  
 */


exports.compress = compress;
var _Symbol$toStringTag = Symbol.toStringTag;

var ObjectPath =
/*#__PURE__*/
function () {
  /**
   * Creates a new `ObjectPath` object that describes how an object will 
   * be accessed. 
   * 
   * Optionally, if a `modifierStore` is provided, a copy of any supplied
   * `modifier` to the call to `modify()` will be appended to an existing 
   * or previously created store under the Modifier.KEY
   * 
   * @param {string} pathToProp a typical object path portion found after 
   * the dot or brackets used in coding; if you are tring to access the 
   * value of `object.prop.array[3]` you would specify either one of
   * `prop.array[3]` or `prop.array.3`. Both of which would work
   * @param {Object} object the object that will be checked for a given
   * value
   */
  function ObjectPath(pathToProp, object) {
    _classCallCheck(this, ObjectPath);

    _defineProperty(this, "path", void 0);

    this.path = pathToProp;

    if (object) {
      this.constructor.bind(this, object);
    }
  }
  /**
   * Retrieves the value behind the path on the supplied object 
   * 
   * @param {mixed} object an object on which to access the variable
   * specified by the string path.
   * @return either null or the value referenced by the path on the 
   * supplied object
   */


  _createClass(ObjectPath, [{
    key: "get",
    value: function get(object) {
      if (!this.path) {
        return object;
      }

      return getVal(this.path, object);
    }
    /**
     * If the path to the property being accessed is not valid, an object 
     * that double equals ObjectPath.INVALID_PROPERTY will be returned. The
     * object will NOT triple equals that value however as it will have been
     * wrapped in an Object with an .error property containing the JavaScript 
     * error that occurred. 
     * 
     * In the happy path, the property pointed to by the path will be modified
     * and the final value returned.
     * 
     * @param {Object} object 
     * @param {mixed} newValue 
     * @param {Array<mixed>} args 
     */

  }, {
    key: "set",
    value: function set(object, newValue) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var value = _fnOrVal.functionOrValue.apply(void 0, [newValue].concat(args));

      if (!this.path) {
        object = value;
        return object;
      }

      try {
        return eval("(object.".concat(expand(this.path), " = value)"));
      } catch (error) {
        return Object.assign(Object(ObjectPath.INVALID_PROPERTY), {
          error: error
        });
      }
    }
    /**
     * Subtracts the value pointed to by this ObjectPath by the supplied value
     * or function that returns a calculated value. The newly set result will 
     * be returned.
     * 
     * @param {Object} object the object that has a property that is to be 
     * modified
     * @param {Number|Function} by a number or a function that returns a number 
     * that will be used to subtract from the target value
     * @param  {...any} args arguments that might be passed to a call to 
     * `functionOrValue` used on the `by` argument
     * @return {Number} will be either a numerical value or NaN if an attempt to
     * modify a non-number using mathmatical operations was used 
     */

  }, {
    key: "subtract",
    value: function subtract(object, by) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var amount = _fnOrVal.functionOrValue.apply(void 0, [by].concat(args));

      var current = ProtoProp(this, 'get').bind(this, object)();
      ProtoProp(this, 'set').bind(this, object)(current - amount);
      return this.get(object);
    }
    /**
     * Adds the value pointed to by this ObjectPath by the supplied value
     * or function that returns a calculated value. The newly set result will 
     * be returned.
     * 
     * @param {Object} object the object that has a property that is to be 
     * modified
     * @param {Number|Function} by a number or a function that returns a number 
     * that will be used to add to the target value
     * @param  {...any} args arguments that might be passed to a call to 
     * `functionOrValue` used on the `by` argument
     * @return {Number} will be either a numerical value or NaN if an attempt to
     * modify a non-number using mathmatical operations was used 
     */

  }, {
    key: "add",
    value: function add(object, by) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      var amount = _fnOrVal.functionOrValue.apply(void 0, [by].concat(args));

      var current = ProtoProp(this, 'get').bind(this, object)();
      ProtoProp(this, 'set').bind(this, object)(current + amount);
      return this.get(object);
    }
    /**
     * Multiplies the value pointed to by this ObjectPath by the supplied value
     * or function that returns a calculated value. The newly set result will 
     * be returned.
     * 
     * @param {Object} object the object that has a property that is to be 
     * modified
     * @param {Number|Function} by a number or a function that returns a number 
     * that will be used to multiply the target value
     * @param  {...any} args arguments that might be passed to a call to 
     * `functionOrValue` used on the `by` argument
     * @return {Number} will be either a numerical value or NaN if an attempt to
     * modify a non-number using mathmatical operations was used 
     */

  }, {
    key: "multiply",
    value: function multiply(object, by) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      var amount = _fnOrVal.functionOrValue.apply(void 0, [by].concat(args));

      var current = ProtoProp(this, 'get').bind(this, object)();
      ProtoProp(this, 'set').bind(this, object)(current * amount);
      return this.get(object);
    }
    /**
     * Divides the value pointed to by this ObjectPath by the supplied value
     * or function that returns a calculated value. The newly set result will 
     * be returned.
     * 
     * @param {Object} object the object that has a property that is to be 
     * modified
     * @param {Number|Function} by a number or a function that returns a number 
     * that will be used to divide target value by
     * @param  {...any} args arguments that might be passed to a call to 
     * `functionOrValue` used on the `by` argument
     * @return {Number} will be either a numerical value or NaN if an attempt to
     * modify a non-number using mathmatical operations was used 
     */

  }, {
    key: "divide",
    value: function divide(object, by) {
      for (var _len5 = arguments.length, args = new Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
        args[_key5 - 2] = arguments[_key5];
      }

      var amount = _fnOrVal.functionOrValue.apply(void 0, [by].concat(args));

      var current = ProtoProp(this, 'get').bind(this, object)();
      ProtoProp(this, 'set').bind(this, object)(current / amount);
      return this.get(object);
    }
    /**
     * Binds a new instance of ObjectPath to the supplied `object` so that they 
     * are not required as first parameters to `get`, `set`
     * 
     * @param {Object} object 
     */

  }, {
    key: "on",
    value: function on(object) {
      var path = new ObjectPath(this.path, object);
      return ObjectPath.bind(path, object);
    }
    /**
     * A `Symbol` that allows type discerning calls using variants of
     * `Object.prototype.toString.call` or `apply`
     * 
     * @return {string} a value matching the name of the class
     */

  }, {
    key: _Symbol$toStringTag,
    get: function get() {
      return this.constructor.name;
    }
    /**
     * 
     * @param {ObjectPath} instance an instance of ObjectPath
     * @param {Object} object the object to bind the ObjectPath to
     */

  }], [{
    key: "bind",
    value: function bind(instance, object) {
      instance.set = instance.set.bind(instance, object);
      instance.get = instance.get.bind(instance, object);
      instance.add = instance.add.bind(instance, object);
      instance.subtract = instance.subtract.bind(instance, object);
      instance.multiply = instance.multiply.bind(instance, object);
      instance.divide = instance.divide.bind(instance, object);
      instance.object = object;
      return instance;
    }
  }, {
    key: "INVALID_PROPERTY",
    get: function get() {
      return Symbol.for("[".concat(this.name, "]: Path appears invalid"));
    }
    /** 
     * A `string` that represents the path used to access the value
     * this ObjectPath instance works with
     */

  }]);

  return ObjectPath;
}();

exports.ObjectPath = ObjectPath;
var _default = ObjectPath;
exports.default = _default;