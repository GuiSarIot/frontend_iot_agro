module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    'overrides': [
    ],
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },
    'plugins': [
        'react'
    ],
    'rules': {
        'indent': [
            'error',
            4
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never',
        ],
        'spaced-comment': ['error', 'always', {
            'line': {
                'markers': ['/', '!', '?'],
                'exceptions': ['*']
            },
            'block': {
                'markers': ['!'],
                'exceptions': ['*'],
                'balanced': true
            }
        }],
        'react/react-in-jsx-scope': 'off'
    }
}
