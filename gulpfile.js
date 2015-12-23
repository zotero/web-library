'use strict';

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
]

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