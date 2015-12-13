/// <binding BeforeBuild='debug' Clean='clean' ProjectOpened='default' />

var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    // needed for gulp-autoprefixer
    promise = require('es6-promise').polyfill(),
    del = require('del');
    // $ = { concat, concatCss, uglify, less, watch, plumber, tsc, useref, if, minifyCss, rename, autoprefixer }
    $ = require('gulp-load-plugins')();

var paths = {
    webroot: './app/',
    dist: './dist/',
    distJs: './dist/js/',
    distCss: './dist/css/',
    distFonts: './dist/fonts/',
    distI18n: './dist/i18n/',
    bower: './bower_components/',
    exludedFiles: ['!./**/*.min.*', '!./scripts/_references.js'],
    dtsFiles: ['./scripts/**/*.d.ts', './app/**/*.d.ts', './T4TS/*.d.ts'],
    tempFolders: ['./bin/', './obj/']
};

paths.appLess = paths.webroot + '**/*.less';
paths.appTs = paths.webroot + '**/*.ts';
paths.appJsWithMap = [paths.webroot + '**/*.js', paths.webroot + '**/*.js.map'];

paths.libFonts = [paths.bower + 'bootstrap/fonts/*.*', paths.bower + 'font-awesome/fonts/*.*'];
paths.libI18n = paths.bower + 'angular-i18n/';

paths.i18nFiles = [paths.libI18n + 'angular-locale_en.js', paths.libI18n + 'angular-locale_ru.js'];
paths.allDistFiles = paths.dist + '**/*.*';
paths.allDistMinFiles = paths.dist + '**/*.min.*';
paths.delAfterReleaseFiles = [paths.allDistFiles, '!' + paths.allDistMinFiles, '!' + paths.distFonts + '**/*.*', '!' + paths.distI18n + '**/*.*'];

var LionSoft = [
        paths.webroot + 'common/LionsoftJs/js.net/**/*.ts',
        paths.webroot + 'common/LionSoftJs/*.ts',
        paths.webroot + 'common/LionSoft.Angular/LionSoft.Angular-*.ts',
        paths.webroot + 'common/LionSoft.Angular/**/*.ts'
],
    app = [
        paths.webroot + 'consts/**/*.ts',
        paths.webroot + 'l10n.ts',
        paths.webroot + 'app.ts'
    ],
    config = [
        paths.webroot + 'config.ts',
        paths.webroot + 'config.exceptionHandler.ts',
        paths.webroot + 'config.l10n.ts',
        paths.webroot + 'config.route.ts'
    ],
    common = [
        paths.webroot + 'common/common.ts',
        paths.webroot + 'common/**/*.ts',
        paths.webroot + 'decorators/**/*.ts',
        paths.webroot + 'filters/**/*.ts'
    ],
    directives = [
        paths.webroot + 'directives/**/*.ts'
    ],
    services = [
        paths.webroot + 'services/system/**/*.ts',
        paths.webroot + 'services/**/*.ts'
    ],
    routes = [
        paths.webroot + 'routes.ts',
        paths.webroot + 'routes/**/*.ts'
    ],
    views = [
        paths.webroot + 'layout/shell.ts',
        paths.webroot + 'views/**/*.ts'
    ];

var tsSources = [].concat(
     LionSoft
    ,app
    ,routes
    ,config
    ,common
    ,services
    ,directives
    ,views
);

// names of output files
var APP_SCRIPTS = 'app.js';
var APP_STYLES = 'styles.css';
var VENDOR_CSS = 'vendor.css';

function concatenate(srcArr, targetFileName, destPath) {
    if (!Array.isArray(srcArr))
        throw new Error('param "srcArr" must be an Array');

    srcArr = srcArr.concat(paths.exludedFiles);
    destPath = destPath || paths.dist;
    var concatHandler = srcArr.some(function (s) { return s.indexOf('.css') !== -1 }) ? $.concatCss : $.concat;

    return gulp.src(srcArr)
        .pipe(concatHandler(targetFileName, { rebaseUrls: false })) // rebaseUrls - adjust any relative URL to the location of the target file
        .pipe(gulp.dest(destPath));
}

function compileTs(srcArr, targetFileName, destPath) {
    if (!Array.isArray(srcArr))
        throw new Error('param "srcArr" must be an Array');

    destPath = destPath || paths.distJs;
    srcArr = srcArr.concat(paths.dtsFiles);

    return gulp.src(srcArr)
        .pipe($.plumber())
        .pipe($.tsc({
            out: targetFileName,
            target: 'ES5',
            sourceMap: true,
            sourceRoot: '/app'
        }))
        .pipe(gulp.dest(destPath));
}

gulp.task('ts', function () {
    return compileTs(tsSources, APP_SCRIPTS);
});

gulp.task('vendorCss', function () {
    var srcArr = [
        paths.bower + '**/*.css',
        './content/customtheme.css',
        './content/styles.css',
        // exclude unused bootstrap-theme
        '!' + paths.bower + '**/bootstrap-theme.css',
        // exclude this file because it's broke "navbar" styles
        '!' + paths.bower + '**/bootstrap-datetimepicker-standalone.css'
    ];
    return concatenate(srcArr, VENDOR_CSS, paths.distCss);
});

gulp.task('less', function () {
    return gulp.src(paths.appLess, { base: 'app' })
        .pipe($.sourcemaps.init())
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.concat(APP_STYLES))
        .pipe($.sourcemaps.write('./', { includeContent: false, sourceRoot: '/app' }))
        .pipe(gulp.dest(paths.distCss));
});

// use only with "release" task
gulp.task('autoprefixer', ['less'], function() {
    return gulp.src(paths.distCss + APP_STYLES)
        .pipe($.autoprefixer({
            browsers: ['last 4 versions']
        }))
        .pipe(gulp.dest(paths.distCss));
});

gulp.task('styles', ['vendorCss', 'less']);

gulp.task('fonts', function() {
    return gulp.src(paths.libFonts)
        .pipe(gulp.dest(paths.distFonts));
});

gulp.task('i18n', function() {
    return gulp.src(paths.i18nFiles)
        .pipe(gulp.dest(paths.distI18n));
});

gulp.task('debug', ['styles', 'ts', 'fonts', 'i18n'], function () {
    gulp.src('./views/shared/_Layout-source.cshtml')
        .pipe($.rename('_Layout.cshtml'))
        .pipe(wiredep())
        .pipe(gulp.dest('./views/shared/'));
});

gulp.task('release', ['vendorCss', 'autoprefixer', 'ts', 'fonts', 'i18n'], function () {
    gulp.src('./views/shared/_Layout-source.cshtml')
        .pipe($.rename('_Layout.cshtml'))
        .pipe(wiredep())
        .pipe($.useref())
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.minifyCss({ processImport: false })))
        .pipe(gulp.dest('./views/shared/'))
        .on('end', function() {
            del(paths.delAfterReleaseFiles);
        });
});

gulp.task('clean', function () {
    del([].concat(paths.appJsWithMap)
        .concat(paths.tempFolders)
        .concat([paths.dist])
    );
});

gulp.task('watch', function () {
    $.watch(paths.appTs, function () {
        gulp.start('ts');
    });
    $.watch(paths.appLess, function () {
        gulp.start('less');
    });
});

gulp.task('default', ['watch']);
