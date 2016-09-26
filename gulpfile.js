'use strict';

const watchify = require('watchify');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const cssminify = require('gulp-minify-css');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const runSequence = require('run-sequence');
const del = require('del');
const sass = require('gulp-sass');
const babelify = require('babelify');
const connect = require('gulp-connect');

function onError(err) {
	gutil.log(gutil.colors.red('Error:'), err);
	this.emit('end');
}

function onSuccess(msg) {
	gutil.log(gutil.colors.green('Build:'), msg);
}

function getBrowserify(dev) {
	return browserify({
		debug: dev,
		entries: './src/js/zotero-web-library.js',
		cache: {},
		packageCache: {}
	}).transform(
		babelify, 
		{ extensions: ['.js', '.jsx'] }
	);
}

function getJSBundle(dev, browserifyObject) {
	return browserifyObject.bundle()
		.on('error', onError)
		.pipe(source('zotero-web-library.js'))
		.pipe(buffer())
		.pipe(gulpif(dev, sourcemaps.init({loadMaps: true})))
		.pipe(gulpif(!dev, gulp.dest('./build')))
		.pipe(gulpif(!dev, uglify()))
		.pipe(gulpif(!dev, rename({ extname: '.min.js' })))
		.pipe(gulpif(dev, sourcemaps.write('./')))
		.pipe(gulp.dest('./build'));
}

function getJS(dev) {
	var browserifyObject = getBrowserify(dev);

	if(dev) {
		browserifyObject.plugin(watchify);
		browserifyObject.on('update', () => {
			return getJSBundle(dev, browserifyObject);
		});
	}

	browserifyObject.on('log', onSuccess);
	return getJSBundle(dev, browserifyObject);
}

function getSass(dev) {
	return gulp.src('./src/scss/zotero-web-library.scss')
		.pipe(plumber({errorHandler: onError}))
		.pipe(gulpif(dev, sourcemaps.init({loadMaps: true})))
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'IE 10']
		}))
		.pipe(gulpif(!dev, gulp.dest('./build')))
		.pipe(gulpif(!dev, cssminify()))
		.pipe(gulpif(!dev, rename({ extname: '.min.css' })))
		.pipe(gulpif(dev, sourcemaps.write('./')))
		.pipe(gulp.dest('./build'));
}

function getHtml() {
	return gulp.src('./src/demo/*.html')
		.pipe(gulp.dest('./build/'))
}

gulp.task('clean:build', () => {
	return del('./build');
});

gulp.task('clean:prepublish', () => {
	return del(['./lib', './sass']);
});

gulp.task('sass', () => {
	return getSass(true);
});

gulp.task('js', () => {
	return getJS(true);
});

gulp.task('html', () => {
	return getHtml();
});

gulp.task('dev', ['clean:build'], () => {
	connect.server({
		root: 'build',
		port: 8001,
		livereload: true
	});

	gulp.watch('./src/scss/**/*.scss', ['sass']);
	gulp.watch('./src/demo/*.html', ['html']);
	return merge(
		getSass(true),
		getJS(true),
		getHtml()
	);
});

gulp.task('build', ['clean:build'], () => {
	return merge(getSass(false), getJS(false));
});

gulp.task('prepublish:js', () => {
	return gulp.src('./src/js/**/*.js*')
			.pipe(babel())
			.pipe(gulp.dest('./lib/'));
});

gulp.task('prepublish:sass', () => {
	return gulp.src('./src/scss/**/*.scss')
		.pipe(gulp.dest('./sass/'));
});

gulp.task('prepublish', ['clean:prepublish'], (done) => {
	return runSequence('prepublish:js', 'prepublish:sass', 'build', done);
});

gulp.task('postpublish', ['clean:prepublish']);
gulp.task('default', ['dev']);
