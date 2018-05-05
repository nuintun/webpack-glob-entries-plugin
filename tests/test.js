const WatchableGlobEntries = require('../index');

const globEntries = new WatchableGlobEntries('node_modules/**/*.js');

globEntries
  .entries()()
  .then(entries => console.log(entries));
