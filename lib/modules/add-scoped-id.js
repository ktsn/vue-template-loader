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
          attribute: 'data-v-' + options.id
        }))
      }

      replaceDeepCombinator(selector)
    })
  })

  return root => {
    const keyframes = new Map()

    root.each(function transformNode (node) {
      if (node.type === 'atrule') {
        if (/-?keyframes$/.test(node.name)) {
          const before = node.params
          const after = node.params + '-' + options.id
          node.params = after
          keyframes.set(before, after)
        } else {
          node.each(transformNode)
        }
      } else {
        node.selector = selectorTransformer.processSync(node.selector)
      }
    })

    keyframes.forEach((after, before) => {
      root.walkDecls(decl => {
        if (/-?animation-name$/.test(decl.prop)) {
          decl.value = decl.value.split(',')
            .map(v => v.trim() === before ? after : v)
            .join(',')
        } else if (/-?animation$/.test(decl.prop)) {
          decl.value = decl.value.split(',')
            .map(v => {
              const [first, ...tail] = v.trim().split(/\s+/)
              return first === before
                ? [after, ...tail].join(' ')
                : v
            })
            .join(',')
        }
      })
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
