const requireFromString = require('require-from-string')
const loader = require('../lib')
const Vue = require('vue')
const Component = require('vue-class-component').default

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

function loadCode(data, { style } = {}) {
  return loader.call({
    cacheable: () => {},
    options: {},
    request: 'foo.html' + (style ? `?style=${style}` : '')
  }, data)
}

function load (data, options) {
  return requireFromString(loadCode(data, options))
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
    const code = loadCode('<div>hi</div>')
    expect(code).not.toMatch('_scopeId')
    expect(code).not.toMatch('scoped-style-loader')
  })

  it('inject scoped id and scoped css', () => {
    const code = loadCode('<div>hi</div>', { style: './style.css' })
    expect(code).toMatch(/options\._scopeId = 'data-v-[^']+'/)
    expect(code).toMatch(
      /require\('[^!?]*scoped-style-loader\.js\?id=[^!]+!\.\/style\.css'\)/
    )
  })
})
