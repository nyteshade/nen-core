// @flow

import { functionOrValue } from './fnOrVal'
import { createEnum } from './enumeration'
import deepEqual from 'deep-equal'

/**
 * A flow type indicating that a pattern is any one of a Function, Regular
 * Expression, String or Object. Or, it can be an array of any of these things
 */
export type Pattern = Function | RegExp | String | Object | Array<Pattern>

/**
 * A fast function using Object.prototype.toString.[call|apply] in order to
 * check the underlying class of the supplied value. If the underlying class
 * is a [object RegExp] then true is returned; false otherwise
 * 
 * @param {mixed} o the object to test for being a RegExp instance
 * @return true if the object is a regular expression, false otherwise 
 */
const isRegExp = (o) => /object RegExp/.test(Object.prototype.toString.call(o))

/**
 * An enumeration that denotes two potentialities; MATCH_ALL matches all 
 * targets supplied to the matcher and failing to do so returns false and 
 * the default MATCH_ANY indicates that only a single match is requried for
 * sucecss.
 */
export const Matches = createEnum(
  ['MATCH_ANY', 'Matches any value in the list or fail'],
  ['MATCH_ALL', 'Matches all values in the list or fail'],
  ['MATCH_MANY', 'Matches as many values in the list as possible']
)

/**
 * The Matcher class is the heart of this module. The purpose of the Matcher
 * is to be able to, in a reusable fashion, sport several patterns that it 
 * should universally report true to when matched against external targets or 
 * values. 
 */
export class Matcher {
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
  constructor(
    pattern: Pattern, 
    matchingBehavior: number = Matches.MATCH_MANY
  ) {
    this.pattern = pattern
    this.prefs = matchingBehavior
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
  match(target, ...args): boolean {
    return !!this.findMany([target], ...args).length
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
  find(target, ...args): mixed {
    let results = this.findMany([target], ...args)

    return results.length ? results[0] : null
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
  matchMany(targets, ...args): boolean {
    let targetsIn = targets.length 
    let targetsOut = this.findMany(targets, ...args).length

    switch (this.prefs) {
      default:
      case Matches.MATCH_MANY:
      case Matches.MATCH_ANY:
        return targetsOut > 0

        break;
      case Matches.MATCH_ALL:
        return targetsOut === targetsIn

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
  findMany(targets, ...args): Array<mixed> {
    let targetsMatched = []

    for (let target of targets) {
      let tarIsRegExp = isRegExp(target)
      let patterns = Array.isArray(this.pattern) 
        ? this.pattern 
        : [this.pattern]

      for (let pattern of patterns) {
        let value = functionOrValue.bind(this)(pattern, ...args)
        let valIsRegExp = isRegExp(value)

        if (
          deepEqual(target, value) ||
          (valIsRegExp && value.test(target)) ||
          target.valueOf() === value.valueOf()
        ) {
          if (this.prefs === Matches.MATCH_ANY) {
            return [target]
          }
          targetsMatched.push(target)
        }
      }
    }

    switch (this.prefs) {
      default: 
      case Matches.MATCH_MANY:
        return targetsMatched

        break;
      case Matches.MATCH_ALL:
        if (targetsMatched.length === targets.length) {
          return targetsMatched
        }

        break;
    }

    return []
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
  keyOf(object) {
    let keys = this.keysOf(object)
    return keys.length ? keys[0] : null
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
  keysOf(object) {
    let keys = Object.keys(object) 
    let props = this.findMany(keys)

    return props
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
  valueOf(object) {
    let values = this.valuesOf(object)
    return values.length ? values[0] : null
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
  valuesOf(object) {
    let keys = Object.keys(object) 
    let props = this.findMany(keys)

    return props.map(key => object[key])
  }

  /**
   * Like `valueOf`, searches a given object for a matching key and returns 
   * both the key and value as a two element array.
   * 
   * @param {Object} object the object whose keys will be matched using this
   * Matcher instance.
   * @return {[string|Symbol, mixed]}
   */
  entryOf(object) {
    let values = this.entriesOf(object)

    return values.length ? values[0] : null
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
  entriesOf(object) {
    let keys = Object.keys(object) 
    let props = this.findMany(keys)

    return props.map(key => [key, object[key]])
  }

  /**
   * The enumeration Matches can also be accessed via Matcher.Matches.MATCH_ALL
   * or Matcher.Matches.MATCH_ANY. This is a convenience getter so that 
   * multiple imports are not required.
   */
  static get Matches() { return Matches }

  /**
   * A class property that stores the pattern or patterns this matcher is 
   * aware of when comparing target values using the `.match()` or 
   * `.matchMany()` member functions
   * 
   * @type {Pattern}
   */
  pattern: Pattern

  /**
   * Reserved for storing the preferences for this class instance. Currently 
   * only a number matching an enumeration entry in `Matches` is stored here
   */
  prefs: number
}

export default Matcher