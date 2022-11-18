module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'simple-import-sort', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    env: {
        node: true,
    },
    globals: {
        NodeJS: true,
    },
    overrides: [
        {
            files: ['*.js', '*.ts', '*.cjs', '*.mts', '*.jsx', '*.tsx'],
        },
    ],
    rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['warn'],
        'comma-dangle': ['warn', 'always-multiline'],
        'linebreak-style': ['error', 'unix'],
        'max-len': [
            'error',
            {
                code: 140,
                tabWidth: 4,
            },
        ],
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'no-undef': 'error',
        eqeqeq: 'error',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-this-alias': 'off',
    },
};
