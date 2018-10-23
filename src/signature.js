if (!Function.prototype.hasOwnProperty('signature')) {
  Object.defineProperty(
    Function.prototype,
    'signature',
    {
      get() {
        let source = this.toString()

        // For classes we need to extract the signature of the 
        // constructor function within; so use some regular 
        // expressions in order to make that happen
        if (source.startsWith('class')) {
          let parts = /constructor\((.*?)\)\s*\{/.exec(source)
          
          if (parts && parts[1]) {
            return `class ${this.name}(${parts[1]})`
          }
          else {
            return `class ${this.name}()`
          }
        }

        // Otherwise, grab everything up to the first opening 
        // curly bracket and call it a day.
        return source.slice(0, this.toString().indexOf('{')).trim()
      }
    }
  )
}

