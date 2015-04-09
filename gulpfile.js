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


// Collect all the info for the cordova build of this app
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

// Path relative to which icons and splashscreens are specified in config.xml
// See https://cordova.apache.org/docs/en/4.0.0/config_ref_images.md.html
// prjInfo.paths.icons = path.resolve('icons');

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
// This is the short version, see the full one below
gulp.task('create', ['clean'], function() {
    fs.mkdirSync('build');
    var proj = new pp.PlatformProject();
    return proj.create(prjInfo);
});

/******************************************************************************/

// Create a platform project as a build artifact under ./build/<platform>/
// Full version. Only needed if you went to do some hackish things between the
// stages. Can't handle icons well for now.
gulp.task('longcreate', ['clean'], function() {
    // TODO: only remove current platform build dir instead of full clean.
    fs.mkdirSync('build');
    var proj = new pp.PlatformProject();

    // This is a list of PluginInfo objects
    var plugins = proj.loadPlugins(path.resolve('./node_modules'));

    //// Here is how to add a single plugin (with variables) from some other place
    // var myPlugin = new pp.cdv.PluginInfo(path.resolve('./my_dev_plugin'))
    // myPlugin.vars = {SOME_VAR: 'some_value'};
    // plugins.push(myPlugin);

    return proj.init(prjInfo)
    .then(function(){
        // addPlugins() can be called more than once.
        return proj.addPlugins(plugins);
    }).then(function(){
        // This updates config files based on config.xml etc.
        return proj.updateConfig(prjInfo.cfg);
    }).then(function(){
        // Copy www assets. This nneds to be called at least once to take care
        // of cordova.js and some plugin assets.
        return proj.copyWww(prjInfo.paths.www);
    });

    // At this stage you can run the platform build script as
    // ./build/<platform>/cordova/build
});
/******************************************************************************/


// This will update the www assets and build the app
gulp.task('build', [], function() {
    var proj = new pp.PlatformProject();
    return proj.open(platform, prjInfo.paths.root)
    .then(function() {
        // Can be omitted or called after copyWww().
        return proj.updateConfig(prjInfo.cfg);
    })
    .then(function() {
        return proj.copyWww(prjInfo.paths.www);
        // Alternatively you can copy the www files yourself to proj.wwwDir
        // calling copyWww() at least once during create is still required
        // to take care of cordova.js and plugin js scripts
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
