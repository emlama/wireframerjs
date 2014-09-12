var gulp  = require('gulp'),
    watch = require('gulp-watch'),
    wireframer = require('../bin/wireframer');

// Define _site folder
// ignore _site folder! https://github.com/robrich/gulp-ignore

gulp.task('default', function () {
  watch('**/*.html', function (files, cb) {
    gulp.start('buildTmps', cb);
  });

  watch('**/*.js', function (files, cb) {
    gulp.start('buildJs', cb);
  });

  watch('anything else', function (files, cb) {
    // Pipe to _site folder
  });
});

// Process html files
gulp.task('buildTmps', function () {
  // Concat
  // Process each
  // Write to disk
});

// Process JS files
gulp.task('buildJs', function () {
  // Concat
  // Write to disk
});

gulp.task('buildFramework', function () {
  // Copy over framework files
});