# vite-plugins

Vite plugins workspace.

## Packages

| Package                                              | Description                                                             | Version (click for changelog)                                                                          |
| :--------------------------------------------------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| [vite-plugin-cachedir](packages/plugin-cachedir)     | Resolves default cache directory in monorepo                            | [![npm](https://img.shields.io/npm/v/vite-plugin-cachedir)](packages/plugin-cachedir/changelog.md)     |
| [vite-plugin-dom](packages/plugin-dom)               | Enables DOM manipulation and comment injection during the build process | [![npm](https://img.shields.io/npm/v/vite-plugin-dom)](packages/plugin-dom/changelog.md)               |
| [vite-plugin-format](packages/plugin-format)         | Format code and assets using Prettier                                   | [![npm](https://img.shields.io/npm/v/vite-plugin-format)](packages/plugin-format/changelog.md)         |
| [vite-plugin-marked-mpa](packages/plugin-marked-mpa) | Rendering Markdown files to HTML for MPA                                | [![npm](https://img.shields.io/npm/v/vite-plugin-marked-mpa)](packages/plugin-marked-mpa/changelog.md) |
| [vite-plugin-purge](packages/plugin-purge)           | Enables PurgeCSS for the build                                          | [![npm](https://img.shields.io/npm/v/vite-plugin-purge)](packages/plugin-purge/changelog.md)           |
| [vite-plugin-vendor](packages/plugin-vendor)         | Generates vendor bundles based on the specified options                 | [![npm](https://img.shields.io/npm/v/vite-plugin-vendor)](packages/plugin-vendor/changelog.md)         |

## Contributing

We 💛&nbsp; issues.

When committing, please conform to [the semantic-release commit standards](https://www.conventionalcommits.org/). Please install `commitizen` and the adapter globally, if you have not already.

```bash
npm i -g commitizen cz-conventional-changelog
```

Now you can use `git cz` or just `cz` instead of `git commit` when committing. You can also use `git-cz`, which is an alias for `cz`.

```bash
git add . && git cz
```
