'use strict';

var fs = require('fs');
var escomplex = require('escomplex-js');

function testThreshold(threshold, metric) {
  /* jshint eqnull: true */
  return threshold != null && (metric <= threshold);
}

function validModuleOptions(options) {
  return options.maintainabilityIndex !== undefined;
}

function testModule(report, options) {
  report.success = testThreshold(
    options.maintainabilityIndex, report.maintainability
  );
}

function validFunctionOptions(options) {
  return (
    options.cyclomatic ||
    options.cyclomaticDensity ||
    options.halsteadDifficulty ||
    options.halsteadVolume ||
    options.halsteadEffort
  );
}

function testFunction(report, options) {
  return (
    testThreshold(options.cyclomatic, report.cyclomatic) &&
    testThreshold(options.cyclomaticDensity, report.cyclomaticDensity) &&
    testThreshold(options.halsteadDifficulty, report.halstead.difficulty) &&
    testThreshold(options.halsteadVolume, report.halstead.volume) &&
    testThreshold(options.halsteadEffort, report.halstead.effort)
  );
}

function testFunctions(reports, options) {
  reports.forEach(function (report) {
    report.success = testFunction(report, options);
  });
}

function validProjectOptions(options) {
  return (
    options.firstOrderDensity ||
    options.changeCost ||
    options.coreSize
  );
}

function testProject(report, options) {
  return (
    testThreshold(options.firstOrderDensity, report.firstOrderDensity) &&
    testThreshold(options.changeCost, report.changeCost) &&
    testThreshold(options.coreSize, report.coreSize)
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
      logicalor: options.ignoreOr,
      switchcase: options.ignoreSwitch,
      forin: options.includeForIn,
      trycatch: options.includeTryCatch,
      newmi: options.msMaintainabilityIndex
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
  return check(analyse(sourcePaths, options), options);
};

