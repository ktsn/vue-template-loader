const assert = require('assert')
const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')

function getTargetNode (selector) {
  let node = null
  selector.each(n => {
    if (n.type !== 'pseudo') node = n
  })
  return node
}

const addScopedIdPlugin = postcss.plugin('add-scoped-id', options => {
  assert(options)
  assert(options.id)

  const selectorTransformer = selectorParser(selectors => {
    selectors.each(selector => {
      const target = getTargetNode(selector)
      selector.insertAfter(target, selectorParser.attribute({
        attribute: options.id
      }))
    })
  })

  return root => {
    root.walkRules(rule => {
      rule.selector = selectorTransformer.process(rule.selector).result
    })
  }
})

module.exports = function addScopedId (id, fileName, css, map) {
  const options = {
    from: fileName,
    to: fileName,
    map: {
      inline: false,
      annotation: false,
      prev: map
    }
  }

  const plugins = [addScopedIdPlugin({ id })]
  return postcss(plugins).process(css, options)
}
