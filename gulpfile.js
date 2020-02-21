var
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    minifyCss = require('gulp-minify-css'),
    minifyJs = require('gulp-uglify'),
    minifyHtml = require('gulp-minify-html'),
    sourceMaps = require('gulp-sourcemaps'),
    replace = require('gulp-replace'),
    addsrc = require('gulp-add-src'),
    es = require('event-stream'),
    del = require('del');

gulp.task('build-ts', function () {
    return gulp.src([
        '../pip-suite-rest/dist/pip-suite-rest.d.ts',
        '../pip-suite-entry/dist/pip-suite-entry.d.ts',
        '../pip-suite-split/dist/pip-suite-split.d.ts',
        '../pip-suite-pictures/dist/pip-suite-pictures.d.ts',
        '../pip-suite-documents/dist/pip-suite-documents.d.ts',
        '../pip-suite-composite/dist/pip-suite-composite.d.ts',
        '../pip-suite-dashboard/dist/pip-suite-dashboard.d.ts',
        '../pip-suite-guidance/dist/pip-suite-guidance.d.ts',
        '../pip-suite-support/dist/pip-suite-support.d.ts',
        '../pip-suite-map/dist/pip-suite-map.d.ts',
        '../pip-suite-tags/dist/pip-suite-tags.d.ts'
    ])
    .pipe(concat('pip-suite.d.ts'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-js-dev', function () {
    return gulp.src([
        '../pip-suite-rest/dist/pip-suite-rest.js',
        '../pip-suite-entry/dist/pip-suite-entry.js',
        '../pip-suite-split/dist/pip-suite-split.js',
        '../pip-suite-pictures/dist/pip-suite-pictures.js',
        '../pip-suite-documents/dist/pip-suite-documents.js',
        '../pip-suite-composite/dist/pip-suite-composite.js',
        '../pip-suite-dashboard/dist/pip-suite-dashboard.js',
        '../pip-suite-guidance/dist/pip-suite-guidance.js',
        '../pip-suite-support/dist/pip-suite-support.js',
        '../pip-suite-map/dist/pip-suite-map.js',
        '../pip-suite-tags/dist/pip-suite-tags.js'
    ])
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(concat('pip-suite.js'))
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-js-prod', function () {
    return gulp.src([
        '../pip-suite-rest/dist/pip-suite-rest.min.js',
        '../pip-suite-entry/dist/pip-suite-entry.min.js',
        '../pip-suite-split/dist/pip-suite-split.min.js',
        '../pip-suite-pictures/dist/pip-suite-pictures.min.js',
        '../pip-suite-documents/dist/pip-suite-documents.min.js',
        '../pip-suite-composite/dist/pip-suite-composite.min.js',
        '../pip-suite-dashboard/dist/pip-suite-dashboard.min.js',
        '../pip-suite-guidance/dist/pip-suite-guidance.min.js',
        '../pip-suite-support/dist/pip-suite-support.min.js',
        '../pip-suite-map/dist/pip-suite-map.js',
        '../pip-suite-tags/dist/pip-suite-tags.min.js'
    ])
    .pipe(sourceMaps.init({ loadMaps: true }))
    .pipe(concat('pip-suite.min.js'))
    //.pipe(minifyJs())
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-css-dev', function () {
    return gulp.src([
        '../pip-suite-entry/dist/pip-suite-entry.css',
        '../pip-suite-split/dist/pip-suite-split.css',
        '../pip-suite-pictures/dist/pip-suite-pictures.css',
        '../pip-suite-documents/dist/pip-suite-documents.css',
        '../pip-suite-composite/dist/pip-suite-composite.css',
        '../pip-suite-dashboard/dist/pip-suite-dashboard.css',
        '../pip-suite-guidance/dist/pip-suite-guidance.css',
        '../pip-suite-support/dist/pip-suite-support.css',
        '../pip-suite-map/dist/pip-suite-map.css',
        '../pip-suite-tags/dist/pip-suite-tags.css'
    ])
    .pipe(concat('pip-suite.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-css-prod', function () {
    return gulp.src([
        '../pip-suite-entry/dist/pip-suite-entry.min.css',
        '../pip-suite-split/dist/pip-suite-split.min.css',
        '../pip-suite-pictures/dist/pip-suite-pictures.min.css',
        '../pip-suite-documents/dist/pip-suite-documents.min.css',
        '../pip-suite-composite/dist/pip-suite-composite.min.css',
        '../pip-suite-dashboard/dist/pip-suite-dashboard.min.css',
        '../pip-suite-guidance/dist/pip-suite-guidance.min.css',
        '../pip-suite-support/dist/pip-suite-support.min.css',
        '../pip-suite-map/dist/pip-suite-map.min.css',
        '../pip-suite-tags/dist/pip-suite-tags.min.css'
    ])
    .pipe(sourceMaps.init({ loadMaps: true }))
    .pipe(concat('pip-suite.min.css'))
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest('./dist'));
});


gulp.task('build-dev', ['build-js-dev', 'build-css-dev']);
gulp.task('build-prod', ['build-js-prod', 'build-css-prod']);

gulp.task('copy-images', function () {
    return gulp.src([
        '../pip-suite-entry/dist/images/*',
        '../pip-suite-pictures/dist/images/*',
        '../pip-suite-composite/dist/images/*',
        '../pip-suite-documents/dist/images/*'
    ])
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('copy', ['copy-images']);

gulp.task('clean', function () {
    del(['./build', './dist']);
});

gulp.task('build', ['build-dev', 'build-prod', 'build-ts', 'copy']);
gulp.task('rebuild', ['build']);
gulp.task('default', ['build']);