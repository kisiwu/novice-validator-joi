const Joi = require('joi');
const Extend = require('extend');
const Log = require('@novice1/logger').debugger('@novice1/validator-joi');

const PARAMETERS_PROPS = ['params', 'body', 'files', 'query'];

/**
 *
 * @param {object} [options] joi options. Default: { stripUnknown: true }
 * @param {Function} [onerror]
 * @param {string} [validationProperty]
 */
function validatorJoi(options, onerror, validationProperty) {
  options = options || { stripUnknown: true };

  return function validateRequest(req, res, next) {
    let schema;
    const toValidate = {};

    // retrieve schema
    if (
      req.meta &&
      req.meta.parameters &&
      typeof req.meta.parameters === 'object'
    ) {
      schema = req.meta.parameters;

      if (validationProperty && typeof validationProperty === 'string') {
        if (
          schema[validationProperty] &&
          typeof schema[validationProperty] === 'object'
        ) {
          schema = schema[validationProperty];
        } else {
          schema = null;
        }
      }
    }

    // check if schema is a valid schema
    if (schema) {
      // if it is not a Joi object
      if (typeof schema.validate !== 'function') {
        const tmpSchema = {};
        PARAMETERS_PROPS.forEach((p) => {
          if (schema[p] && typeof schema[p] === 'object') {
            tmpSchema[p] = schema[p];
          }
        });
        schema = tmpSchema;
        if (Object.keys(schema).length) {
          schema = Joi.object(schema);
        }
      }
      // if still not a Joi object
      if (schema.type !== 'object') {
        schema = null;
      }
    }

    // no schema to validate
    if (!schema) {
      Log.silly('no schema to validate');
      return next();
    }

    PARAMETERS_PROPS.forEach(function (key) {
      if (schema.$_terms.keys.find((k) => k.key === key)) {
        toValidate[key] = req[key];
      }
    });

    Log.info('validating %O', toValidate);

    // validate schema
    return schema.validateAsync(toValidate, options).then(
      (validated) => {
        Log.info('Valid request for %s', req.originalUrl);
        Extend(req, validated);
        next();
      },
      (err) => {
        Log.error('Invalid request for %s', req.originalUrl);
        if (typeof req.meta.parameters.onerror === 'function') {
          Log.error(
            'Custom function onerror => %s',
            req.meta.parameters.onerror.name
          );
          return req.meta.parameters.onerror(err, req, res, next);
        }
        if (onerror) {
          if (typeof onerror === 'function') {
            Log.error('Custom function onerror => %s', onerror.name);
            return onerror(err, req, res, next);
          } else {
            Log.warn(
              `Expected arg 2 ("onerror") to be a "function". Instead got type "%s"`,
              typeof onerror
            );
          }
        }
        return res.status(400).json(err);
      }
    );
  };
}

module.exports = validatorJoi;
