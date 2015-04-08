'use strict';

/******************************************************************************/

var gulp = require('gulp');
var path = require('path');
var del = require('del');
var fs = require('fs');
var runSeq = require('run-sequence');
var pp = require('CordovaPlatformProject');

/******************************************************************************/

var platform = 'android'

// One of many options to work with several platforms
var nopt = require('nopt');
var args = nopt({'ios': Boolean, 'android': Boolean});
if (args.ios)
    platform = 'ios'
if (args.android)
    platform = 'android'


// Collect all the info for the cordova build of the app
var prjInfo = {};
prjInfo.platform = platform;
prjInfo.paths = {};

// Where all your html/css/js files live.
prjInfo.paths.www = path.resolve('www');

// Where cordova_android project will be created
prjInfo.paths.root = path.resolve('build', platform);

// where the cordova-android package lives. In most cases it will be
// downloaded to node_modules by npm But this way it's easy to use your own
// versions of platform templates
prjInfo.paths.template = path.resolve('node_modules', 'cordova-' + platform);

// A list of directories that are plugins or contain plugins.
prjInfo.paths.plugins = [path.resolve('node_modules')];

// Cordova's ConfigParser object represents the config.xml file The file is
// never read again, so you your manipulations of ConfigParser are carried on
// and saved inside the platform project dir under build.
prjInfo.cfg = new pp.cdv.ConfigParser('config.xml');

/******************************************************************************/

gulp.task('clean', function(cb) {
    del(['build'], cb);
});
/******************************************************************************/

// Create a platform project as a build artifact under ./build/<platform>/
gulp.task('create', ['clean'], function() {
    fs.mkdirSync('build');
    var proj = new pp.PlatformProject();
    return proj.create(prjInfo);
});
/******************************************************************************/


// This will update the www assets and build the app
gulp.task('build', [], function() {
    var proj = new pp.PlatformProject();
    return proj.open(platform, prjInfo.paths.root)
    .then(function() {
        return proj.updateConfig(prjInfo.cfg);
    })
    .then(function() {
        return proj.copyWww(prjInfo.paths.www);
    })
    .then(function() {
        return proj.build();
    });
});
/******************************************************************************/


// Run the app on device
gulp.task('run', function() {
    var proj = new pp.PlatformProject();
    return proj.open(platform, prjInfo.paths.root)
        .then(function() {
            var opts = {args: ['--device', '--nobuild']}
            return proj.run(opts);
        });
});

// Run in emulator
gulp.task('emulate', function() {
    var proj = new pp.PlatformProject();
    return proj.open(platform, prjInfo.paths.root)
        .then(function() {
            var opts = {args: ['--emulator', '--nobuild']}
            return proj.run(opts);
        });
});
/******************************************************************************/

// The default task for convenience
gulp.task('default', function() {

    // I happen to have an Android device connected right now but not iOS.
    if (platform =='android')
        runSeq('build', 'run');
    else
        runSeq('build', 'emulate');
});
