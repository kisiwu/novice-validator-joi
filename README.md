# @novice1/validator-joi

[joi](https://www.npmjs.com/package/joi) validator to use with [@novice1/routing](https://www.npmjs.com/package/@novice1/routing).

It provides a middleware that can validate the properties `params`, `body`, `query`, `headers`, `cookies` and `files` from the request using [joi](https://www.npmjs.com/package/joi) validation.

## Installation

```bash
$ npm install @novice1/validator-joi
```

Example:

```js
var router = require('@novice1/routing')()
var joi = require('joi')
var validatorJoi = require('@novice1/validator-joi')


/**
 * It will validate the  properties "params", "body", "query", "headers", "cookies" and "files"
 * from the request with the route parameters.
 * 
 */
router.setValidators(
  validatorJoi(
    // joi options
    { stripUnknown: true },
    // middleware in case validation fails
    function onerror(err, req, res, next) {
      res.status(400).json(err);
    }
  )
)

router.get({
  name: 'Main app',
  path: '/app',
  parameters: {
    query: {
      version: joi.number()
    }
  }
}, function (req, res) {
  res.json(req.query.version)
})
```

## References

- [joi](https://www.npmjs.com/package/joi)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)