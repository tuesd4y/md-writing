import minimist from 'minimist';
import { compile, watchMd } from './watch';
import * as d from 'debug';

const debug = d.debug('cli');

const log = console.log.bind(console);

export function cli(argsArray) {
  const args = minimist(argsArray.slice(2));
  log(args);

  let cmd = args._[0] || 'help';
  if (args.help || args.h) cmd = 'help';

  switch (cmd) {
    case 'help':
      console.log('not yet implemented!');
      break;
    case 'watch':
      watchMd(args);
      break;
    case 'create':
      // create template
      console.log('not yet implemented!');
      break;
    case 'compile':
      // compile all files given
      compile(args);
      break;
    default:
      console.error(`"${cmd}" is not a valid command!`);
      break;
  }
}
