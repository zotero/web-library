'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');

// add custom browserify options here
var customOpts = {
	entries: ['./src/zotero-web-library.js'],
	debug: true
};
var opts = assign({}, watchify.args, customOpts);
var wb = watchify(browserify(opts)); 
var bb = browserify(opts);

var babelifyOpts = {
	presets: ['es2015', 'react'],
	plugins: ['transform-flow-strip-types']
};

wb.transform('babelify', babelifyOpts);
bb.transform('babelify', babelifyOpts);

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js', wbundle); // so you can run `gulp js` to build the file
wb.on('update', wbundle); // on any dep update, runs the bundler
wb.on('log', gutil.log); // output build logs to terminal

function wbundle() {
	return wb.bundle()
		// log errors if they happen
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('zotero-web-library.js'))
		// optional, remove if you don't need to buffer file contents
		.pipe(buffer())
		// optional, remove if you dont want sourcemaps
		.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		// Add transformation tasks to the pipeline here.
		.pipe(sourcemaps.write('./')) // writes .map file
		.pipe(gulp.dest('./build'))
		// repeat for minified version
		.pipe(filter('*.js'))
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		// .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build'));
}


function bbundle() {
	return bb.bundle()
		// log errors if they happen
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('zotero-web-library.js'))
		// optional, remove if you don't need to buffer file contents
		.pipe(buffer())
		// optional, remove if you dont want sourcemaps
		.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		// Add transformation tasks to the pipeline here.
		.pipe(sourcemaps.write('./')) // writes .map file
		.pipe(gulp.dest('./build'))
		// repeat for minified version
		.pipe(filter('*.js'))
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		// .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build'));
}

gulp.task('less', function() {
	gulp.src('./static/css/zotero-web-library.less')
	.pipe(less())
	.pipe(autoprefixer({
		browsers: ['last 2 versions']
	}))
	.pipe(gulp.dest('./static/css/'));
});

gulp.task('build', bbundle);

gulp.task('default', ['less', 'build']);
