# Vite Plugin DOM

Vite Plugin DOM is a ViteJS plugin that enables DOM manipulation and comment injection during the build process. This plugin allows you to modify the parsed HTML and inject comments into specific DOM elements based on provided selectors. You can control the application of this plugin based on the Vite build modes and specify custom handling functions.

## Install

To use Vite Plugin DOM, first, make sure you have Vite installed in your project. Then, install the plugin using npm or yarn:

```bash
# With npm
npm i -D vite-plugin-dom

# With yarn
yarn add vite-plugin-dom --dev
```

## Usage

To use the plugin, simply import it and add it to the `plugins` array in your Vite config file:

```javascript
// vite.config.js
import pluginDom from 'vite-plugin-dom'

export default {
  plugins: [
    pluginDom({
      applyOnMode: true,
      comments: {
        tags: ['div', /$h[1-6]$/],
        classes: ['highlight'],
        ids: ['header']
      },
      handler: element => {
        // Modify the element here
      },
      onComplete: (dom, error) => {
        if (error) {
          console.error('DOM parsing error:', error)
        } else {
          console.log('DOM parsing complete:', dom)
        }
      }
    })
  ]
}
```

In the code above, the plugin will be applied to all modes, and it will add comments to `div` and `h1` elements, elements with the class `highlight`, and the element with the ID `header`. The `handler` function will also be called for each element, allowing you to perform custom modifications. The `onComplete` function will log the parsed DOM or any parsing errors.

## Options

The plugin accepts the following options:

### `applyOnMode` (default: ['static'])

Specifies the modes on which the plugin should be applied. When set to `true`, the plugin will be applied on all modes. When set to an array of strings, the plugin will be applied only on the specified modes.

```javascript
pluginDom({
  applyOnMode: ['development', 'production']
})
```

### `comments`

Selectors to match comments. The plugin will add comments to elements that match these selectors.

```javascript
pluginDom({
  comments: {
    tags: ['div', 'p'], // Array of tag names to match for adding comments.
    classes: ['highlight', /theme-.*/], // Array of class names or regular expressions to match for adding comments.
    ids: ['section1', /^chapter.*/] // Array of element IDs or regular expressions to match for adding comments.
  }
})
```

### `handler`

A callback function to handle elements in the DOM. This function will be called for each element in the DOM tree.

```javascript
pluginDom({
  handler: element => {
    // add `[data-toggle="dropdown"]` to the dropdown toggler
    if (domHas(elem, 'class', ['dropdown', 'dropup'])) {
      // find toggler element
      const toggler = this.findOne(
        node => !!node.attribs['aria-expanded'],
        elem.childNodes,
        false
      )

      if (toggler) {
        toggler.attribs['data-toggle'] = 'dropdown'
      }
    }
  }
})
```

### `onComplete`

A callback function to handle the complete DOM after parsing. This function will be called once the DOM parsing is complete.

```javascript
pluginDom({
  onComplete: (dom, error) => {
    // Handle the complete DOM here
  }
})
```

## API

The plugin exports the following utility functions for additional DOM manipulation:

### `domHas(elem: Element, attrName: string, pattern: string | RegExp | Array<string | RegExp>): boolean`

Checks if an element has a given attribute with the provided pattern.

```html
<div id="foo" class="bar">...</div>
```

Let's say the `elem` object is refer to the above markup:

```javascript
import { domHas } from 'vite-plugin-dom'

// test by id
const hasFoo = domHas(elem, 'id', 'foo') // true
const hasFoo = domHas(elem, 'id', 'qux') // false
// test by class
const hasBar = domHas(elem, 'class', ['qux', /bar/]) // true
```

## License

![GitHub](https://img.shields.io/github/license/bent10/vite-plugins)

A project by [Stilearning](https://stilearning.com) &copy; 2022-2023.
