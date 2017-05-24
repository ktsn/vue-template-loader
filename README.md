# vue-template-loader

Vue.js 2.0 template loader for webpack

This loader pre-compiles a html template into a render function using the [vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler). Each html file is transformed into a function that takes a vue component options object and injects a render function.

In most cases, [vue-loader](https://github.com/vuejs/vue-loader) is recommended over this loader.

## Features

- Transforms a html template into a render function
- Supports scoped css and css modules (similar to vue-loader)
- HMR support for templates
- Decorator syntax support (can be used with [vue-class-component](https://github.com/vuejs/vue-class-component) or other class style components)

## Webpack Configuration

### Loading a Html Template

Add vue-template-loader as a loader to your webpack configuration.

```js
module.exports = {
  module: {
    rules: [
      { test: /\.html$/, use: 'vue-template-loader' }
    ]
  }
}
```

### Asset Transforms

To transform asset paths in your templates to `require` expressions that webpack can handle, configure the `transformToRequire` option. For example, if you would like webpack to process the image files in the `src` attribute of `<img>` elements:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'vue-template-loader',
        options: {
          transformToRequire: {
            // The key should be an element name,
            // the value should be an attribute name or an array of attribute names
            img: 'src'
          }
        }
      },

      // Make sure to add a loader that can process the asset files
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

For an explanation of scoped styles, see the [vue-loader docs](https://vue-loader.vuejs.org/en/features/scoped-css.html). 

Html and style files need to be imported using the loader syntax: `require("./file.html?style=./file.css")`. You also need modify your webpack config as follows:
- Set `scoped: true` in the vue-template-loader options 
- Mark some of your style loaders (usually `style-loader` and `css-loader`) as post-loaders (by setting `enforce: 'post'`). 

**Logic for what to mark as a post-loader:** When you import a template and styles using the syntax `require("./file.html?style=./file.css")`, `vue-template-loader` injects an `inline` webpack loader that modifies the style file to include [scope-id] selectors. Webpack loaders run in the order `normal-loaders` -> `inline-loaders` -> `post-loaders`, so any loaders you want to run before the inline loader should be `normal-loaders`, and anything you want to run after the inline loader should be `post-loaders` (i.e. marked with `enforce: 'post'`).

Typically you will want to leave loaders that compile to css (like less, sass and postcss transpilers) as normal loaders, so they run before the [scope-id] injection, and mark loaders that transform css into a format for webpack consumption (like `style-loader` and `css-loader`) with `enforce: 'post'`.

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
        // Loaders that compile css (like postcss, less or sass) should be left as normal loaders
        test: /\.css$/,
        use: [ 'e.g. postcss-loader/less-loader/sass-loader' ]
      }
      {
        // Loaders that transform css into a format for webpack consumption should be post loaders (enforce: 'post')
        enforce: 'post',
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

#### `>>>` combinator

There are cases where you may want to style children components e.g. using a third party component. In such cases, you can use the `>>>` (/deep/) combinator to apply styles to any descendant elements of a scoped styled element.

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

If you are using less, note that it does not yet support the `>>>` operator, but you can use:
```less
@deep: ~">>>";

.foo @{deep} .bar {
  color: red;
}
```

### Loading CSS Modules

For an explanation of CSS modules, see the [vue-loader docs](https://vue-loader.vuejs.org/en/features/css-modules.html). 

Html and style files need to be imported using the loader syntax: `require("./file.html?style=./file.css")`. You also need to enable the `modules` flag of `css-loader`. 

vue-template-loader will add the `$style` property to your view model and you can use hashed classes through it.

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

By default Hot Module Replacement is disabled in the following situations:

 * Webpack `target` is `node`
 * Webpack minifies the code
 * `process.env.NODE_ENV === 'production'`

You may use the `hmr: false` option to disable HMR explicitly for any other situation.

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

Write a template for a Vue component using html.

```html
<!-- app.html -->
<div class="app">
  <p>{{ text }}</p>
  <button type="button" @click="log">Log</button>
</div>
```

Import it as a function and pass a component option to the function. If you would like to load a style file, add the `style` query and specify the style file path.

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

If you use this loader with TypeScript, make sure to add a declaration file for html files into your project.

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
