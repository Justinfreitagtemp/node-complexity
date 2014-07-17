'use strict';

var fs = require('fs');
var escomplex = require('escomplex-js');
var merge = require('merge');

var DEFAULT_OPTIONS = {
  maxfiles: 1024,
  forin: false,
  trycatch: false,
  newmi: false
};

function beginsWithShebang(source) {
  return source[0] === '#' && source[1] === '!';
}

function testThreshold(threshold, metric) {
  return !isNaN(threshold) && metric <= threshold;
}

function validModuleOptions(options) {
  return !isNaN(options.minmi);
}

function testModule(options, report) {
  return testThreshold(options.minmi, report.maintainability);
}

function validFunctionOptions(options) {
  return !(
    isNaN(options.maxcyc) ||
    isNaN(options.maxcycden) ||
    isNaN(options.maxhd) ||
    isNaN(options.maxhv) ||
    isNaN(options.maxhe)
  );
}

function testFunctions(report, options) {
  for (var i = 0; i < report.functions.length; i++) {
    if (!testFunction(options, report.functions[i])) {
      return false;
    }
  }
  return true;
}

function testFunction(func, options) {
  return (
    testThreshold(options.maxcyc, func.cyclomatic) &&
    testThreshold(options.maxcycden, func.cyclomaticDensity) &&
    testThreshold(options.maxhd, func.halstead.difficulty) &&
    testThreshold(options.maxhv, func.halstead.volume) &&
    testThreshold(options.maxhe, func.halstead.effort)
  );
}

function validProjectOptions(options) {
  return !(
    isNaN(options.maxfod) ||
    isNaN(options.maxcost) ||
    isNaN(options.maxsize)
  );
}

function testProject(options, result) {
  return (
    testThreshold(options.maxfod, result.firstOrderDensity) &&
    testThreshold(options.maxcost, result.changeCost) &&
    testThreshold(options.maxsize, result.coreSize)
  );
}

function check(complexity, options) {
  var validModules = validModuleOptions(options);
  var validFunctions = validFunctionOptions(options);

  complexity.reports.forEach(function (report) {
    report.success = (
      (validModules && testModule(report, options)) ||
      (validFunctions && testFunctions(report, options))
    );
  });

  complexity.success = (
    validProjectOptions(options) && testProject(complexity, options)
  );

  return complexity;
}

function analyse(sourcePaths, options) {
  var sources = [];
  sourcePaths.forEach(function (sourcePath) {
    var source = fs.readFileSync(sourcePath);
    if (beginsWithShebang(source)) {
      source = '//' + source;
    }
    sources.push({
      path: sourcePath,
      source: source
    });
  });

  var escomplexOptions = {
    logicalor: options.logicalor,
    switchcase: options.switchcase,
    forin: options.forin,
    trycatch: options.trycatch,
    newmi: options.newmi
  };
  return escomplex.analyse(sources, options);
}

module.exports = function (sourcePaths, options) {
  return check(analyse(sourcePaths, merge(DEFAULT_OPTIONS, options)));
};

