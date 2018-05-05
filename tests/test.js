const WatchableGlobEntries = require('../index');

const globEntries = new WatchableGlobEntries('node_modules/**/*.js');

console.log(globEntries.entries()());
