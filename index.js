'use strict';

var fs = require('fs');
var escomplex = require('escomplex-js');
var merge = require('merge');

var DEFAULT_OPTIONS = {
  'include-for-in': false,
  'include-try-catch': false,
  'ms-maintainability-index': false
};

function isNumber(value) {
  return value && typeof value === 'number';
}

function testThreshold(threshold, metric) {
  return !threshold || (isNumber(threshold) && metric <= threshold);
}

function validModuleOptions(options) {
  return isNumber(options['maintainability-index']);
}

function testModule(report, options) {
  report.success = testThreshold(
    options['maintainability-index'], report.maintainability
  );
}

function validFunctionOptions(options) {
  return (
    isNumber(options.cyclomatic) ||
    isNumber(options['cyclomatic-density']) ||
    isNumber(options['halstead-difficulty']) ||
    isNumber(options['halstead-volume']) ||
    isNumber(options['halstead-effort'])
  );
}

function testFunction(report, options) {
  return (
    testThreshold(options.cyclomatic, report.cyclomatic) &&
    testThreshold(options['cyclomatic-density'], report.cyclomaticDensity) &&
    testThreshold(options['halstead-difficulty'], report.halstead.difficulty) &&
    testThreshold(options['halstead-volume'], report.halstead.volume) &&
    testThreshold(options['halstead-effort'], report.halstead.effort)
  );
}

function testFunctions(reports, options) {
  reports.forEach(function (report) {
    report.success = testFunction(report, options);
  });
}

function validProjectOptions(options) {
  return (
    isNumber(options['first-order-density']) ||
    isNumber(options['change-cost']) ||
    isNumber(options['core-size'])
  );
}

function testProject(report, options) {
  return (
    testThreshold(options['first-order-density'], report.firstOrderDensity) &&
    testThreshold(options['change-cost'], report.changeCost) &&
    testThreshold(options['core-size'], report.coreSize)
  );
}

function analyse(sourcePaths, options) {
  var sources = [];
  sourcePaths.forEach(function (sourcePath) {
    var source = fs.readFileSync(sourcePath, {encoding: 'utf8'});
    if (!source.indexOf('#!')) {
      source = '//' + source;
    }
    sources.push({
      path: sourcePath,
      code: source
    });
  });

  return escomplex.analyse(
    sources, {
      logicalor: options['ignore-or'],
      switchcase: options['ignore-switch'],
      forin: options['include-for-in'],
      trycatch: options['try-catch'],
      newmi: options['ms-maintainability-index']
    }
  );
}

function check(complexity, options) {
  var validModules = validModuleOptions(options);
  var validFunctions = validFunctionOptions(options);

  complexity.reports.forEach(function (report) {
    if (validModules) {
      testModule(report, options);
    }
    if (validFunctions) {
      testFunctions(report.functions, options);
    }
  });

  if (validProjectOptions(options)) {
    testProject(complexity, options);
  }

  return complexity;
}

module.exports = function (sourcePaths, options) {
  options = merge(DEFAULT_OPTIONS, options);
  return check(analyse(sourcePaths, options), options);
};

