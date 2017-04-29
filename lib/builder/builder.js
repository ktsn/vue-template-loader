const assert = require('assert')
const { SourceNode, SourceMapConsumer } = require('source-map')
const code = require('./code')

module.exports = class Builder {
  constructor () {
    // Represents entire code and its source map
    this.root = new SourceNode(null, null, null, '')

    // Retain how deep block level the builder is currently in
    this.blockDepth = 0
  }

  get indent () {
    return this.blockDepth * 2
  }

  enterBlock (start, end, fn) {
    this.root.add(code(start, this.indent) + '\n')
    this.blockDepth += 1

    fn()

    this.blockDepth -= 1
    this.root.add(code(end, this.indent) + '\n')
  }

  addLine (text, map) {
    if (map) {
      const smc = new SourceMapConsumer(map)
      const node = SourceNode.fromStringWithSourceMap(text, smc)

      // We cannot indent the code with source map
      // since it makes the mapping inconsistent.
      this.root.add([node, '\n'])
    } else {
      this.root.add(code(text, this.indent) + '\n')
    }
  }

  generate () {
    assert(
      this.blockDepth === 0,
      `Builder still does not leave from ${this.blockDepth} block(s) yet`
    )

    const result = this.root.toStringWithSourceMap()
    return {
      code: result.code,
      map: JSON.parse(result.map.toString())
    }
  }
}
