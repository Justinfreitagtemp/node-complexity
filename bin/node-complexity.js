#!/usr/bin/env node

'use strict';

var args = require('commander');
var complexity = require('..');

args.Command.prototype.optionHelp = function () {
  var width = this.largestOptionLength();
  return (
    this.options.map(function (option) {
      var length = Math.max(0, width - option.flags.length);
      var separator = new Array(length + 1).join(' ') + '  ';
      return option.flags + separator + option.description;
    })
    .join('\n')
  );
};

args.Command.prototype.version = function (string) {
  this._version = string;
  this.option('--version', null);
  this.on('version', function () {
    console.log(string);
    process.exit(0);
  });
  return this;
};

args
  .version(require('../package').version)
  .usage('[options] <file file ...>')
  .option(
    '--first-order-density <float>',
    null,
    parseFloat
  )
  .option(
    '--change-cost <float>',
    null,
    parseFloat
  )
  .option(
    '--core-size <float>',
    null,
    parseFloat
  )
  .option(
    '--maintainability-index <float>',
    null,
    parseFloat
  )
  .option(
    '--ms-maintainability-index',
    null,
    false
  )
  .option(
    '--cyclomatic <integer>',
    null,
    parseInt
  )
  .option(
    '--cyclomatic-density <integer>',
    null,
    parseInt
  )
  .option(
    '--halstead-difficulty <float>',
    null,
    parseFloat
  )
  .option(
    '--halstead-volume <float>',
    null,
    parseFloat
  )
  .option(
    '--halstead-effort <float>',
    null,
    parseFloat
  )
  .option(
    '--ignore-or',
    null,
    false
  )
  .option(
    '--ignore-switch',
    null,
    false
  )
  .option(
    '--include-for-in',
    null,
    false
  )
  .option(
    '--include-try-catch',
    null,
    false
  )
  .parse(process.argv);

if (!args.args.length) {
  args.help();
}

var result = complexity(args.args, args);
console.log(JSON.stringify(result, undefined, 4));

process.exit(!!result.success);

