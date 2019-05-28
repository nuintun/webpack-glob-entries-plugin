/**
 * @module test
 * @license MIT
 * @author nuintun
 */
'use strict';

const WebpackGlobEntriesPlugin = require('../index');

const watcher = new WebpackGlobEntriesPlugin('node_modules/**/*.js');

watcher
  .entries()()
  .then(entries => console.log(entries));
