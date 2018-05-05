/**
 * @module index
 * @license MIT
 * @author nuintun
 * @description Provides a way to glob for entry files in Webpack watch and non-watch modes.
 * @see https://github.com/Milanzor/webpack-watched-glob-entries-plugin
 */

const path = require('path');
const glob = require('glob');
const globParent = require('glob-parent');

/**
 * @function unixify
 * @description Convert path separators to posix/unix-style forward slashes.
 * @param {string} path
 * @returns {string}
 */
function unixify(path) {
  return path.replace(/\\/g, '/');
}

/**
 * @function getFiles
 * @description Create webpack file entry object
 * @param {string} pattern
 * @param {string} parent
 * @param {Object} options
 * @returns {Promise}
 */
function getFiles(pattern, parent, options) {
  const resolveEntryName = options.resolveEntryName;

  return new Promise((resolve, reject) => {
    glob(pattern, options.glob, (error, files) => {
      if (error) return reject(error);

      const entries = files.reduce((entries, file) => {
        let entryName;

        // Resolve entry name
        if (resolveEntryName) {
          const name = resolveEntryName(parent, file);

          if (!name || typeof name !== 'string') {
            throw new TypeError('The options.resolveEntryName must be return a non empty string');
          }

          entryName = unixify(name);
        } else {
          const extname = path.extname(file);
          const extnameLength = extname.length;

          entryName = path.relative(parent, file);

          if (extnameLength) {
            entryName = entryName.slice(0, -extnameLength);
          }

          entryName = unixify(entryName);
        }

        // Add the entry to the entries
        entries[entryName] = path.resolve(file);

        return entries;
      }, {});

      resolve(entries);
    });
  });
}

/**
 * @class WatchableGlobEntries
 */
class WatchableGlobEntries {
  /**
   * @constructor
   * @param {string|string[]} globs
   * @param {Object} options
   */
  constructor(globs, options) {
    // Check if globs are provided properly
    if (typeof globs !== 'string' && !Array.isArray(globs)) {
      throw new TypeError('The param globs must be a string or an array of strings');
    }

    // Make entries an array
    if (!Array.isArray(globs)) {
      globs = [globs];
    }

    options = Object.assign({}, options);

    if (typeof options.resolveEntryName !== 'function') {
      delete options.resolveEntryName;
    }

    this.globs = globs;
    this.options = options;
    this.directories = new Set();
  }

  /**
   * @method entries
   * @returns {Function}
   */
  entries() {
    const globs = this.globs;
    const options = this.options;
    const directories = this.directories;

    return () => {
      const entries = globs.reduce((entries, glob) => {
        const parent = path.resolve(globParent(glob));

        // Dont add if its already in the directories
        if (!directories.has(parent)) {
          directories.add(parent);
        }

        entries.push(getFiles(glob, parent, options));

        return entries;
      }, []);

      return Promise.all(entries).then(entries =>
        entries.reduce((entries, entry) => Object.assign(entries, entry), {})
      );
    };
  }

  /**
   * @method apply
   * @description Install Plugin
   * @param {Object} compiler
   */
  apply(compiler) {
    // Binding context
    const afterCompile = this.afterCompile.bind(this);

    // Support Webpack >= 4
    if (compiler.hooks) {
      compiler.hooks.afterCompile.tapAsync(this.constructor.name, afterCompile);
    } else {
      // Support Webpack < 4
      compiler.plugin('after-compile', afterCompile);
    }
  }

  /**
   * @method afterCompile
   * @description After compiling, give webpack the globbed files
   * @param {Object} compilation
   * @param {Function} next
   */
  afterCompile(compilation, next) {
    const directories = this.directories;

    if (directories.size) {
      const contextDependencies = compilation.contextDependencies;

      if (Array.isArray(contextDependencies)) {
        // Support Webpack < 4
        compilation.contextDependencies = contextDependencies.concat(Array.from(directories));
      } else {
        // Support Webpack >= 4
        for (const directory of directories) {
          contextDependencies.add(directory);
        }
      }

      directories.clear();
    }

    next();
  }
}

// Exports
module.exports = WatchableGlobEntries;
