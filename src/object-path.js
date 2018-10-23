import { functionOrValue } from './fnOrVal'

const ProtoProp = (self, prop) => self.constructor.prototype[prop]

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
export const getVal = (path, object) => (
  compress(expand(path))
  .split('.')
  .reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, object)
)

/**
 * Does some expansion from dot separated numerical indices to typical
 * bracketed notation
 * 
 * @param {string} path a path whose bracketed array indices are typically
 * eschewed for dots. Such as `array.3`. 
 * @return A `array.3` string would become `array[3]`
 */
export const expand = path => path.replace(/\.(\d+)/g, '[$1]')

/**
 * Does some expansion from bracketed numerical indices to a compressed
 * dot separated notation.
 * 
 * @param {string} path a path whose bracketed array indices are typically
 * eschewed for dots. Such as `array[3]`. 
 * @return A `array[3]` string would become `array.3`
 */
export const compress = path => path.replace(/\[(\d+)\]/g, '.$1')

/**
 * A class that provides deep getter/setter access to any real object
 * that it is used upon. A need arose for programmatic access to objects
 * repeatedly without having to test into each property access. A way 
 * that could be easily reused.  
 */
export class ObjectPath {
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
  constructor(pathToProp, object) {    
    this.path = pathToProp

    if (object) {
      this.constructor.bind(this, object)
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
  get(object) {
    if (!this.path) {
      return object
    }

    return getVal(this.path, object)
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
  set(object, newValue, ...args) {
    let value = functionOrValue(newValue, ...args)

    if (!this.path) {
      object = value 
      return object 
    }

    try {
      return eval(`(object.${expand(this.path)} = value)`)    
    }
    catch (error) {
      return Object.assign(Object(ObjectPath.INVALID_PROPERTY), { error })
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
  subtract(object, by, ...args) {
    let amount = functionOrValue(by, ...args); 
    let current = (ProtoProp(this, 'get').bind(this, object))();

    (ProtoProp(this, 'set').bind(this, object))(current - amount)

    return this.get(object)
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
  add(object, by, ...args) {
    let amount = functionOrValue(by, ...args);
    let current = (ProtoProp(this, 'get').bind(this, object))();

    (ProtoProp(this, 'set').bind(this, object))(current + amount)

    return this.get(object)
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
  multiply(object, by, ...args) {
    let amount = functionOrValue(by, ...args);
    let current = (ProtoProp(this, 'get').bind(this, object))();

    (ProtoProp(this, 'set').bind(this, object))(current * amount)

    return this.get(object)
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
  divide(object, by, ...args) {
    let amount = functionOrValue(by, ...args); 
    let current = (ProtoProp(this, 'get').bind(this, object))();

    (ProtoProp(this, 'set').bind(this, object))(current / amount)

    return this.get(object)
  }

  /**
   * Binds a new instance of ObjectPath to the supplied `object` so that they 
   * are not required as first parameters to `get`, `set`
   * 
   * @param {Object} object 
   */
  on(object) {
    let path = new ObjectPath(
      this.path, 
      object
    )

    return ObjectPath.bind(path, object)
  }  

  /**
   * A `Symbol` that allows type discerning calls using variants of
   * `Object.prototype.toString.call` or `apply`
   * 
   * @return {string} a value matching the name of the class
   */
  get [Symbol.toStringTag]() { return this.constructor.name }

  /**
   * 
   * @param {ObjectPath} instance an instance of ObjectPath
   * @param {Object} object the object to bind the ObjectPath to
   */
  static bind(instance, object) {
    instance.set = instance.set.bind(instance, object)
    instance.get = instance.get.bind(instance, object)
    instance.add = instance.add.bind(instance, object)
    instance.subtract = instance.subtract.bind(instance, object)
    instance.multiply = instance.multiply.bind(instance, object)
    instance.divide = instance.divide.bind(instance, object)
    instance.object = object 

    return instance
  }

  static get INVALID_PROPERTY() { 
    return Symbol.for(`[${this.name}]: Path appears invalid`)
  }

  /** 
   * A `string` that represents the path used to access the value
   * this ObjectPath instance works with
   */
  path: string
}

export default ObjectPath