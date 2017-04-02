const assert = require('assert')
const code = require('./code')

module.exports = class Builder {
  constructor () {
    // Entire code that the build will generate
    this.code = ''

    // Retain how depp block level the builder currently in
    this.blockDepth = 0
  }

  get indent () {
    return this.blockDepth * 2
  }

  enterBlock (start, end, fn) {
    this.code += '\n' + code(start, this.indent)
    this.blockDepth += 1

    fn()

    this.blockDepth -= 1
    this.code += '\n' + code(end, this.indent)
  }

  addLine (text) {
    this.code += '\n' + code(text, this.indent)
  }

  generate () {
    assert(
      this.blockDepth === 0,
      `Builder still does not leave from ${this.blockDepth} block(s) yet`
    )

    // Remove heading line break
    return this.code.slice(1)
  }
}
