/// <binding BeforeBuild='less' ProjectOpened='watch' />
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


gulp.task('default', function () {
    gulp.start('less');
});

gulp.task('less', function () {
    return gulp.src('./app/**/*.less')
        .pipe(plumber())
        .pipe(less())
/*
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
*/
        .pipe(gulp.dest(function(file) { return file.base;}));
});

gulp.task('watch', function () {
    var mixins = ['consts', 'mixins'];
    var isMixin = function (fileName) {
        var res = false;
        for (var i = 0; i < mixins.length; i++) {
            var mixinName = mixins[i] + '.less';
            res = fileName.indexOf(mixinName) === fileName.length - mixinName.length;
            if (res)
                break;
        }
        return res;
    }
    watch('./app/**/*.less', batch(function (events, done) {
        var recompileAll = false;
        var files = events._list.map(function(x) {
            recompileAll = recompileAll || isMixin(x.path);
            return x.path;
        });
        console.log(files);
        var res = gulp.src(files)
            .pipe(plumber())
            .pipe(less())
            .pipe(gulp.dest(function (file) { return file.base; }));
        if (recompileAll)
            gulp.start('less', done);
        return res;
    }));
});
