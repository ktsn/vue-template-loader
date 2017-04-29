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

### Asserts Handling

You can transform an asset path in template to `require` expression that the webpack can handle. For example, if you would like to process image file specified on `src` attributes of `<img>` element, you should set `transformToRequire` option.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'vue-template-loader',
        options: {
          transformToRequire: {
            // The key should be element name,
            // the value should be attribute name or its array
            img: 'src'
          }
        }
      },

      // Make sure to add the loader that can process the asset files
      {
        test: /\.(png|jpg)/,
        loader: 'file-loader',
        options: {
          // ...
        }
      }
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
        loader: 'vue-template-loader',
        options: {
          scoped: true // add `scoped` flag
        }
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

#### `>>>` combinator

There are cases you may want to style children components. e.g. using a third party component. In such cases, you can use `>>>` combinator to apply styles to any descendant elements of a scoped styled element.

Input:

```css
.foo >>> .bar {
  color: red;
}
```

Output:

```css
.foo[data-v-4fd8d954] .bar {
  color: red
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

### Disabling HMR

By default Hot Module Replacement is disabled in following situations:

 * Webpack `target` is `node`
 * Webpack minifies the code
 * `process.env.NODE_ENV === 'production'`

You may use `hmr: false` option to disable HMR explicitly for any other situation.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'vue-template-loader',
        options: {
          hmr: false // disables Hot Modules Replacement
        }
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

## Templates

There are vue-cli templates using vue-template-loader (Thanks to @Toilal).

- [Toilal/vue-ts-hmr-std-files](https://github.com/Toilal/vue-ts-hmr-std-files)
- [Toilal/vue-webpack-template](https://github.com/Toilal/vue-webpack-template)

## License

MIT
