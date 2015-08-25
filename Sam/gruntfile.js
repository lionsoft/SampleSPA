/// <binding />
/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.initConfig({

        "bower": {
            "install": {
                "options": {
                    targetDir: "wwwroot/lib",
                    layout: "byComponent",
                    cleanTargetDir: false
                }
            }
        },
        
        "less": {
            "development": {
                "options": {
                    "compress": false,
                    "optimization": 2
                },
                "files": {
                    "app/css/test.css": "app/**/*.less" // destination file and source file
                }
            }
        },

        "watch": {
            "styles": {
                "files": ['app/**/*.less'], // which files to watch
                "tasks": ['less'],
                "options": {
                    //"nospawn": true
                    "livereload": true
                }
            }
        },
    });

    grunt.registerTask("bowel", ["bower:install"]);
    grunt.registerTask("less-compile", ["less"]);

    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-watch");
};