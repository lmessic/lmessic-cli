const program = require('commander');
const createProjectActions = require('./actions');

const createCommands = () => {
  program
    .command('create <project> [others...]')
    .description('clone a repo into a folder')
    .action(createProjectActions)
}

module.exports = createCommands;
