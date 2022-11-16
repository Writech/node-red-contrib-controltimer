module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'simple-import-sort'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    env: {
        node: true,
    },
    globals: {
        NodeJS: true,
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['warn'],
        'comma-dangle': ['warn', 'always-multiline'],
        'linebreak-style': ['error', 'unix'],
        'max-len': [
            'warn',
            {
                code: 180,
                tabWidth: 4,
            },
        ],
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'no-undef': 'error',
        eqeqeq: 'error',
        '@typescript-eslint/no-namespace': 'off',
    },
};
