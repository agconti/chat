'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    changed = require('gulp-changed'),
    concat = require("gulp-concat"),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');

// browser-sync task for starting the server.
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

// javascript task
gulp.task('js', function () {
    return gulp.src([
            'public/js/vendor/**/*.js',
            'public/js/custom/**/*.js'
        ])
        .pipe(changed('public/js/dest'))
        .pipe(concat("main.js"))
        .pipe(gulp.dest('public/js/dest'));
});

// Sass task, will run when any SCSS files change & BrowserSync
// will auto-update browsers
gulp.task('sass', function () {
    return gulp.src([
            'public/scss/**/*.scss',
            'public/scss/**/*.css'
        ])
        .pipe(changed('public/css'))
        .pipe(sass().on('error', console.error.bind(console)))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('public/css'));
});

// Default task to be run with `gulp`
gulp.task('default', ['js', 'sass', 'browser-sync'], function () {
    gulp.watch(['./**/*.html'], [reload]);
    gulp.watch(['public/scss/*.scss'], ['sass', reload]);
    gulp.watch(['public/js/custom/**/*.js', 'public/js/vendor/**/*.js'], ['js', reload]);
});