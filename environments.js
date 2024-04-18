"use strict";
/**
 * @license
 * Copyright 2021 Google LLC
 */

Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironment = exports.dev = void 0;

/**
 * Try to get the environment variable with the given name and throw if it's not
 * defined or is not an integer.
 */
const integerEnv = (name) => {
  const val = process.env[name];
  if (!val || val.match(/^\d+$/) === null) {
      throw new Error(`Expected environment variable ${name} to be an integer` +
          ` but was ${JSON.stringify(val)}.`);
  }
  return Number(val);
};
/**
* Try to get the environment variable with the given name and throw if it's not
* defined or empty.
*/
const stringEnv = (name) => {
  const val = process.env[name];
  if (!val) {
      throw new Error(`Expected environment variable ${name} to be set and non-empty` +
          ` but was ${JSON.stringify(val)}.`);
  }
  return val;
};
const environment = (env) => env;

const local = environment({
  siteVersion: 'local',
  mainPort: 6415,
  eleventyMode: 'prod',
  eleventyOutDir: '_site',
  reportCspViolations: false,
  get mainUrl() {
      return `http://localhost:${this.mainPort}`;
  },
});

const environments = { local };

/**
 * Return the environment configuration matching the LITDEV_ENV environment
 * variable.
 */
const getEnvironment = () => {
  // const name = process.env.LITDEV_ENV;
  const name = 'local';
  const env = environments[(name ?? '')];
  if (!env) {
    throw new Error(`Expected environment variable LITDEV_ENV to be` +
      ` one of ${Object.keys(environments).join(', ')},` +
      ` but was ${JSON.stringify(name)}.`);
  }
  return env;
};

exports.getEnvironment = getEnvironment;