# Vite Plugin PurgeCSS

A Vite plugin that integrates the [`@fullhuman/postcss-purgecss`][1] package to remove unused CSS during the build process. This plugin helps optimize the size of your CSS files and improve loading times for your Vite applications.

## Install

To use this plugin, you need to have Vite installed in your project. If you haven't set up a Vite project yet, you can do so by following the [Vite documentation][2].

Once you have Vite in your project, you can install the Vite Plugin PurgeCSS using your preferred package manager:

```bash
# With npm
npm i -D vite-plugin-purge

# With yarn
yarn add vite-plugin-purge --dev
```

## Usage

To use the Vite Plugin PurgeCSS in your Vite project, you need to add it to the `plugins` array in your Vite configuration file (`vite.config.js`).

```javascript
// vite.config.js
import pluginPurgeCSS from 'vite-plugin-purge'

export default {
  plugins: [
    pluginPurgeCSS({
      content: ['**/*.html', '**/*.js']
    })
  ]
}
```

## Configuration

The `pluginPurgeCSS` function accepts an options object to configure the behavior of PurgeCSS during the build process. The options are the same as those defined in [`@fullhuman/postcss-purgecss`][1]. For a full list of available options, please refer to the [PurgeCSS documentation][3].

Here's an example of how to use the `safelist` option to prevent certain classes from being purged:

```javascript
// vite.config.js
import pluginPurgeCSS from 'vite-plugin-purge'

export default {
  plugins: [
    pluginPurgeCSS({
      content: ['**/*.html', '**/*.js'],
      safelist: ['bg-red-500', 'text-blue-600']
    })
  ]
}
```

## Additional Notes

- The Vite Plugin PurgeCSS is applied only during the `build` process.
- The plugin is enforced to run after other PostCSS plugins (`enforce: 'post'`) to ensure proper CSS optimization.

## Credits

This plugin is built upon the excellent work of [`@fullhuman/postcss-purgecss`][1], which is the core library responsible for the CSS purging process. Special thanks to the contributors of both `vite-plugin-purge` and [`@fullhuman/postcss-purgecss`][1].

## License

![GitHub](https://img.shields.io/github/license/bent10/vite-plugins)

A project by [Stilearning](https://stilearning.com) &copy; 2022-2023.

[1]: https://github.com/FullHuman/purgecss
[2]: https://vitejs.dev/guide
[3]: https://www.purgecss.com/configuration
