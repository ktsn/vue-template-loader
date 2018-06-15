const requireFromString = require('require-from-string')
const SourceMapConsumer = require('source-map').SourceMapConsumer
const loader = require('../lib/template-loader')
const Vue = require('vue')
const Component = require('vue-class-component').default

const styleLoaderPath = require.resolve('../lib/scoped-style-loader.js')

function mockRender (options, data = {}) {
  const mock = {
    _c (tag, data, children) {
      if (Array.isArray(data)) {
        children = data
        data = null
      }
      return {
        tag,
        data,
        children
      }
    },
    _m (index) {
      return options.staticRenderFns[index].call(this)
    },
    _v (str) {
      return String(str)
    },
    _s (str) {
      return String(str)
    }
  }

  Object.defineProperty(mock, '_self', {
    get () {
      return this
    }
  })

  return options.render.call(Object.assign(mock, data))
}

function loadCode(data, { sourceMap, style, query = {}} = {}) {
  const result = { code: null, map: null }

  loader.call({
    resourcePath: '/path/to/test.html',
    cacheable: () => {},
    options: {},
    query,
    sourceMap,
    request: 'foo.html' + (style ? `?style=${style}` : ''),
    callback (err, code, map) {
      result.code = code
      result.map = map
    }
  }, data)

  return result
}

function load (data, options) {
  return requireFromString(loadCode(data, options).code)
}

describe('vue-template-loader', () => {
  it('renders static element', () => {
    const withRender = load('<div><p>hi</p></div>')
    const options = withRender({})
    const vnode = mockRender(options)
    expect(vnode.tag).toBe('div')
    expect(vnode.children[0].children[0]).toBe('hi')
  })

  it('renders data bound element', () => {
    const withRender = load('<div><p>{{ value }}</p></div>')
    const options = withRender({})
    const vnode = mockRender(options, { value: 'hello' })
    expect(vnode.children[0].children[0]).toBe('hello')
  })

  it('is used as decorator', () => {
    const WithRender = load('<div><p>hi</p></div>')

    @WithRender
    @Component
    class Comp extends Vue {
      value = 123
    }

    const c = new Comp()
    expect(c.value).toBe(123)

    const vnode = mockRender(Comp.options)
    expect(vnode.children[0].children[0]).toBe('hi')
  })

  it('does not inject style related code if it is not specified', () => {
    const { code } = loadCode('<div>hi</div>')
    expect(code).toMatchSnapshot()
  })

  it('inject normal styles', () => {
    const { code } = loadCode('<div>hi</div>', { style: './style.css' })
    expect(code).toMatchSnapshot()
  })

  it('inject scoped id and scoped css', () => {
    const { code } = loadCode('<div>hi</div>', { style: './style.css', query: { scoped: true }})
    expect(code.replace(styleLoaderPath, '{{scoped-style-loader}}')).toMatchSnapshot()
  })

  it('disable HMR by option', () => {
    const { code } = loadCode('<div>hi</div>', { query: { hmr: false }})
    expect(code).toMatchSnapshot()
  })

  it('generates source map', () => {
    const { code, map } = loadCode('<div>hi</div>', { sourceMap: true })
    const generatedPos = { line: null, column: null }

    code.split('\n').forEach((line, i) => {
      const pos = line.indexOf('var render =')
      if (pos >= 0) {
        generatedPos.line = i + 1
        generatedPos.column = pos
      }
    })

    const smc = new SourceMapConsumer(map)
    const originalPos = smc.originalPositionFor(generatedPos)
    expect(originalPos.line).toBe(1)
    expect(originalPos.column).toBe(0)
  })

  it('sets functional', () => {
    const { code } = loadCode('<div>{{ props.data }}</div>', { query: { functional: true }})
    expect(code).toMatchSnapshot()
  })
})
