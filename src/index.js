// @flow

require('./signature')

export { functionOrValue } from './fnOrVal'
export { createMutableEnum, createEnum } from './enumeration'
export { Matches, Matcher } from './matcher'
export { Operation, Modifier } from './modifier'
export { getVal, expand, compress, ObjectPath } from './object-path'

export type { Pattern } from './matcher'