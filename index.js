const Joi = require("@hapi/joi");
const Extend = require("extend");
const Log = require("@novice1/logger").debugger("@novice1:validator:joi");

/**
 *
 * @param {object} [options] hapi/joi options. Default: { stripUnknown: true }
 * @param {Function} [onerror]
 */
function validatorJoi(options, onerror) {
  options = options || { stripUnknown: true };

  return function validateRequest(req, res, next) {
    var toValidate = {};
    var schema;

    if (
      req.meta &&
      req.meta.parameters &&
      typeof req.meta.parameters === "object"
    ) {
      schema = req.meta.parameters;
      if (typeof schema.validate !== "function") {
        schema = Joi.object(schema);
      }
      if (schema.type !== "object") {
        schema = null;
      }
    }

    if (!schema) {
      Log.silly("no schema to validate");
      return next();
    }

    ["params", "body", "files", "query"].forEach(function (key) {
      if (schema.$_terms.keys.find((k) => k.key === key)) {
        toValidate[key] = req[key];
      }
    });

    return schema.validateAsync(toValidate, options).then(
      (validated) => {
        Log.info("Valid request for %s", req.pathname);
        Extend(req, validated);
        next();
      },
      (err) => {
        Log.info("Invalid request for %s", req.pathname);
        if (onerror) {
          if (typeof onerror === "function") {
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
