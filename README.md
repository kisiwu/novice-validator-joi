# @novice1/validator-joi

[joi](https://www.npmjs.com/package/joi) validator to use with [@novice1/routing](https://www.npmjs.com/package/@novice1/routing).

It provides a middleware that can validate `req.params`, `req.body`, `req.query`, `req.headers`, `req.cookies` and `req.files` against a schema using [joi](https://www.npmjs.com/package/joi) validation.

## Installation

```bash
npm install @novice1/validator-joi
```

### Typescript

Add `node_modules/@novice1/validator-joi` in your `compilerOptions.typeRoots` of your `tsconfig` file.

```json
{
  "compilerOptions": {
    "typeRoots": [
      "node_modules/@types",
      "node_modules/@novice1/validator-joi"
    ]
  }
}
```

## Usage

Example:

```js
const router = require('@novice1/routing')()
const joi = require('joi')
const validatorJoi = require('@novice1/validator-joi')
const express = require('express')

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
      res.status(400).json(err)
    }
  )
)

router.post(
  {
    name: 'Post app',
    path: '/app',

    parameters: {
      body: joi.object({
        name: joi.string().required()
      }).required()
    },
    // body parser
    preValidators: express.json()
  },
  function (req, res) {
    res.json(req.body.name)
  }
)

/**
 * Since express@5 and @novice1/routing@2, req.query is readonly. 
 * The parsed validated result can be found by calling the function 'req.validated()'.
 */
router.get(
  {
    name: 'Main app',
    path: '/app',
    parameters: {
      query: {
        version: joi.number()
      }
    }
  },
  function (req, res) {
    res.json(req.validated?.().query?.version)
  }
)
```

## References

- [joi](https://www.npmjs.com/package/joi)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
