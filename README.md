# vue-template-loader

Vue.js 2.0 template loader for webpack

This loader is just pre-compile a template by using [vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler) and provide a function that can inject render function to a component options object.  

In most cases, you should use [vue-loader](https://github.com/vuejs/vue-loader).

## Features

- Insert a render function to a component options object
- vue-loader like scoped css and css modules support
- HMR support for a template
- Decorator syntax support (can be used with [vue-class-component](https://github.com/vuejs/vue-class-component) or other class style components)

## Configuration for webpack

### Loading Template

Just add a loader option for vue-template-loader to your webpack configuration.

```js
module.exports = {
  module: {
    rules: [
      { test: /\.html$/, use: 'vue-template-loader' }
    ]
  }
}
```

### Loading Scoped Styles

You need to specify scoped flag and loaders for style files such as `style-loader` and `css-loader`. Note that they must be `enforce: post` to inject scope id into styles before they are processed by them.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'vue-template-loader?scoped' // add `scoped` flag
      },
      {
        enforce: 'post', // required
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

### Loading CSS Modules

All what you have to do is enable `modules` flag of `css-loader`. vue-template-loader will add `$style` property and you can use hashed classes through it.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'vue-template-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader?modules'] // Enable CSS Modules
      }
    ]
  }
}
```

## Example

Write a template of Vue component as html.

```html
<!-- app.html -->
<div class="app">
  <p>{{ text }}</p>
  <button type="button" @click="log">Log</button>
</div>
```

Import it as a function and pass a component option to the function. If you also would like to load a style file, add `style` query and specify the style file path.

```js
// app.js
import withRender from './app.html?style=./app.css'

export default withRender({
  data () {
    return {
      text: 'Example text'
    }
  },

  methods: {
    log () {
      console.log('output log')
    }
  }
})
```

You can use decorator syntax for any class style components.

```js
import Vue from 'vue'
import Component from 'vue-class-component'
import WithRender from './app.html'

@WithRender
@Component
export default class App extends Vue {
  text = 'Example text'

  log () {
    console.log('output log')
  }
}
```

If you use this loader with TypeScript, make sure to add a declaration file for html file into your project.

```ts
declare module '*.html' {
  import Vue = require('vue')
  interface WithRender {
    <V extends Vue>(options: Vue.ComponentOptions<V>): Vue.ComponentOptions<V>
    <V extends typeof Vue>(component: V): V
  }
  const withRender: WithRender
  export = withRender
}
```

## License

MIT
