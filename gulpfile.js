var gulp = require('gulp')
  , browserSync = require('browser-sync')
  , reload = browserSync.reload
  , changed = require('gulp-changed')
  , concat = require("gulp-concat")
  , autoprefixer = require('gulp-autoprefixer')
  , sass = require('gulp-sass')

// browser-sync task for starting the server.
gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: "./"
    }
  })
})

// javascript task
gulp.task('js', function () {
  return gulp.src([
        'js/vendor/**/*.js'
      , 'js/custom/**/*.js'
      ])
      .pipe(changed('js/dest'))
      .pipe(concat("main.js"))
      .pipe(gulp.dest('js/dest'))
      .pipe(reload({stream:true}))
})

// Sass task, will run when any SCSS files change & BrowserSync
// will auto-update browsers
gulp.task('sass', function () {
  return gulp.src([
      'scss/**/*.scss'
    , 'scss/**/*.css'
    ])
    .pipe(changed('css'))
    .pipe(sass().on('error', console.error.bind(console)))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('css'))
    .pipe(reload({stream:true}))
})

// Default task to be run with `gulp`
gulp.task('default', ['js', 'sass', 'browser-sync'], function () {
  gulp.watch(['./**/*.html'], [reload])
  gulp.watch(['scss/*.scss'], ['sass'])
  gulp.watch(['js/custom/**/*.js', 'js/vendor/**/*.js'], ['js'])
});