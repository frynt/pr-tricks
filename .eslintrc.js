// Rules: https://eslint.org/docs/rules/
module.exports = {
    "extends": [
        "./node_modules/@needone/eslint-plugin/api/.eslintrc.js",
    ],
    "plugins": ["@needone"],
    "rules": {
        "@needone/api-property-enum-name-required": "error",
        "@needone/api-operation-required": "error",
        "@needone/dto-naming": "error",
        "@needone/entity-naming": "error"
    }
}
