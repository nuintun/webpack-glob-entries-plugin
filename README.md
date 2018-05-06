# webpack-glob-entries-plugin

> Provides a way to glob for entry files in Webpack watch and non-watch modes.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> ![Node Version][node-image]
> [![Dependencies][david-image]][david-url]

### API

> new WebpackGlobEntriesPlugin(globs: string|string[], options?: { glob: Object, resolveEntryName: Function });
>
> * globs: The glob string or glob string array
> * options: The configure options
>   * options.glob: The [node-glob](https://github.com/isaacs/node-glob) configure options
>   * options.resolveEntryName: The entry name resolve function

### Usage

```js
const WatchableGlobEntries = require('webpack-glob-entries-plugin');

const globEntries = new WatchableGlobEntries('src/js/pages/**/*.js');

module.exports = {
  mode: 'development',
  entry: globEntries.entries(),
  output: {
    publicPath: '/dist/',
    path: path.resolve('dist'),
    filename: 'js/pages/[name].js',
    chunkFilename: 'js/chunks/[chunkhash].js'
  },
  plugins: [globEntries]
};
```

### Thanks

> [Milanzor/webpack-watched-glob-entries-plugin](https://github.com/Milanzor/webpack-watched-glob-entries-plugin)

[npm-image]: https://img.shields.io/npm/v/webpack-glob-entries-plugin.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/webpack-glob-entries-plugin
[download-image]: http://img.shields.io/npm/dm/webpack-glob-entries-plugin.svg?style=flat-square
[node-image]: https://img.shields.io/node/v/webpack-glob-entries-plugin.svg?style=flat-square
[david-image]: http://img.shields.io/david/nuintun/webpack-glob-entries-plugin.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/webpack-glob-entries-plugin
