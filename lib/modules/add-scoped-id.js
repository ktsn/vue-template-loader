const assert = require('assert')
const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')

function isGlobalNode (node) {
  return node.type === 'pseudo' && node.toString() === ':global'
}

function removeGlobalNode (selector) {
  selector.each(n => {
    if (isGlobalNode(n)) n.remove()
  })
}

/**
 * Get the target node for adding the scoped attribute.
 * If there is :global class, the target is a node before it.
 * Otherwise it is the end selector.
 */
function getTargetNode (selector) {
  let prev = null
  let node = null
  selector.each(n => {
    if (n.type !== 'pseudo' && n.type !== 'combinator') {
      node = n
    } else if (n.type === 'combinator') {
      prev = node
    } else if (isGlobalNode(n)) {
      node = prev
      return false
    }
  })
  return node
}

const addScopedIdPlugin = postcss.plugin('add-scoped-id', options => {
  assert(options)
  assert(options.id)

  const selectorTransformer = selectorParser(selectors => {
    selectors.each(selector => {
      const target = getTargetNode(selector)

      if (target) {
        selector.insertAfter(target, selectorParser.attribute({
          attribute: options.id
        }))
      }

      removeGlobalNode(selector)
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
