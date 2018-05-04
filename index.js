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

const directories = new Set();

/**
 * @function getFiles
 * @description Create webpack file entry object
 * @param {string} pattern
 * @param {Object} options
 * @returns {Object}
 */
function getFiles(pattern, options) {
  const parent = globParent(pattern);
  const getEntryName = options.getEntryName;

  return glob.sync(pattern, options.glob).reduce((files, file) => {
    const extname = path.extname(file);
    const extnameLength = extname.length;

    // Format the entryName
    let entryName = path.relative(parent, file);

    if (extnameLength) {
      entryName = entryName.slice(0, -extnameLength);
    }

    entryName = entryName.replace(/\\/g, '/');

    if (getEntryName) {
      const name = getEntryName(entryName);

      if (typeof name !== 'string') {
        throw new TypeError('The options.getEntryName must be return a string');
      }

      entryName = name;
    }

    // Add the entry to the files obj
    files[entryName] = file;

    return files;
  }, {});
}

/**
 * @class WatchableGlobEntries
 */
class WatchableGlobEntries {
  /**
   *
   * @param globs
   * @param options
   * @returns {Function}
   */
  static entries(globs, options) {
    // Check if globs are provided properly
    if (typeof globs !== 'string' && !Array.isArray(globs)) {
      throw new TypeError('The param globs must be a string or an array of strings');
    }

    // Make entries an array
    if (!Array.isArray(globs)) {
      globs = [globs];
    }

    options = Object.assign({}, options);

    if (typeof options.getEntryName !== 'function') {
      delete options.getEntryName;
    }

    return function() {
      // Map through the globs
      return globs.reduce((files, glob) => {
        const parent = globParent(glob);

        // Dont add if its already in the directories
        if (!directories.has(parent)) {
          directories.add(parent);
        }

        // Set the globbed files
        return Object.assign(files, getFiles(glob, options));
      }, {});
    };
  }

  /**
   * @method apply
   * @description Install Plugin
   * @param {Object} compiler
   */
  apply(compiler) {
    if (compiler.hooks) {
      // Support Webpack >= 4
      compiler.hooks.afterCompile.tapAsync(this.constructor.name, this.afterCompile.bind(this));
    } else {
      // Support Webpack < 4
      compiler.plugin('after-compile', this.afterCompile);
    }
  }

  /**
   * @method afterCompile
   * @description After compiling, give webpack the globbed files
   * @param {Object} compilation
   * @param {Function} callback
   */
  afterCompile(compilation, next) {
    if (Array.isArray(compilation.contextDependencies)) {
      // Support Webpack < 4
      compilation.contextDependencies = compilation.contextDependencies.concat(directories);
    } else {
      // Support Webpack >= 4
      for (const directory of directories) {
        compilation.contextDependencies.add(directory);
      }
    }

    next();
  }
}

module.exports = WatchableGlobEntries;
