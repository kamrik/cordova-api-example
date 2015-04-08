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

var prjInfo = {};
prjInfo.platform = platform;
prjInfo.paths = {};
prjInfo.paths.www = path.resolve('www');
prjInfo.paths.root = path.resolve('build', platform);
prjInfo.paths.template = path.resolve('node_modules', 'cordova-' + platform);
prjInfo.paths.plugins = [path.resolve('node_modules')];
prjInfo.cfg = new pp.cdv.ConfigParser('config.xml');

/******************************************************************************/

gulp.task('clean', function(cb) {
    del(['build'], cb);
});

/******************************************************************************/

gulp.task('create', ['clean'], function() {
    fs.mkdirSync('build');
    var proj = new pp.PlatformProject();
    return proj.create(prjInfo);
});

gulp.task('build', [], function() {
    var proj = new pp.PlatformProject();
    return proj.open(platform, prjInfo.paths.root)
        .then(function() {
            return proj.build();
        });
});

gulp.task('run', function() {
    var proj = new pp.PlatformProject();
    return proj.open(platform, prjInfo.paths.root)
        .then(function() {
            return proj.run();
        });
});



/******************************************************************************/

gulp.task('default', ['create'], function() {
});

