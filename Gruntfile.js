module.exports = function(grunt) {
	//require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		babel: {
			options: {
				presets: ['es2015', 'react']
			},
			dist: {
				src: "build/<%= pkg.name %>.js",
				dest: "build/<%= pkg.name %>.js"
			}
		},
		concat: {
			options:{},
			dist:{
				src: [
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
					"src/libraryUi/widgets/reactsrc/*",
					"src/_zoteroLibraryUrl.js",
					"src/zoteroPages.js",
				],
				dest: "build/<%= pkg.name %>.js"
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		less: {
			dist: {
				options: {
					//paths: ["static/css/reactComponentCSS"],
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
				},
				src:"static/css/zotero-web-library.less",
				dest:"static/css/zotero-web-library.css",
			}
		},
	});

	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-concat');
	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');

	// Default task(s).
	grunt.registerTask('default', ['concat', 'babel', 'uglify', "less"]);

};