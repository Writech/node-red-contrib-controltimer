import chalk from 'chalk';
import { CommonSpawnOptions } from 'child_process';
import spawn from 'cross-spawn';
import ejs from 'ejs';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export function getNodeFolderNames() {
    const srcFolderPath = path.resolve(process.cwd(), 'src');
    return fs.readdir(srcFolderPath);
}

export async function getNodeInfo(nodeFolderName: string) {
    const nodeSrcFolderPath = path.resolve(process.cwd(), 'src', nodeFolderName);
    const nodeDistFolderPath = path.resolve(process.cwd(), 'dist', nodeFolderName);
    const [nodeCategory, nodeName] = nodeFolderName.split('-');
    const nodeConfig = await import(path.resolve(nodeSrcFolderPath, 'config.mts'));
    return { nodeFolderName, nodeSrcFolderPath, nodeDistFolderPath, nodeCategory, nodeName, nodeConfig };
}

export async function renderHtml(nodeFolderName: string, htmlTemplateVariables: Record<string, string>) {
    const { nodeSrcFolderPath, nodeDistFolderPath, nodeName } = await getNodeInfo(nodeFolderName);

    const htmlTemplatePath = path.resolve(nodeSrcFolderPath, `${nodeName}.ejs`);
    const htmlDistPath = path.resolve(nodeDistFolderPath, `${nodeName}.html`);

    const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf-8');
    const html = ejs.render(htmlTemplate, htmlTemplateVariables);

    console.log(chalk.blue('HTML'), `Template: ${htmlTemplatePath}`);
    console.log(chalk.green('HTML'), htmlDistPath);

    await fs.writeFile(htmlDistPath, html);
}

export async function copyIcons(nodeFolderName: string) {
    const { nodeSrcFolderPath, nodeDistFolderPath } = await getNodeInfo(nodeFolderName);

    const srcIconsPath = path.resolve(nodeSrcFolderPath, 'icons');
    const distIconsPath = path.resolve(nodeDistFolderPath, 'icons');

    console.log(chalk.blue('Icons'), `From: ${srcIconsPath}`);
    console.log(chalk.green('Icons'), `To: ${distIconsPath}`);

    await fs.copy(srcIconsPath, distIconsPath);
}

export function wrapText(
    text: string,
    options: {
        wrapCharacter?: string;
        verticalMarginLength?: number;
        horizontalEdgeLength?: number;
        horizontalPaddingLength?: number;
    } = {},
) {
    const wrapCharacter = options.wrapCharacter ?? '#';
    const verticalMarginLength = options.verticalMarginLength ?? 0;
    const horizontalEdgeLength = options.horizontalEdgeLength ?? 2;
    const horizontalPaddingLength = options.horizontalPaddingLength ?? 1;

    const longestTextLineLength = text
        .split(os.EOL)
        .reduce((longestTextLineLength, textLine) => Math.max(longestTextLineLength, textLine.length), 0);

    const wrappedTextLines = text.split(os.EOL).map((textLine) => {
        const horizontalEdge = wrapCharacter.repeat(horizontalEdgeLength);
        const horizontalPadding = ' '.repeat(horizontalPaddingLength);
        return `${horizontalEdge}${horizontalPadding}${textLine.padEnd(longestTextLineLength, ' ')}${horizontalPadding}${horizontalEdge}`;
    });

    const verticalEdge = wrapCharacter.repeat(longestTextLineLength + horizontalEdgeLength * 2 + horizontalPaddingLength * 2);
    const verticalMargin = os.EOL.repeat(verticalMarginLength);
    return [verticalMargin, verticalEdge, ...wrappedTextLines, verticalEdge, verticalMargin].join(os.EOL);
}

export function execute(command: string[], cwd?: string) {
    const options: CommonSpawnOptions = { stdio: 'inherit' };

    if (cwd) {
        options.cwd = cwd;
    }

    return spawn.sync(command[0], command.slice(1), options);
}

export async function getExecutionTime(task: () => Promise<unknown> | unknown) {
    const highResolutionTimestampStart = process.hrtime.bigint();
    await task();
    const highResolutionTimestampEnd = process.hrtime.bigint();

    const durationInNanoSeconds = Number(highResolutionTimestampEnd - highResolutionTimestampStart);
    const durationInMilliseconds = durationInNanoSeconds / 1_000_000;
    const durationInSeconds = durationInNanoSeconds / 1_000_000_000;

    if (durationInNanoSeconds < 1_000_000) {
        return `${durationInNanoSeconds.toFixed(0)}ns`;
    }

    if (durationInMilliseconds < 10_000) {
        return `${durationInMilliseconds.toFixed(0)}ms`;
    }

    return `${durationInSeconds.toFixed(0)}s`;
}

export type PackageJson = {
    type?: string;
};

type Json = Record<string, unknown> | Array<unknown>;

export const FileSystemUtility = {
    editTextFile: async (filePath: string, editHandler: (text: string) => string) => {
        await fs.ensureFile(filePath);
        const textFileContents = await fs.readFile(filePath, 'utf-8');
        const editedTextFileContents = editHandler(textFileContents);
        await fs.outputFile(filePath, editedTextFileContents);
        return editedTextFileContents;
    },
    editJsonFile: async <T extends Json>(filePath: string, editHandler: (json: T) => void) => {
        const jsonFileContents = await fs.readJson(filePath);
        editHandler(jsonFileContents);
        await fs.writeJson(filePath, jsonFileContents);
        return jsonFileContents;
    },
};
