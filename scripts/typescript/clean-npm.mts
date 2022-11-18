import chalk from 'chalk';
import glob from 'fast-glob';
import fs from 'fs-extra';

const matches = await glob(['package-lock.json', 'node_modules', 'src/**/package-lock.json', 'src/**/ui/node_modules'], {
    cwd: process.cwd(),
    absolute: true,
    onlyFiles: false,
});

for (const match of matches) {
    console.log(chalk.red(`Deleting ${match}`));
    await fs.remove(match);
}
