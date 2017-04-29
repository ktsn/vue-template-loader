const assert = require('assert')
const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')

function isGlobalNode (node) {
  return node.type === 'pseudo' && node.toString() === ':global'
}

function isGlobalSelector (selector) {
  let isGlobal = false
  selector.each(n => {
    if (isGlobalNode(n)) isGlobal = true
  })
  return isGlobal
}

function removeGlobalSelector (selector) {
  selector.each(n => {
    if (isGlobalNode(n)) n.remove()
  })
}

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
      // Skip if there is a :global pseudo class in the selector
      if (isGlobalSelector(selector)) {
        removeGlobalSelector(selector)
        return
      }

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

module.exports = function addScopedId (id, css, options = {}) {
  const postCssOptions = {}

  if (options.sourceMap) {
    assert(options.fileName, 'fileName is required if sourceMap === true')

    postCssOptions.from = postCssOptions.to = options.fileName
    postCssOptions.map = {
      inline: false,
      annotation: false,
      prev: options.prevMap
    }
  }

  const plugins = [addScopedIdPlugin({ id })]
  return postcss(plugins)
    .process(css, postCssOptions)
    .then(result => {
      if (result.map) {
        result.map = result.map.toJSON()
      }
      return result
    })
}
