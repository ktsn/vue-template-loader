# vue-template-loader

Vue.js 2.0 template loader for webpack

This loader pre-compiles a html template into a render function using the [vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler). Each html file is transformed into a function that takes a vue component options object and injects a render function, styles and HMR support.

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

To transform asset paths in your templates to `require` expressions that webpack can handle, configure the `transformAssetUrls` option. For example, if you would like webpack to process the image files in the `src` attribute of `<img>` elements:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'vue-template-loader',
        options: {
          transformAssetUrls: {
            // The key should be an element name
            // The value should be an attribute name or an array of attribute names
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

### Functional Component

If you want to use functional component template, you need to set `functional: true` option to loader options. You may want to use `oneOf` to handle both normal and functional template configs.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        oneOf: [
          // If the file name has `.functional` suffix, treat it as functional component template
          // You can change this rule whatever you want.
          {
            test: /\.functional\.html$/,
            loader: 'vue-template-loader',
            options: {
              functional: true
            }
          },

          // Normal component template
          {
            loader : 'vue-template-loader'
          }
        ]
      }
    ]
  }
}
```

### Loading Scoped Styles

For an explanation of scoped styles, see the [vue-loader docs](https://vue-loader.vuejs.org/en/features/scoped-css.html).

Html and style files need to be imported using `import withRender from './app.html?style=./app.css'`.

You also need modify your webpack config as follows:
- Set `scoped: true` in the vue-template-loader options
- Mark some of your style loaders (usually `style-loader` and `css-loader`) as post-loaders (by setting `enforce: 'post'`).

**Logic for what to mark as a post-loader:** vue-template-loader injects an _inline_ webpack loader into your loader pipeline to modify your style files to include [scope-id] selectors. Webpack loaders run in the order normal -> inline -> post, so any loaders you want to run before the inline loader should be normal loaders, and anything you want to run after the inline loader should be post loaders (i.e. marked with `enforce: 'post'`).

Typically you will want to leave loaders that compile to css (like less, sass and postcss transpilers) as normal loaders, so they run before the [scope-id] injection. Loaders that transform css into a format for webpack consumption (like `style-loader` and `css-loader`) should be post loaders (marked as `enforce: 'post'`).

```js
module.exports = {
  module: {
    rules: [
      {
        // Loaders that transform css into a format for webpack consumption should be post loaders (enforce: 'post')
        enforce: 'post',
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // We needed to split the rule for .scss files across two rules
      {
        // The loaders that compile to css (postcss and sass in this case) should be left as normal loaders
        test: /\.scss$/,
        use: ['postcss-loader', 'sass-loader']
      },
      {
        // The loaders that format css for webpack consumption should be post loaders
        enforce: 'post',
        test: /\.scss$/,
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

Html and style files need to be imported using the loader syntax: `import withRender from './app.html?style=./app.css'`. You also need to enable the `modules` flag of `css-loader`.

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

### Typescript

If you use this loader with TypeScript, make sure to add a declaration file for html files into your project. (If you want to load style files via query string, you need to replace `*.html` with `*.css`)

```ts
declare module '*.html' {
  import Vue, { ComponentOptions, FunctionalComponentOptions } from 'vue'
  interface WithRender {
    <V extends Vue, U extends ComponentOptions<V> | FunctionalComponentOptions>(options: U): U
    <V extends typeof Vue>(component: V): V
  }
  const withRender: WithRender
  export default withRender
}
```

## Option Reference

### transformAssetUrls

- type: `Object`
- default: `{}`

To specify which attribute of elements are processed with webpack. Keys are element names while the values are their attribute string or array of string.

### functional

- type: `Boolean`
- default: `false`

Process template as functional component template if it is `true`.

### scoped

- type: `Boolean`
- default: `false`

If `true`, styles will be scoped.

### hmr

- type: `Boolean`
- default: `true`

If `false`, disable hot module replacement.

### optimizeSSR

- type: `Boolean`
- default: `false`

You can enable SSR optimazation when specify this option `true`.

## Templates

There is vue-cli template using vue-template-loader (Thanks to @Toilal).

- [Toilal/vue-webpack-template](https://github.com/Toilal/vue-webpack-template)

## License

MIT
