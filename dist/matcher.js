"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Matcher = exports.Matches = void 0;

var _fnOrVal = require("./fnOrVal");

var _enumeration = require("./enumeration");

var _deepEqual = _interopRequireDefault(require("deep-equal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * A fast function using Object.prototype.toString.[call|apply] in order to
 * check the underlying class of the supplied value. If the underlying class
 * is a [object RegExp] then true is returned; false otherwise
 * 
 * @param {mixed} o the object to test for being a RegExp instance
 * @return true if the object is a regular expression, false otherwise 
 */
var isRegExp = function isRegExp(o) {
  return /object RegExp/.test(Object.prototype.toString.call(o));
};
/**
 * An enumeration that denotes two potentialities; MATCH_ALL matches all 
 * targets supplied to the matcher and failing to do so returns false and 
 * the default MATCH_ANY indicates that only a single match is requried for
 * sucecss.
 */


var Matches = (0, _enumeration.createEnum)(['MATCH_ANY', 'Matches any value in the list or fail'], ['MATCH_ALL', 'Matches all values in the list or fail'], ['MATCH_MANY', 'Matches as many values in the list as possible']);
/**
 * The Matcher class is the heart of this module. The purpose of the Matcher
 * is to be able to, in a reusable fashion, sport several patterns that it 
 * should universally report true to when matched against external targets or 
 * values. 
 */

exports.Matches = Matches;

var Matcher =
/*#__PURE__*/
function () {
  /**
   * Creates a new Matcher that knows how to compare and match itself using the
   * supplied pattern or patterns against any external value passed to the 
   * `match` or `matchMany` functions inside
   * 
   * @param {Pattern} pattern a string, regular expression, object, a function 
   * that returns any of the above or an array containing n-number of the 
   * previous values.
   * @param {number} matchingBehavior a value as determined by the Matches
   * enumeration. Either `Matches.MATCH_ANY` or `Matches.MATCH_ALL` should be
   * supplied. The default is `Matches.MATCH_ANY`
   */
  function Matcher(pattern) {
    var matchingBehavior = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Matches.MATCH_MANY;

    _classCallCheck(this, Matcher);

    _defineProperty(this, "pattern", void 0);

    _defineProperty(this, "prefs", void 0);

    this.pattern = pattern;
    this.prefs = matchingBehavior;
  }
  /**
   * Matches this Matcher against any single target value supplied. If the
   * Matcher has pattern functions inside that require parameters, those
   * should be supplied as subsequent parameters to this function and when 
   * the pattern is encountered, they will be passed on.
   * 
   * For example:
   * ```
   *   let m = new Matcher((o = 0) => 3 + o)
   *   m.match(5) // false
   *   m.match(5, 2) // true as the 2 will be passed to the as o to the pattern
   * ```
   * 
   * @param {mixed} target any single target this Matcher should compare itself
   * to in an effort to produce a match
   * @param  {...any} args an array of parameters that will be passed to any
   * pattern functions this matcher uses to match the supplied target. 
   * @return {boolean} return true if there is even a single match; false 
   * otherwise
   */


  _createClass(Matcher, [{
    key: "match",
    value: function match(target) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return !!this.findMany.apply(this, [[target]].concat(args)).length;
    }
    /**
     * Matches this Matcher against any single target value supplied. If the
     * Matcher has pattern functions inside that require parameters, those
     * should be supplied as subsequent parameters to this function and when 
     * the pattern is encountered, they will be passed on.
     * 
     * For example:
     * ```
     *   let m = new Matcher((o = 0) => 3 + o)
     *   m.find(5) // null
     *   m.find(5, 2) // 2 as the 2 will be passed to the as o to the pattern
     * ```
     * 
     * Unlike `match()` results, the matched value is what is returned.
     * 
     * @param {mixed} target any single target this Matcher should compare itself
     * to in an effort to produce a match
     * @param  {...any} args an array of parameters that will be passed to any
     * pattern functions this matcher uses to match the supplied target. 
     * @return {mixed} return any found target using the matcher. 
     */

  }, {
    key: "find",
    value: function find(target) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var results = this.findMany.apply(this, [[target]].concat(args));
      return results.length ? results[0] : null;
    }
    /**
     * Matches this Matcher against number of target values supplied. If the
     * Matcher has pattern functions inside that require parameters, those
     * should be supplied as subsequent parameters to this function and when 
     * the pattern is encountered, they will be passed on.
     * 
     * For example:
     * ```
     *   let m = new Matcher((o = 0) => 3 + o)
     *   m.matchMany([4,5]) // false
     *   m.matchMany([4,5], 2) // true as 3 + 2 == 5; 2 is passed as o 
     *   m.matchMany([4,5], 1) // true as 3 + 1 == 4; 1 is passed as o
     * ```
     * 
     * Note that in multi-targeted situations, if the matching behavior this
     * class instance was created with is `Matches.MATCH_ALL` then all targets
     * to `.matchMany()` must be matched or falure is the result
     * 
     * For example:
     * ```
     *   let m = new Matcher([3, 5], Matches.MATCH_ALL)
     *   m.matchMany([1,3,5]) // false; only two items matched a pattern
     *   m.matchMany([3,3,5]) // true; all three items matched a pattern
     * ```
     * 
     * @param {mixed} target any single target this Matcher should compare itself
     * to in an effort to produce a match
     * @param  {...any} args an array of parameters that will be passed to any
     * pattern functions this matcher uses to match the supplied target. 
     * @return {boolean} true if prefs are MATCH_ANY and there is at least one
     * result or if prefs are MATCH_ALL and the number of targets in is equal
     * to the number of targets out.
     */

  }, {
    key: "matchMany",
    value: function matchMany(targets) {
      var targetsIn = targets.length;

      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var targetsOut = this.findMany.apply(this, [targets].concat(args)).length;

      switch (this.prefs) {
        default:
        case Matches.MATCH_MANY:
        case Matches.MATCH_ANY:
          return targetsOut > 0;
          break;

        case Matches.MATCH_ALL:
          return targetsOut === targetsIn;
          break;
      }
    }
    /**
     * Matches this Matcher against number of target values supplied. If the
     * Matcher has pattern functions inside that require parameters, those
     * should be supplied as subsequent parameters to this function and when 
     * the pattern is encountered, they will be passed on.
     * 
     * For example:
     * ```
     *   let m = new Matcher((o = 0) => 3 + o)
     *   m.findMany([4,5]) // []
     *   m.findMany([4,5], 2) // [5] as 3 + 2 == 5; 2 is passed as o 
     *   m.findMany([4,5], 1) // [4] as 3 + 1 == 4; 1 is passed as o
     * ```
     * 
     * Note that in multi-targeted situations, if the matching behavior this
     * class instance was created with is `Matches.MATCH_ALL` then all targets
     * to `.findMany()` must be matched or falure is the result
     * 
     * For example:
     * ```
     *   let m = new Matcher([3, 5], Matches.MATCH_ALL)
     *   m.findMany([1,3,5]) // []; only two items matched a pattern
     *   m.findMany([3,3,5]) // [3,3,5]; all three items matched a pattern
     * ```
     * 
     * @param {mixed} target any single target this Matcher should compare itself
     * to in an effort to produce a match
     * @param  {...any} args an array of parameters that will be passed to any
     * pattern functions this matcher uses to match the supplied target. 
     * @return {Array<mixed>} the items found in the list of supplied targets; if
     * Matches.MATCH_ALL is supplied when the Matcher is created then if all 
     * items are matched then the list should be the same as targets, otherwise 
     * an empty array is returned
     */

  }, {
    key: "findMany",
    value: function findMany(targets) {
      var targetsMatched = [];

      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = targets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var target = _step.value;
          var tarIsRegExp = isRegExp(target);
          var patterns = Array.isArray(this.pattern) ? this.pattern : [this.pattern];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = patterns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var pattern = _step2.value;

              var value = _fnOrVal.functionOrValue.bind(this).apply(void 0, [pattern].concat(args));

              var valIsRegExp = isRegExp(value);

              if ((0, _deepEqual.default)(target, value) || valIsRegExp && value.test(target) || target.valueOf() === value.valueOf()) {
                if (this.prefs === Matches.MATCH_ANY) {
                  return [target];
                }

                targetsMatched.push(target);
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      switch (this.prefs) {
        default:
        case Matches.MATCH_MANY:
          return targetsMatched;
          break;

        case Matches.MATCH_ALL:
          if (targetsMatched.length === targets.length) {
            return targetsMatched;
          }

          break;
      }

      return [];
    }
    /**
     * Searches an object's keys using this Matcher and returns the first 
     * key that whose key matches. Null will be returned if there is no 
     * match at all.
     * 
     * @param {Object} object the object whose keys will be matched against
     * @return {mixed} the key for any key in the supplied object that 
     * matches this Matcher. 
     */

  }, {
    key: "keyOf",
    value: function keyOf(object) {
      var keys = this.keysOf(object);
      return keys.length ? keys[0] : null;
    }
    /**
     * Searches and object's keys using this Matcher and returns all the 
     * matches in the object if Matches.MATCH_ALL was supplied or the first 
     * match if the default or Matches.MATCH_ANY is found. 
     * 
     * @param {Object} object the object whose keys will be matched using this
     * Matcher instance.
     * @return {mixed} the key as an array, all the keys if Matches.MATCH_ALL
     * is used, or an empty array if nothing (or not all items) was/were found.
     */

  }, {
    key: "keysOf",
    value: function keysOf(object) {
      var keys = Object.keys(object);
      var props = this.findMany(keys);
      return props;
    }
    /**
     * Searches an object's keys using this Matcher and returns the first 
     * value that whose key matches. Null will be returned if there is no 
     * match at all.
     * 
     * @param {Object} object the object whose keys will be matched against
     * @return {mixed} the value for any key in the supplied object that 
     * matches this Matcher. 
     */

  }, {
    key: "valueOf",
    value: function valueOf(object) {
      var values = this.valuesOf(object);
      return values.length ? values[0] : null;
    }
    /**
     * Searches and object's keys using this Matcher and returns all the 
     * matches in the object if Matches.MATCH_ALL was supplied or the first 
     * match if the default or Matches.MATCH_ANY is found. 
     * 
     * @param {Object} object the object whose keys will be matched using this
     * Matcher instance.
     * @return {mixed} the value as an array, all the values if Matches.MATCH_ALL
     * is used, or an empty array if nothing (or not all items) was/were found.
     */

  }, {
    key: "valuesOf",
    value: function valuesOf(object) {
      var keys = Object.keys(object);
      var props = this.findMany(keys);
      return props.map(function (key) {
        return object[key];
      });
    }
    /**
     * Like `valueOf`, searches a given object for a matching key and returns 
     * both the key and value as a two element array.
     * 
     * @param {Object} object the object whose keys will be matched using this
     * Matcher instance.
     * @return {[string|Symbol, mixed]}
     */

  }, {
    key: "entryOf",
    value: function entryOf(object) {
      var values = this.entriesOf(object);
      return values.length ? values[0] : null;
    }
    /**
     * Like `valuesOf`, searches a given object for matching keys and returns 
     * both the key and value as elements of an array.
     * 
     * @param {Object} object the object whose keys will be matched using this
     * Matcher instance.
     * @return {Array<[string|Symbol, mixed]>} an array of two element entries
     * where the first element is the key and the second element is a value. If 
     * no matches are found or if MATCHES_ALL is set and not all elements match, 
     * then an empty array is returned instead.
     */

  }, {
    key: "entriesOf",
    value: function entriesOf(object) {
      var keys = Object.keys(object);
      var props = this.findMany(keys);
      return props.map(function (key) {
        return [key, object[key]];
      });
    }
    /**
     * The enumeration Matches can also be accessed via Matcher.Matches.MATCH_ALL
     * or Matcher.Matches.MATCH_ANY. This is a convenience getter so that 
     * multiple imports are not required.
     */

  }], [{
    key: "Matches",
    get: function get() {
      return Matches;
    }
    /**
     * A class property that stores the pattern or patterns this matcher is 
     * aware of when comparing target values using the `.match()` or 
     * `.matchMany()` member functions
     * 
     * @type {Pattern}
     */

  }]);

  return Matcher;
}();

exports.Matcher = Matcher;
var _default = Matcher;
exports.default = _default;