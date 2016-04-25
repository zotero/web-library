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
var b = watchify(browserify(opts)); 

b.transform('babelify', {
	presets: ['es2015', 'react'],
	plugins: ['transform-flow-strip-types']
});

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
	return b.bundle()
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








/*
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const replace = require('gulp-replace-task');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const filter = require('gulp-filter');
const autoprefixer = require('gulp-autoprefixer');
const less = require('gulp-less');

const sources = [
	"library/libZoteroJS/build/libzoterojs.js",
	"src/_zoterowwwInit.js",
	"src/State.js",
	"src/Delay.js",
	"src/libraryUi/eventful.js",
	"src/libraryUi/format.js",
	"src/libraryUi/init.js",
	"src/libraryUi/misc.js",
	"src/libraryUi/readstate.js",
	"src/libraryUi/render.js",
	"src/libraryUi/updatestate.js",
	"src/libraryUi/bootstrapdialogs.js",
	"src/libraryUi/widgets/citeitemdialog.js",
	"src/libraryUi/widgets/feedlink.js",
	"src/libraryUi/widgets/groups.js",
	"src/libraryUi/widgets/groupsList.js",
	"src/libraryUi/widgets/inviteToGroup.js",
	"src/libraryUi/widgets/recentItems.js",
	"src/libraryUi/widgets/itemContainer.js",
	"src/libraryUi/widgets/librarysettingsdialog.js",
	"src/libraryUi/widgets/libraryPreloader.js",
	"src/libraryUi/widgets/progressModal.js",
	"src/libraryUi/widgets/panelContainer.js",
	"src/libraryUi/widgets/chooseSortingDialog.js",
	"src/libraryUi/widgets/imagePreview.js",
	"src/libraryUi/widgets/imageGrabber.js",
	"src/libraryUi/widgets/localItems.js",
	"src/libraryUi/widgets/siteSearch.js",
	"src/libraryUi/widgets/publications.js",
	"node_modules/floatthead/dist/jquery.floatThead.js",
	"src/libraryUi/widgets/reactsrc/*",
	"src/_zoteroLibraryUrl.js",
	"src/zoteroPages.js",
];

function onError(err) {
	console.warn(err);
}

gulp.task('build', function() {
	return gulp.src(sources)
		.pipe(plumber({errorHandler: onError}))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(babel({
			presets:  ['es2015', 'react']
		}))
		.pipe(concat('zotero-web-library.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build'))
		.pipe(filter('*.js'))
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		// .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build'));
});

gulp.task('less', function() {
	gulp.src('./static/css/zotero-web-library.less')
	.pipe(less())
	.pipe(autoprefixer({
		browsers: ['last 2 versions']
	}))
	.pipe(gulp.dest('./static/css/'));
});

gulp.task('default', ['less', 'build']);
*/
