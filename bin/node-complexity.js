#!/usr/bin/env node

'use strict';

var coverageReport = require('..');

function regexp(value) {
  return new RegExp(value);
}

function inverse(value) {
  return !value;
}

var args = require('commander')
  .usage('[options] <path>')
  .option(
    '-o, --output <path>',
    'specify an output file for the report'
  )
  .option(
    '-f, --format <format>',
    'specify the output format of the report'
  )
  .option(
    '-a, --allfiles',
    'include hidden files in the report'
  )
  .option(
    '-p, --filepattern <pattern>',
    'specify the files to process using a regular expression to match against file names',
    regexp,
    '\\.js$'
  )
  .option(
    '-P, --dirpattern <pattern>',
    'specify the directories to process using a regular expression to match against directory names',
    regexp
  )
  .option(
    '-m, --maxfiles <number>',
    'specify the maximum number of files to have open at any point',
    parseInt,
    1024
  )
  .option(
    '-F, --maxfod <first-order density>',
    'specify the per-project first-order density threshold',
    parseFloat
  )
  .option(
    '-O, --maxcost <change cost>',
    'specify the per-project change cost threshold',
    parseFloat
  )
  .option(
    '-S, --maxsize <core size>',
    'specify the per-project core size threshold',
    parseFloat
  )
  .option(
    '-M, --minmi <maintainability index>',
    'specify the per-module maintainability index threshold',
    parseFloat
  )
  .option(
    '-C, --maxcyc <cyclomatic complexity>',
    'specify the per-function cyclomatic complexity threshold',
    parseInt
  )
  .option(
    '-Y, --maxcycden <cyclomatic density>',
    'specify the per-function cyclomatic complexity density threshold',
    parseInt
  )
  .option(
    '-D, --maxhd <halstead difficulty>',
    'specify the per-function Halstead difficulty threshold',
    parseFloat
  )
  .option(
    '-V, --maxhv <halstead volume>',
    'specify the per-function Halstead volume threshold',
    parseFloat
  )
  .option(
    '-E, --maxhe <halstead effort>',
    'specify the per-function Halstead effort threshold',
    parseFloat
  )
  .option(
    '-s, --silent',
    'dont write any output to the console'
  )
  .option(
    '-l, --logicalor',
    'disregard operator || as source of cyclomatic complexity',
    inverse
  )
  .option(
    '-w, --switchcase',
    'disregard switch statements as source of cyclomatic complexity',
    inverse
  )
  .option(
    '-i, --forin',
    'treat for...in statements as source of cyclomatic complexity',
    false
  )
  .option(
    '-t, --trycatch',
    'treat catch clauses as source of cyclomatic complexity',
    false
  )
  .option(
    '-n, --newmi',
    'use the Microsoft-variant maintainability index (scale of 0 to 100)',
    false
  )
  .parse(process.argv);

var complexity = coverageReport(args.sourcePaths, args);

console.log(JSON.stringify(complexity, undefined, 4));

process.exit(!complexity.success);

