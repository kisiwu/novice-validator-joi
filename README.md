# @novice1/validator-joi

Joi validator to use with [@novice1/routing](https://www.npmjs.com/package/@novice1/routing).

## Installation

```bash
$ npm install @novice1/validator-joi
```

Example:

```js
var router = require('@novice1/routing')()
var joi = require('@hapi/joi')
var validatorJoi = require('@novice1/validator-joi')


/**
 * It will validate the  properties "params", "body", "query" and "files"
 * from the request with the route parameters.
 * 
 */
router.setValidators(
  validatorJoi(
    // @hapi/joi options
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