var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var compass = require('gulp-compass');
var livereload = require('gulp-livereload');
var minifyCSS = require('gulp-minify-css');
var concatCSS = require('gulp-concat-css');
var child = require('child_process');
var fs = require('fs');

// Start the default task
gulp.task('default', ['server','watch','js']);

gulp.task('server', function() {
  var server = child.spawn('node', ['./bin/www']);
  var log = fs.createWriteStream('server.log', { flags: 'a' });
  server.stdout.pipe(log);
  server.stderr.pipe(log);
});

gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('./public/stylesheets/*.scss', ['compass']);
});

gulp.task('compass', function() {
	gulp.src('./public/stylesheets/*.scss')
		.pipe(compass({
			css: './public/stylesheets',
			sass: './public/stylesheets'
		}))
		.pipe(gulp.dest('./public/stylesheets'))

	gulp.src('./public/stylesheets/*.css')
		.pipe(concatCSS("bundle.css"))
		.pipe(minifyCSS())
		.pipe(gulp.dest('./dist'))
		.pipe(livereload());
});

var bundler = watchify(browserify('./public/javascripts/app.js', watchify.args));
bundler.transform('brfs');

gulp.task('js', bundle)
bundler.on('update', bundle);
bundler.on('log', gutil.log);

function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))

      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
    
    .pipe(gulp.dest('./dist'));
}