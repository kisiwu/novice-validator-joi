import Joi, { isSchema } from 'joi';
import Extend from 'extend';
import Logger from '@novice1/logger';
import { ErrorRequestHandler, RequestHandler, Request } from '@novice1/routing';
import { ParsedQs } from 'qs';
import { ParamsDictionary } from 'express-serve-static-core';
import { IncomingHttpHeaders } from 'http';

const Log = Logger.debugger('@novice1/validator-joi');

const PARAMETERS_PROPS = ['params', 'body', 'query', 'headers', 'cookies', 'files'];

interface ValidationObject {
  params?: ParamsDictionary;
  body?: unknown;
  query?: ParsedQs;
  headers?: IncomingHttpHeaders;
  cookies?: unknown;
  files?: unknown;
}

type JoiSchema = Partial<Joi.Schema>;

function createSchema(value: Record<string, unknown> | JoiSchema): JoiSchema | null {
  let schema: JoiSchema | null = null;
  let tempValue = value;

  // check if schema is a valid schema
  if (tempValue) {
    // if it is not a JoiSchema
    if (!isSchema(tempValue)) {
      const tmpSchema: Record<string, JoiSchema> = {};
      const currentSchema: Record<string, JoiSchema> = tempValue as Record<string, JoiSchema>;
      PARAMETERS_PROPS.forEach((p) => {
        if (currentSchema[p] && typeof currentSchema[p] === 'object') {
          tmpSchema[p] = currentSchema[p];
        }
      });
      if (Object.keys(tempValue).length) {
        tempValue = Joi.object(tmpSchema);
      } else {
        tempValue = tmpSchema;
      }
    }

    // if it is a Joi.ObjectSchema
    if (tempValue?.type == 'object'
      && isSchema(tempValue)) {
      schema = tempValue;
    }
  }

  return schema;
}

function retrieveParametersValue(parameters?: Record<string, unknown>, property?: string): JoiSchema | Record<string, unknown> | null {
  let schemaFromParameters: Record<string, unknown> | null = null;

  if (
    parameters &&
    typeof parameters === 'object'
  ) {

    schemaFromParameters = parameters;

    if (property && typeof property === 'string') {
      const subParameters = schemaFromParameters?.[property];
      if (
        subParameters &&
        typeof subParameters === 'object' &&
        !Array.isArray(subParameters)
      ) {
        schemaFromParameters = subParameters as Record<string, unknown>;
      } else {
        schemaFromParameters = null;
      }
    }
  }
  return schemaFromParameters;
}

function retrieveSchema(parameters?: Record<string, unknown>, property?: string): JoiSchema | null {
  const v = retrieveParametersValue(parameters, property);
  if (v) {
    return createSchema(v);
  } else {
    return v;
  }
}

function buildValueToValidate(schema: JoiSchema, req: Request): ValidationObject {
  const r: ValidationObject = {};

  //'params', 'body', 'query', 'headers', 'cookies', 'files'
  if (schema.$_terms?.keys.find((k: { key: string }) => k.key === 'params')) {
    r.params = req.params;
  }
  if (schema.$_terms?.keys.find((k: { key: string }) => k.key === 'body')) {
    r.body = req.body;
  }
  if (schema.$_terms?.keys.find((k: { key: string }) => k.key === 'query')) {
    r.query = req.query;
  }
  if (schema.$_terms?.keys.find((k: { key: string }) => k.key === 'headers')) {
    r.headers = req.headers;
  }
  if (schema.$_terms?.keys.find((k: { key: string }) => k.key === 'cookies')) {
    r.cookies = req.cookies;
  }
  if (schema.$_terms?.keys.find((k: { key: string }) => k.key === 'files')) {
    r.files = req.files;
  }

  return r;
}


/**
 * 
 * @param options 
 * @param onerror 
 * @param validationProperty 
 * @returns 
 */
function validatorJoi(
  options?: Joi.AsyncValidationOptions,
  onerror?: ErrorRequestHandler,
  validationProperty?: string): RequestHandler {
  options = options || { stripUnknown: true };

  return function validatorJoiRequestHandler(req, res, next) {
    // retrieve schema
    const schema = retrieveSchema(req.meta?.parameters, validationProperty);

    // no schema to validate
    if (!schema) {
      Log.silly('no schema to validate');
      return next();
    } else {

      // object that we will validate
      const value = buildValueToValidate(schema, req);

      Log.info('validating %O', value);

      // validate schema
      return schema.validateAsync?.(value, options).then(
        (validated) => {
          Log.info('Valid request for %s', req.originalUrl);

          // because 'query' is readonly since Express v5
          const { query, ...validatedProps } = validated
          Log.debug('Validated query %o', query);
          req.validated = () => validated

          Extend(req, validatedProps);
          next();
        },
        (err) => {
          Log.error('Invalid request for %s', req.originalUrl);
          if (typeof req.meta.parameters?.onerror === 'function') {
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
                'Expected arg 2 ("onerror") to be a function (ErrorRequestHandler). Instead got type "%s"',
                typeof onerror
              );
            }
          }
          return res.status(400).json(err);
        }
      );
    }
  };
}

export = validatorJoi;
