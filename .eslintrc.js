/** @type {import('eslint').Linter.Config} */
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'], // opcional (para reglas con type-checking)
        tsconfigRootDir: __dirname,
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            typescript: {}, // soporte de paths y aliases de TS
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
        next: {
            rootDir: ['.'],
        },
    },
    plugins: ['react', '@typescript-eslint', 'unused-imports', 'import'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'next/core-web-vitals',
        'prettier',
    ],
    rules: {
        // 🧱 Estilo general
        indent: ['error', 4, { SwitchCase: 1 }],
        quotes: ['error', 'single', { avoidEscape: true }],
        semi: ['error', 'never'],
        'spaced-comment': [
            'error',
            'always',
            {
                line: {
                    markers: ['/', '!', '?'],
                    exceptions: ['*'],
                },
                block: {
                    markers: ['!'],
                    exceptions: ['*'],
                    balanced: true,
                },
            },
        ],

        // ⚛️ React / Next ajustes
        'react/react-in-jsx-scope': 'off', // innecesario desde React 17+
        'react/prop-types': 'off', // usando TS
        'react/no-unescaped-entities': 'off', // útil si escribes textos en español
        'react/jsx-uses-react': 'off',
        'react/jsx-uses-vars': 'error',

        // 🧠 TypeScript
        '@typescript-eslint/no-unused-vars': 'off', // manejado por unused-imports
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/ban-ts-comment': 'off',

        // 🚿 Limpieza de imports
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],

        // 📦 Orden de imports
        'import/order': [
            'warn',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    ['parent', 'sibling', 'index'],
                    'object',
                    'type',
                ],
                'newlines-between': 'always',
                pathGroups: [
                    { pattern: 'react', group: 'external', position: 'before' },
                    { pattern: 'next/**', group: 'external', position: 'before' },
                    { pattern: '@/**', group: 'internal', position: 'after' },
                ],
                pathGroupsExcludedImportTypes: ['react'],
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],

        // 🧭 Next.js reglas
        '@next/next/no-html-link-for-pages': 'off', // en app dir no aplica
    },
    overrides: [
        {
            files: ['**/*.{ts,tsx}'],
            parserOptions: {
                project: ['./tsconfig.json'],
            },
            rules: {
                'react/jsx-filename-extension': ['off'],
            },
        },
        {
            files: [
                '*.config.{js,cjs,mjs}',
                'scripts/**/*.{js,ts}',
                'next.config.js',
                'postcss.config.js',
                'tailwind.config.js',
                '.eslintrc.js',
            ],
            parserOptions: {
                project: null, // disables type-checking for config files
            },
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
        {
            files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
            env: { jest: true },
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
    ],
    ignorePatterns: [
        'node_modules/',
        '.next/',
        'out/',
        'dist/',
        'build/',
        '.turbo/',
        '*.d.ts',
    ],
}
