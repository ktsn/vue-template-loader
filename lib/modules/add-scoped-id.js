const assert = require('assert')
const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')

function isDeepCombinator (node) {
  if (node.type === 'combinator' && node.toString().trim() === '>>>') {
    return true
  }
  if (node.type === 'tag' && node.toString().trim() === '/deep/') {
    return true
  }
}

function isSassDeepCombinator (node) {
  return node.type === 'tag' && node.toString().trim() === '/deep/'
}

function replaceDeepCombinator (selector) {
  selector.each(n => {
    if (isSassDeepCombinator(n)) {
      const next = n.next()
      if (next.type === 'combinator' && next.value === ' ') {
        console.log('removed next')
        next.remove()
      }
      n.remove()
    } else if (isDeepCombinator(n)) {
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
      console.log(selector)
      const target = getTargetNode(selector)
      replaceDeepCombinator(selector)
      if (target) {
        console.log(selector)
        selector.insertAfter(target, selectorParser.attribute({
          attribute: options.id
        }))
      }

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
