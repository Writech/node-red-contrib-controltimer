module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    },
};

// module.exports = {
//     root: true,
//     parser: '@typescript-eslint/parser',
//     plugins: ['@typescript-eslint'],
//     extends: [
//         'eslint:recommended',
//         'plugin:node/recommended',
//         'plugin:@typescript-eslint/recommended',
//         'plugin:eslint-comments/recommended',
//         'plugin:import/errors',
//         'plugin:import/warnings',
//         'plugin:import/typescript',
//         'prettier/@typescript-eslint',
//         'plugin:prettier/recommended',
//     ],
//     parserOptions: {
//         ecmaVersion: 2020,
//     },
//     rules: {
//         'import/extensions': 'off',
//         'import/no-unresolved': 'off',
//         'import/no-missing-import': 'off',
//         'node/no-missing-import': 'off',
//     },
//     settings: {
//         'import/resolver': {
//             node: {
//                 extensions: ['.js', '.jsx', '.ts', '.tsx'],
//                 moduleDirectory: ['node_modules', 'src/'],
//             },
//         },
//     },
// };
