module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['bower_components/jquery/dist/jquery.js',
                    'bower_components/handlebars/handlebars.js',
                    'src/nextprot.js',
                    'dist/compiled-templates.js',
                    'src/nextprot-templates.js'],
                dest: 'demo/app.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['src/nextprot.js',
                    'src/nextprot-templates.js',
                    'dist/compiled-templates.js'],
                dest: 'dist/nextprot.min.js'
            }
        },
        qunit: {
            all: {
                options: {
                    urls: [
                        'http://localhost:9000/test/index.html'
                    ]
                }
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
                    port: 9000,
                    livereload: true,
                    base: '.'
                }
            }
        },
        watch: {
            all: {
                options: {livereload: true},
                files: ['*.js']
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


    // Default task(s).
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('test', ['connect:server','qunit']);
    grunt.registerTask('concating', ['concat']);
    grunt.registerTask('hbs', ['handlebars:compile']);
    grunt.registerTask('serve', ['connect:server', 'watch']);
};
