var gulp  = require('gulp'),
    watch = require('gulp-watch'),
    wireframer = require('../bin/wireframer'),
    gulpFilter = require('gulp-filter'),
    concat = require('gulp-concat'),
    fs = require('fs-extra');

var paths = {
  site: "_site/"
};

// Define _site folder
// ignore _site folder! https://github.com/robrich/gulp-ignore
// Process html files
gulp.task('buildTmps', function () {
  gulp.src(['**/*.html', '!node_modules/**', '!_site/**', '!framework/**'])
    .pipe(concat('templates.js'))
    .pipe(wireframer())
    .pipe(gulp.dest(paths.site));
});

// Process JS files
gulp.task('buildJs', function () {
  gulp.src(['**/*.js', '!gulpfile.js', '!node_modules/**', '!_site/**', '!framework/**'])
    .pipe(concat('javascripts.js'))
    .pipe(gulp.dest(paths.site));
});

// Copy all other assets over
gulp.task('copyFiles', function () {
  gulp.src(['**/*', '!**/*.html', '!**/*.js', '!{node_modules,node_modules/**}', '!{_site,_site/**}', '!{framework,framework/**}'])
    .pipe(gulp.dest(paths.site));
});

gulp.task('watch', function () {
  gulp.watch(['**/*.html', '!_site/**', '!node_modules/**'], ['buildTmps']);
  gulp.watch(['**/*.js', '!_site/**', '!node_modules/**'], ['buildJs']);
  gulp.watch(['**/*', '!**/*.js', '!**/*.html', '!_site/**', '!node_modules/**'], ['copyFiles']);
});

gulp.task('clean', function () {
  fs.removeSync(paths.site);
});

gulp.task('default', ['clean', 'buildTmps', 'buildJs', 'copyFiles', 'watch']);