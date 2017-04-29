const assert = require('assert')
const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')

function isDeepCombinator (node) {
  return node.type === 'combinator' && node.toString().trim() === '>>>'
}

function replaceDeepCombinator (selector) {
  selector.each(n => {
    if (isDeepCombinator(n)) {
      // Use descendant combinator instead of deep combinator
      n.replaceWith(selectorParser.combinator({
        value: ' '
      }))
    }
  })
}

/**
 * Get the target node for adding the scoped attribute.
 * If there is >>> combinator, the target is a selector before it.
 * Otherwise it is the last selector.
 */
function getTargetNode (selector) {
  let node = null
  selector.each(n => {
    if (n.type !== 'pseudo' && n.type !== 'combinator') {
      node = n
    }

    if (isDeepCombinator(n)) {
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

      replaceDeepCombinator(selector)
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
