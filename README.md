# @novice1/validator-joi

[joi](https://www.npmjs.com/package/joi) validator to use with [@novice1/routing](https://www.npmjs.com/package/@novice1/routing).

It provides a middleware that can validate `req.params`, `req.body`, `req.query`, `req.headers`, `req.cookies` and `req.files` against a schema using [joi](https://www.npmjs.com/package/joi) validation.

## Installation

```bash
npm install @novice1/validator-joi
```

## Usage

### Set validator

```ts
// router.ts

import routing from '@novice1/routing'
import { validatorJoi } from '@novice1/validator-joi'

export default const router = routing()

router.setValidators(
  validatorJoi(
    // Joi.AsyncValidationOptions
    { stripUnknown: true },
    // middleware in case validation fails
    function onerror(err, req, res, next) {
      res.status(400).json(err)
    }
    // name of the property containing the schema
    'schema'
  )
)
```

### Create schema 

```ts
// schema.ts

import Joi from 'joi'
import { ValidatorJoiSchema } from '@novice1/validator-joi'
import router from './router'

// schema for "req.body"
const bodySchema = Joi.object({
  name: Joi.string().required()
}).required()

export const routeSchema: ValidatorJoiSchema = Joi.object().keys({
    body: bodySchema
})

// or
/*
export const routeSchema: ValidatorJoiSchema = {
    body: bodySchema
}
*/

// or
/*
export const routeSchema: ValidatorJoiSchema = {
    body: {                
       name: Joi.string().required()
    }
}
*/
```

### Create route

```ts
import routing from '@novice1/routing'
import express from 'express'
import router from './router'
import { routeSchema } from './schema'

router.post(
  {
    name: 'Post item',
    path: '/items',

    parameters: {
        // the schema to validate
        schema: routeSchema
    },

    // body parser
    preValidators: express.json()
  },
  function (req: routing.Request<unknown, { name: string }, { name: string }>, res) {
    res.json({ name: req.body.name })
  }
)
```

### Transformations

Data can be transformed with methods like `Joi.string().trim()` and more. 

`req.query` being readonly, its tranformed values can be
retrieved from `req.validated().query`. 

For `req.params`, `req.body`, `req.headers`, `req.cookies` and `req.files`, the tranformation is applied on them and `req.validated()` can still be used if you prefer.

|               | raw data    | transformed                                 |
|---------------|-------------|---------------------------------------------|
| **params**    |             | `req.params` or `req.validated().params`    |
| **query**     | `req.query` | `req.validated().query`                     |
| **body**      |             | `req.body` or `req.validated().body`        |
| **headers**   |             | `req.headers` or `req.validated().headers`  |
| **cookies**   |             | `req.cookies` or `req.validated().cookies`  |
| **files**     |             | `req.files` or `req.validated().files`      |


```ts
/**
 * Since express@5 and @novice1/routing@2, req.query is readonly. 
 * The parsed and validated result can be found by calling the function 'req.validated()'.
 */
router.get(
  {
    name: 'Main app',
    path: '/app',
    parameters: {
      query: {
        version: Joi.number()
      }
    }
  },
  function (req, res) {
    res.json(req.validated?.<{ version?: number }>().query?.version)
  }
)
```

### Overrides

Override the error handler for a route.

```ts
import routing from '@novice1/routing'
import router from './router'

const onerror: routing.ErrorRequestHandler = (err, req, res) => {
  res.status(400).json(err)
}

router.get(
  {
    path: '/override',
    parameters: {
      // overrides
      onerror

    },
  },
  function (req, res) {
    // ...
  }
)
```

## References

- [joi](https://www.npmjs.com/package/joi)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
