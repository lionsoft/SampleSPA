/// <binding BeforeBuild='less' ProjectOpened='watch' />
/// <binding Clean='clean' />

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    batch = require('gulp-batch'),
    path = require('path'),
    plumber = require('gulp-plumber');


var paths = {
    webroot: "./app/"
};

paths.js = paths.webroot + "js/**/*.js";
paths.minJs = paths.webroot + "js/**/*.min.js";
paths.css = paths.webroot + "css/**/*.css";
paths.less = paths.webroot + "css/**/*.less";
paths.minCss = paths.webroot + "css/**/*.min.css";
paths.concatJsDest = paths.webroot + "js/site.min.js";
paths.concatCssDest = paths.webroot + "css/site.min.css";

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function () {
    gulp.src([paths.js, "!" + paths.minJs], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    gulp.src([paths.css, "!" + paths.minCss])
        .pipe(plumber())
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task('less', function () {
    return gulp.src('./app/**/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(function (file) { return file.base; }));
});

gulp.task('watch', function () {
    var mixins = ['constants', 'mixins'];
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
        var files = events._list.map(function (x) {
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


gulp.task("min", ["less", "min:js", "min:css"]);
