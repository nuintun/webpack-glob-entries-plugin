const path = require('path');
const WatchableGlobEntries = require('./index');

console.log(WatchableGlobEntries.entries('node_modules/**/*.js', null)());
