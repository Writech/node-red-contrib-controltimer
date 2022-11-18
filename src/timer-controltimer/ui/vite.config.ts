import preact from '@preact/preset-vite';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeFolderName = path.basename(path.resolve(__dirname, '../'));
const uiDistFolder = path.resolve(__dirname, '../', '../', '../', 'dist', nodeFolderName, 'ui');
const appName = `${nodeFolderName}-editor`;

export default defineConfig({
    plugins: [preact()],

    build: {
        outDir: uiDistFolder,
        lib: {
            entry: path.resolve(__dirname, 'src', 'main.tsx'),
            name: appName
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(''),
            fileName: (format) => `${appName}.${format}.js`,
        },
        rollupOptions: {
            output: {
                format: 'umd',
            },
        },
    },
});
