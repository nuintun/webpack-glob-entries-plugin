/**
 * @module test
 * @license MIT
 * @author nuintun
 * @version 2018/05/06
 */
'use strict';

const WatchableGlobEntries = require('../index');

const watcher = new WatchableGlobEntries('node_modules/**/*.js');

watcher
  .entries()()
  .then(entries => console.log(entries));
