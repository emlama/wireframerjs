var gulp        = require('gulp'),
    watch       = require('gulp-watch'),
    wireframer  = require('../bin/wireframer'),
    gulpFilter  = require('gulp-filter'),
    concat      = require('gulp-concat'),
    fs          = require('fs-extra'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    merge       = require('merge-stream');

var paths = {
  site: "_site/"
};

// browser-sync task for starting the server.
gulp.task('browser-sync', ['buildJs', 'copyFiles', 'buildTmps', 'copyFramework'], function() {
  browserSync({
    // proxy: "goang-responsive.dev"
    server: {
      baseDir: paths.site
    }
  });
});

// Process JS files
gulp.task('buildJs', function () {
  return gulp.src(['**/*.js', '!gulpfile.js', '!node_modules/**', '!_site/**', '!framework/**'])
    .pipe(concat('javascripts.js'))
    .pipe(gulp.dest(paths.site));
});

// Copy all other assets over
gulp.task('copyFiles', function () {
  return gulp.src(['**/*', '!**/*.html', '!**/*.js', '!{node_modules,node_modules/**}', '!{_site,_site/**}', '!{framework,framework/**}'])
    .pipe(gulp.dest(paths.site));
});

// Copy all other assets over
gulp.task('copyFramework', function () {
  var htmls = gulp.src(['framework/html/index.html', 'framework/html/iframe.html', ])
    .pipe(gulp.dest(paths.site));

  var styles = gulp.src(['framework/stylesheets/app.css', 'framework/stylesheets/normalize.css'])
    .pipe(gulp.dest(paths.site + 'framework/stylesheets'));

  var bower = gulp.src(['framework/bower_components/**/*'])
    .pipe(gulp.dest(paths.site + 'framework/bower_components'));

  var js = gulp.src(['framework/js/**/*'])
    .pipe(gulp.dest(paths.site + 'framework/js'));

  return merge(htmls, styles, bower, js);
});

// Define _site folder
// ignore _site folder! https://github.com/robrich/gulp-ignore
// Process html files
gulp.task('buildTmps', function () {
  return gulp.src(['**/*.html', '!node_modules/**', '!_site/**', '!framework/**'])
    .pipe(concat('templates.js'))
    .pipe(wireframer())
    .pipe(gulp.dest(paths.site));
});

// https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-tasks-in-series.md
gulp.task('clean', function (cb) {
  fs.removeSync(paths.site);
  cb();
});

gulp.task('default', ['clean', 'buildJs', 'copyFiles', 'buildTmps', 'copyFramework', 'browser-sync'], function () {
  gulp.watch(['**/*.html', '!./_site/**', '!node_modules/**'], ['buildTmps']);
  gulp.watch(['**/*.js', '!_site/**', '!node_modules/**'], ['buildJs']);
  gulp.watch(['**/*', '!**/*.js', '!**/*.html', '!_site/**', '!node_modules/**'], ['copyFiles']);
});