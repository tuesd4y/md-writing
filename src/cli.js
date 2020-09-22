import minimist from 'minimist';
import { watchMd } from './watch';

const log = console.log.bind(console);

export function cli(argsArray) {
  const args = minimist(argsArray.slice(2));
  log(args);

  let cmd = args._[0] || 'help';
  if (args.help || args.h) cmd = 'help';

  switch (cmd) {
    case 'help':
      help(args);
      break;
    case 'watch':
      watchMd(args);
      break;
    case 'create':
      createTemplate(args);
      break;
    default:
      console.error(`"${cmd}" is not a valid command!`);
      break;
  }
}
