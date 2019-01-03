module.exports = {
    extends: "airbnb",
    env: {
        browser: true,
        es6: true
    },
    parser: "babel-eslint",
    rules: {
        "linebreak-style": ["off", "unix"],
        "max-len": ["error", { code: 120, ignoreUrls: true }],
        "no-console": ["error", { allow: ["error"] }],
        "no-param-reassign": "off",
        "no-underscore-dangle": "off",
        "object-curly-newline": "off",
        quotes: ["error", "double", { avoidEscape: true }],
    },
};
