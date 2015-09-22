module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';\n'
            },
            basic: {
                src: ['vendor/js/es5-shim.min.js', //support for promises in IE lower than ie 9
                    'vendor/js/promise-6.1.0.js', //support for promises in IE
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/handlebars/handlebars.js',
                    'src/nextprot.js',
                    'src/nextprot-utils.js',
                    'src/nextprot-templates.js',
                    'dist/compiled-templates.js'],
                dest: 'dist/nextprot.bundle.js'
            },
            extras: {
                src: ['src/nextprot.js'],
                dest: 'dist/nextprot.js'
            }

        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['src/nextprot.js'],
                dest: 'dist/nextprot.min.js'
            }
        },
        jshint: {
            files: ['src/nextprot.js'], //would be great to do this: files: ['src/**/*.js', 'test/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        qunit: {
            all: 'test/index.html',
            options: {
                timeout: 80000,
                console: true
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'https://github.com/calipho-sib/nextprot-js.git',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },
        connect: {
            server: {
                options: {
                    port: 5000,
                    livereload: true,
                    base: '.'
                }
            }
        },
        watch: {
            all: {
                options: {
                    livereload: true
                },
                files: ['src/*.js'],
                tasks: 'concat'
            },
            handlebars: {
                files: 'templates/*.tmpl',
                tasks: ['handlebars:compile']
            }
        },
        handlebars: {
            compile: {
                src: 'templates/*.tmpl',
                dest: 'dist/compiled-templates.js',
                options: {
                    namespace: "HBtemplates"
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // Default task(s).
    grunt.registerTask('default', ['uglify', 'jshint']);
    grunt.registerTask('test', ['qunit']);
    grunt.registerTask('concating', ['concat']);
    grunt.registerTask('hbs', ['handlebars:compile']);
    grunt.registerTask('serve', ['connect:server', 'watch']);
};