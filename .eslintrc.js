module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: 'airbnb-base',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 4],
        'comma-dangle': ['error', 'never'],
        'no-console': ['error', { allow: ['log', 'error', 'warn'] }],
        'class-methods-use-this': 'off',
        'no-param-reassign': ['error', { props: false }],
        'max-len': ['error', { code: 120 }],
        'no-underscore-dangle': 'off',
        'no-await-in-loop': 'off',
        'import/extensions': ['error', 'never'],
        'import/prefer-default-export': 'off'
    }
}; 