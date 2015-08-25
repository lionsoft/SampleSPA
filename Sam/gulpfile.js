/// <binding />
// <binding BeforeBuild='less' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var less = require('gulp-less');
var path = require('path');
var plumber = require('gulp-plumber');

gulp.task('less', function () {
    return gulp.src('./app/**/*.less')
        .pipe(plumber())
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest(function(file) { return file.base;}));
});

gulp.task('watch', function () {
    watch('./app/**/*.less', batch(function (events, done) {
        gulp.start('less', done);
    }));
});
