# vite-plugins

Vite plugins workspace.

## Install

Follows the steps below to get up and running:

```bash
# clone this repo
> git clone https://github.com/bent10/vite-plugins.git

# go to the project directory and install dependencies
> cd vite-plugins && npm i
```

## Packages

| Package                                    | Version (click for changelog)                                                                |
| :----------------------------------------- | :------------------------------------------------------------------------------------------- |
| [vite-plugin-purge](packages/plugin-purge) | [![npm](https://img.shields.io/npm/v/vite-plugin-purge)](packages/plugin-purge/changelog.md) |

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
