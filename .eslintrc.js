// Rules: https://eslint.org/docs/rules/
module.exports = {
    "parser": "@typescript-eslint/parser", // Specifies the ESLint parser
    "extends": [
        "plugin:@typescript-eslint/recommended",
        "airbnb-typescript/base"
    ],
    "parserOptions": {
        "ecmaVersion": 2015, // Allows for the parsing of modern ECMAScript features
        "sourceType": "module", // Allows for the use of imports
        "project": "./tsconfig.json"
    },
    "rules": {
        // @typescript-eslint
        "@typescript-eslint/member-ordering": [
            "error"
        ],
        "@typescript-eslint/camelcase": [
            "error",
            {
                "properties": "never",
                "ignoreImports": true
            }
        ],
        "@typescript-eslint/no-this-alias": [
            "error",
            {
                "allowDestructuring": true, // Allow `const { props, state } = this`; false by default
                "allowedNames": [
                    "that"
                ] // Allow `const self = this`; `[]` by default
            }
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "memberLike",
                "modifiers": [
                    "private"
                ],
                "format": [
                    "camelCase"
                ],
                "leadingUnderscore": "require"
            },
        ],

        "no-restricted-imports": ["error", {
            "paths": [{
                "name": "ng-zorro-antd",
                "importNames": ["isNil"],
                "message": "Please use isNil from lodash instead."
            }]
        }],

        // eslint-plugin-import
        "import/order": "off", // Disable import/order of vsCode or eslint
        "import/prefer-default-export": "off",
        "import/no-extraneous-dependencies": "off",

        // eslint
        "linebreak-style": "off",
        "camelcase": "off",
        "no-unused-vars": "error",
        "no-underscore-dangle": "off",
        "no-console": [
            "error",
            {
                "allow": [
                    "error",
                    "info",
                ]
            }
        ],
        "comma-dangle": [
            "error",
            {
                "arrays": "always-multiline",
                "objects": "always-multiline",
                "imports": "always-multiline",
                "exports": "always-multiline",
                "functions": "always-multiline"
            }
        ],
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "lines-between-class-members": [
            "error",
            "always",
            {
                "exceptAfterSingleLine": true
            }
        ],
        "require-await": "error",
        "no-shadow": "error",
        "object-curly-newline": "off",
        "max-len": "off",
        "no-else-return": "off",
        "class-methods-use-this": "off",
        "array-element-newline": [
            "error",
            "consistent"
        ],
        "dot-notation": "off",
        "no-return-await": "off",
        "require-await": "off",
        "no-case-declarations": "off",
        "no-restricted-globals": "off",
        "no-param-reassign": "off",
        "no-restricted-syntax": "off",
        "array-callback-return": "off",
        "no-prototype-builtins": "off",
        "import/extensions": [
            "off",
        ],
    },
}
