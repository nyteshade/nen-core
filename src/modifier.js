// @flow

import { functionOrValue } from './fnOrVal'
import { ObjectPath } from './object-path'
import { createEnum } from './enumeration'
import { Matcher } from './matcher'

import type { Pattern } from './matcher'

export const Operation = createEnum(
  ['REPLACEMENT', 'Replace the value rather than modify'], 
  ['ADDITION', 'Add the value of the modifier to the target'], 
  ['MULTIPLICATION', 'Multiply the value of the modifier to the target']
)

export class Modifier {
  constructor(
    desc: string,
    amount: number | Function,
    matcher: ?Pattern,
    objectPath: ?string,
    operation = Operation.ADDITION
  ) {
    if (arguments.length === 1 && arguments[0] instanceof Object) {
      Object.assign(this, arguments[0])

      if (!this.operation) {
        this.operation = Operation.ADDITION
      }
    }
    else {
      this.desc = desc
      this.amount = amount
      this.matcher = matcher
      this.objectPath = objectPath
      this.operation = operation      
    }
  }

  applyTo(object: Object) {
    switch (this.operation) {
      case Operation.REPLACEMENT:
        if (this.matcher) {
          new Matcher(this.matcher).entriesOf(object).forEach(obj => {
            if (this.objectPath) {
              new ObjectPath(this.objectPath, obj[1]).set(this.amount)
            }
            else {
              obj = this.amount 
            }
          })
        }

        break;
      default:
      case Operation.ADDITION:
        if (this.matcher) {
          new Matcher(this.matcher).entriesOf(object).forEach(obj => {
            if (this.objectPath) {
              new ObjectPath(this.objectPath, obj[1]).add(this.amount)
            }
            else {
              obj += this.amount 
            }
          })
        }

        break;
      case Operation.MULTIPLICATION:
        if (this.matcher) {
          new Matcher(this.matcher).entriesOf(object).forEach(obj => {
            if (this.objectPath) {
              new ObjectPath(this.objectPath, obj[1]).multiply(this.amount)
            }
            else {
              obj *= this.amount 
            }
          })
        }

        break;
    }
  }
}

export default Modifier