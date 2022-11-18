import chalk from 'chalk';
import path from 'path';

import {
    copyIcons,
    execute,
    FileSystemUtility,
    getExecutionTime,
    getNodeFolderNames,
    getNodeInfo,
    PackageJson,
    renderHtml,
    wrapText,
} from './utils.mjs';

for (const nodeFolderName of await getNodeFolderNames()) {
    const { nodeSrcFolderPath, nodeDistFolderPath, nodeName, nodeConfig } = await getNodeInfo(nodeFolderName);

    console.log(chalk.cyan(wrapText(`Building ${nodeFolderName}`)));
    await execute([
        'npx',
        'tsup',
        path.join(nodeSrcFolderPath, `${nodeName}.mts`),
        '--format',
        'cjs',
        '--legacy-output',
        '--minify',
        '--outDir',
        nodeDistFolderPath,
    ]);

    {
        console.log(chalk.cyan(wrapText(`Rendering HTML`)));
        const executionTime = await getExecutionTime(() => renderHtml(nodeFolderName, nodeConfig));
        console.log(chalk.green('HTML'), '⚡', `Rendered in ${executionTime}`);
    }

    {
        console.log(chalk.cyan(wrapText(`Copying icons`)));
        const executionTime = await getExecutionTime(() => copyIcons(nodeFolderName));
        console.log(chalk.green('Icons'), '⚡', `Copied in ${executionTime}`);
    }

    const nodeUiFolderPath = path.resolve(nodeSrcFolderPath, 'ui');

    {
        process.stdout.write(chalk.cyan(wrapText(`UI NPM Install`)));
        const executionTime = await getExecutionTime(() => execute(['npm', 'install'], nodeUiFolderPath));
        console.log();
        console.log(chalk.green('UI NPM'), '⚡', `Installed in ${executionTime}`);
    }

    {
        process.stdout.write(chalk.cyan(wrapText(`Building UI`)));
        const executionTime = await getExecutionTime(() => execute(['npm', 'run', 'build'], nodeUiFolderPath));
        console.log();
        console.log(chalk.green('UI Build'), '⚡', `Completed in ${executionTime}`);
    }

    // If type: "module" is set in package.json, then te node will not work in Node-RED.
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');

    await FileSystemUtility.editJsonFile<PackageJson>(packageJsonPath, (packageJson) => {
        delete packageJson.type;
    });

    {
        console.log(chalk.cyan(wrapText(`NPM Packing`)));
        const executionTime = await getExecutionTime(() => execute(['npm', 'pack'], process.cwd()));
        console.log();
        console.log(chalk.green('NPM Pack'), '⚡', `Completed in ${executionTime}`);
    }

    await FileSystemUtility.editJsonFile<PackageJson>(packageJsonPath, (packageJson) => {
        packageJson.type = 'module';
    });

    await execute(['npm', 'run', 'tidy:format'], process.cwd());
}
