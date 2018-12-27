module.exports = {
  "extends": "airbnb",
  "env": {
      "es6": true
  },
  "rules": {
      "linebreak-style": ["off", "unix"],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "no-underscore-dangle": "off",
      "object-curly-newline": "off",
      "no-param-reassign": "off",
      "max-len": ["error", { "code": 120, "ignoreUrls": true }],
      "no-console": ["error", { "allow": ["error"] }]
  },
  "parser": "babel-eslint"
};
