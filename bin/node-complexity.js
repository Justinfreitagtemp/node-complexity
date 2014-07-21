#!/usr/bin/env node

'use strict';

var ArgvParser = require('node-argv-parser');
var complexity = require('..');

var options = {
  firstOrderDensity: {
    type: 'float'
  },
  changeCost: {
    type: 'float'
  },
  coreSize: {
    type: 'float'
  },
  maintainabilityIndex: {
    type: 'float'
  },
  msMaintainabilityIndex: {
    type: 'boolean'
  },
  cyclomatic: {
    type: 'integer'
  },
  cyclomaticDensity: {
    type: 'integer'
  },
  halsteadDifficulty: {
    type: 'float'
  },
  halsteadVolume: {
    type: 'float'
  },
  halsteadEffort: {
    type: 'float'
  },
  includeOr: {
    default: true
  },
  includeSwitch: {
    default: true
  },
  includeForIn: {
    type: 'boolean',
  },
  includeTryCatch: {
    type: 'boolean'
  }
};

var argvParser = new ArgvParser(options);

var args = argvParser.parse(options);

var result = complexity(args.argv, args);
console.log(JSON.stringify(result, undefined, 4));

process.exit(!!result.success);

