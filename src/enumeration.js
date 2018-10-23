/**
 * Creates an array with several notable properties. Given several strings,
 * the array will be indexed by both name and number. Some of the notable
 * properties added to the resulting array are as follows:
 * 
 * Functions:
 * ```
 *   data() - supplied with the index or string, any associated data objects
 *            will be returned. 'data()' will only exist if there is no
 *            such key. A synonym key __data__ will also be set.
 *   desc() - supplied with the index or string, either a reflecting string
 *            key or supplied detailed description will be returned. `desc()`
 *            will only exist if there is no such key. A synonym key __desc__
 *            will also be set
 * ```
 * 
 * In addition, the resulting enumeration object also has its 
 * `Symbol.iterator` overloaded to return an array for each entry where the
 * first item of the array is the key, the second the description and the 
 * final the data object. An empty object will always be present and even
 * if a custom description is not provided, the string key will be used as
 * such; this approach ensures values for each item.
 * 
 * @param  {Array<mixed>} elements each element, assumed to be a String
 * denoting the named key for the enumeration entry. If the supplied value
 * is an array, the first will be the string key and the second will be 
 * the data to be stored for such key. A numeric representation will be
 * applied for each key
 * @return {Array<mixed>} an object with both named and numeric keys that
 * help define some constants for use within your application. Data can 
 * additionally be stored on the "enum" using Symbols for keys. The named
 * keys as parameters to `Symbol.for` will be used to store any supplied data
 */
export function createMutableEnum(...elements) 
{
  let obj = []

  for (let element of elements) {
    let elem = element
    let data = {}
    let desc = element
    let array = Array.from(element)

    // If the element is an array, fetch the important bits in the 
    // specified order. 0. Name of constant 1. Description 2. Data
    if (typeof element !== 'string' && Array.isArray(array)) {
      elem = array[0]
      desc = array[1] || desc 
      data = array[2] || data
    }

    // Make a doubly linked enum. So if you provide a enum value of
    // ITEM then ITEM would equal 0 and element 0 would be 'ITEM'
    obj[obj[elem] = obj.length] = elem 

    // Use symbols to store superfluous information such as description
    obj[Symbol.for(`Description:${elem}`)] = desc

    // Use another symbol if a value for data is supplied
    if (data !== null)
    {
      obj[Symbol.for(elem)] = data 
    }
  }

  /**
   * A helper function to store a given value to more than one key if that
   * key does not already exist. This serves primariy 
   * 
   * @param {Object} obj an object on which to store the keys and value
   * @param {Array<String>} keys if the object does not have the key, store
   * the supplied value
   * @param {mixed} val the value to store
   */
  function setOn(obj, keys, val)
  {
    for (let key of keys) 
    {
      if (!obj.hasOwnProperty(key)) 
      {
        obj[key] = val 
      }
    }
  }

  /* In the case that there is an enum 'desc', '__desc__' is also defined */
  setOn(obj, ['desc', '__desc__'], function describe(keyOrVal)
  {
    let string = Symbol.for(`Description:${keyOrVal}`)
    let number = Symbol.for(`Description:${this[keyOrVal]}`)

    return this[string] || this[number]
  })

  /* In the case that there is an enum 'data', '__data__' is also defined */
  setOn(obj, ['data', '__data__'], function getData(keyOrVal) 
  {
    let string = Symbol.for(keyOrVal)
    let number = Symbol.for(this[keyOrVal])

    return this[string] || this[number]
  })

  /* In the case that there is an enum 'entry', '__entry__' is also defined */
  setOn(obj, ['entry', '__entry__'], function getEntry(keyOrVal)
  {
    let prop = Number(keyOrVal) == keyOrVal ? this[keyOrVal] : keyOrVal
    let desc = this.__desc__(keyOrVal)
    let data = this.__data__(keyOrVal)
    
    return [ prop, desc, data ]
  })

  /* 
  A custom iterator is defined that returns an array of all values for each
  entry in the enumeration. This allows an alternate way to easily get to the
  data for each entry as well. 
  */
  obj[Symbol.iterator] = function *() 
  {
    for (let i = 0; i < this.length; i++) 
    {
      let key = this[i]

      yield [
        key, 
        this[Symbol.for(`Description:${key}`)], 
        this[Symbol.for(key)]
      ]
    }
  }

  obj[Symbol.toStringTag] = "Enum"

  // Return the generated enum
  return obj
}

/**
 * The default approach that is exported from this module takes the results 
 * of `createMutableEnum()` and passes it through a call to `Object.freeze()` 
 * before handing it back. It is otherwise identical to the mutable form of
 * its function.
 * 
 * @param  {Array<mixed>} elements each element, assumed to be a String
 * denoting the named key for the enumeration entry. If the supplied value
 * is an array, the first will be the string key and the second will be 
 * the data to be stored for such key. A numeric representation will be
 * applied for each key
 * @return {Array<mixed>} an object with both named and numeric keys that
 * help define some constants for use within your application. Data can 
 * additionally be stored on the "enum" using Symbols for keys. The named
 * keys as parameters to `Symbol.for` will be used to store any supplied data 
 */
export function createEnum(...elements)
{
  return Object.freeze(createMutableEnum(...elements))
}

export default createEnum