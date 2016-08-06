# vue-template-loader

Vue.js 2.0 template loader for webpack

This loader is just pre-compile a template by using [vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler) and provide a function that can inject render function to a component options object.  

Usually, you had better to use [vue-loader](https://github.com/vuejs/vue-loader).

## Configuration for webpack

Just add loader option for vue-template-loader to your webpack configuration.

```js
module.exports = {
  module: {
    loaders: [
      { test: /\.html$/, loader: 'vue-template' }
    ]
  }
}
```

## Example code

Write a template of Vue component as html.

```html
<!-- app.html -->
<div class="app">
  <p>{{ text }}</p>
  <button type="button" @click="log">Log</button>
</div>
```

Import it as a function and pass a component option to the function.

```js
// app.js
import withRender from './app.html'

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

## License

MIT
