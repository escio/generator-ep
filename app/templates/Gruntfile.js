// Generated on <%= (new Date).toISOString().split('T')[0] %> using
// <%= pkg.name %> <%= pkg.version %>
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  
  
  // Configurable paths
  var config = {
    app: 'app',
    server: 'dist',
    epDist: 'ep/www',
    ep: 'ep'
  };
  
  var sshprod = {
    username: 'aaa',
    password: 'bb',
    command: 'ls'
  };

  var secret = {
    username: 'bbb',
    password: 'bb'
  };

  try {
    secret = grunt.file.readJSON('secret.json');
  } catch ( error ) {
    console.log( 'Error reading secret.json' );
  }

  
  grunt.initConfig({
    
    ep_config : grunt.file.readJSON( 'scootr_ep_config.json' ),
    config : config,
    secret : secret,
    sshprod : sshprod,

    
    
    
    
    watch : { 
      js: {
        options: {
          spawn: false
        },
        files: ['<%%= config.app %>/scripts/{,**/}*.js'],
        tasks: ['jshint', 'concat', 'copy:concatScriptsDist', 'sftp:uploadStagingScripts' ] //Skipping uglify. For staging purposes       
      },
      images: {
          options: {
              spawn: false
          },
          files: ['<%%= config.app %>/images/{,*/}*.{png,jpg,gif}'],
          tasks: ['sftp:uploadStagingImages']
      },
      jstest: {
        files: ['test/spec/{,* /}*.js'],
        tasks: ['test:watch']
      },
      styles: {
        options: {
            spawn: false
        },
        files: ['<%%= config.app %>/styles/{,**/}*.{scss,sass,css}'],
        tasks: ['concurrent:styles', 'autoprefixer', 'concat', 'cssmin', 'sftp:uploadStagingStyles' ]
      },
      templates : {
        options: {
          spawn: false
        },
        files: ['<%%= config.ep %>/templates/{,**/}*.tpl',
                '<%%= config.ep %>/lib/**/*.php'],
        tasks: ['sftp:uploadStagingSingular', 'sshexec:staging']
      },
      modules : {
        options: {
          spawn: false
        },
        files: ['<%%= config.ep %>/lib/**/*.php'],
        tasks: ['sftp:uploadStagingSingular']       
      }
    },

   
    watchserver : {
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          '<%%= config.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      styles: {
        files: ['<%%= config.app %>/styles/{,*/}*.{scss,sass,css}'],
        tasks: ['concurrent:styles','autoprefixer'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['<%%= config.app %>/scripts/{,*/}*.js'],
        tasks: ['jshint', 'useminPrepare', 'concat']        
      }
    },


    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.',
            '.tmp',
            '<%%= config.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%%= config.app %>'
          ]
        }
      }
    },
    
    
    
    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= config.epDist %>/*',
            '!<%%= config.epDist %>/api',
            '!<%%= config.epDist %>/.git*'
          ]
        }]
      },
      server: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= config.server %>/*',
            '!<%%= config.server %>/.git*'
          ]
        }]
      }
    },



    //Karma test runner
    karma : {
      options : {
        configFile : 'karma.conf.js'
      },
      unit : {
        singleRun : true,
        autoWatch : true,
        background : true,
        browsers : ['Chrome', 'Firefox']
      },
      continuous : {
        singleRun : true,
        browsers: ['PhantomJS']
      }
    },
    
    
    
    
    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%%= config.app %>/scripts/**/*.js',
        '!<%%= config.app %>/scripts/vendor/**/*.js',
        'test/spec/{,*/}*.js'
      ]
    },
    

    
    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        //sourcemap: true,
        loadPath: ['bower_components']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.app %>/styles',
          src: ['*.{scss,sass}'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
      }
    },
    
    
    
    
    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    
    
    
    
    
    
    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%%= config.epDist %>'
      },
      html: '<%%= config.app %>/index.html'
    },   
    
    
    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
        dist: {
          files: [{
            expand: true,
            cwd: '<%%= config.app %>/images',
            src: '{,**/}*.{gif,jpeg,jpg,png}',
            dest: '<%%= config.epDist %>/images'
          }]
        }
      },

      svgmin: {
        dist: {
          files: [{
            expand: true,
            cwd: '<%%= config.app %>/images',
            src: '{,**/}*.svg',
            dest: '<%%= config.epDist %>/images'
          }]
        }
      },
    
      
      
      
      
      // Copies remaining files to places other tasks can use
      copy: {
        dist: {
          files: [{
            expand: true,
            dot: true,
            cwd: '<%%= config.app %>',
            dest: '<%%= config.epDist %>',
            src: [
              '*.{ico,png,txt}',
              'images/{,**/}*.webp',
              'styles/fonts/{,*/}*.*'
            ]
          }]
        },
        styles: {
          expand: true,
          dot: true,
          cwd: '<%%= config.app %>/styles',
          dest: '.tmp/styles/',
          src: '{,*/}*.css'
        },
        concatScriptsDist: {
          expand: true,
          dot: true,
          cwd: '.tmp/concat/scripts',
          dest: '<%%= config.epDist %>/scripts',
          src: '{,*/}*.js'
        }
      },


     
      // Run some tasks in parallel to speed up build process
    concurrent: {
      styles: [
        'sass:dist',
        'copy:styles'
      ],
      graphics: [
        'imagemin',
        'svgmin'
      ],
      dist: [
        'sass:dist',
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },
          
      
      //Sftp files up to server
      sftp:{
          uploadProduction:{
              options: {
                createDirectories: true,
                host: '<%%= ep_config.production.host %>',
                username: '<%%= sshprod.username %>',
                password: '<%%= sshprod.password %>',
                path: '<%%= sshprod.releasepath %>',
                srcBasePath: '<%%= config.ep %>/',
                showProgress: false
              },
              files:{'./':['<%%= config.ep %>/**/*']} 
            },
         uploadStagingSingular:{
              options: {
                host: '<%%= ep_config.staging.host %>',
                username: '<%%= secret.username %>',
                password: '<%%= secret.password %>',
                path: '<%%= ep_config.staging.remote_root_path %>',
                srcBasePath: '<%%= config.ep %>/',
                showProgress: true
              },
              files:{'./':'<%%= config.ep %>/templates/{,*/}*.tpl'} 
            },
          uploadStagingTemplates:{
            options: {
              host: '<%%= ep_config.staging.host %>',
              username: '<%%= secret.username %>',
              password: '<%%= secret.password %>',
              path: '<%%= ep_config.staging.remote_root_path %>',
              srcBasePath: '<%%= config.ep %>/',
              showProgress: true
            },
            files:{'./':'<%%= config.ep %>/templates/{,*/}*.tpl'} 
          },
          uploadStagingScripts:{
            options: {
              host: '<%%= ep_config.staging.host %>',
              username: '<%%= secret.username %>',
              password: '<%%= secret.password %>',
              path: '<%%= ep_config.staging.remote_root_path %>www',
              srcBasePath: '<%%= config.epDist %>/',
              showProgress: true,
              createDirectories: true,
            },
            files:{'./':'<%%= config.epDist %>/scripts/{,*/}*.js' } 
          },
          uploadStagingStyles:{
            options: {
              host: '<%%= ep_config.staging.host %>',
              username: '<%%= secret.username %>',
              password: '<%%= secret.password %>',
              path: '<%%= ep_config.staging.remote_root_path %>www',
              srcBasePath: '<%%= config.epDist %>/',
              showProgress: true,
              createDirectories: true,
            },
            files:{'./':'<%%= config.epDist %>/styles/{,*/}*.css' } 
          }
        }, 
        sshexec: {
          production: {
            //If there are more folders that need symlink, add below. F.eks api, lib, fonts and so on
            command: '<%%= sshprod.command%>',
            options: {
              host: '<%%= ep_config.production.host %>',
              username: '<%%= sshprod.username %>',
              password: '<%%= sshprod.password %>'
            }
          },
          staging: {
            command: ['echo "<%%= secret.password %>" | sudo -S chown -R :scootr-www <%%= ep_config.staging.remote_root_path %>/www/scripts',
                'echo "<%%= secret.password %>" | sudo -S chown -R :scootr-www <%%= ep_config.staging.remote_root_path %>/www/styles',
                'echo "<%%= secret.password %>" | sudo -S chown -R :scootr-www <%%= ep_config.staging.remote_root_path %>/templates'],
            options: {
              host: '<%%= ep_config.staging.host %>',
              username: '<%%= secret.username %>',
              password: '<%%= secret.password %>'
            }
          }
        } 
        
    
  });

  
  

  grunt.renameTask( 'watch', 'watchserver' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-karma' );
  
  
  grunt.event.on('watch', function(action, filepath ) {        
      console.log('File changed ' + filepath);
      var files = {'./':filepath};
      grunt.config('sftp.uploadStagingSingular.files', files);         
   });


  
  grunt.registerTask('serve', [
      'clean:server',
      'sass:dist',
      'copy:styles',
      'connect:livereload',
      'watchserver'
  ]);


  grunt.registerTask('test', [
    'karma:unit'
  ]);
  
  
  
  grunt.registerTask( 'ep-staging', function(){
    grunt.config('secret', grunt.file.readJSON('secret.json'));
    grunt.task.run([
      'clean:dist',         //Clean ep/www folder
      'useminPrepare', //Prepare concatenation, minifying and uglifying based on usemin-blocks in index.html
      'watch'               //Watch files in app folder. The watch task describes it further
    ]);
  });

  grunt.registerTask( 'ep-dist-build', '', function() {
    try {
      grunt.config('secret', grunt.file.readJSON('secret.json'));
    } catch ( error ) {

    }
    grunt.task.run([
      'clean:dist',         //Clean ep/www folder
      'useminPrepare',      //Prepare concatenation, minifying and uglifying based on usemin-blocks in index.html
      'sass:dist',
      'copy:styles',
      'imagemin',
      'svgmin',
      'autoprefixer',       //Vendor prefix for css-classes currently not supported natively
      'concat',             //Concatenate css and js files
      'cssmin',             //Minify css
      'uglify',             //Uglify js
      'copy:dist'           //Copy other files (.png, .ico, video files etc.) to ep/www folder
    ]);
  });
  


  grunt.registerTask('ep-staging-upload', 'Upload all files to staging', function() {
      grunt.config('secret', grunt.file.readJSON('secret.json'));
      grunt.task.run([
          'ep-dist-build',
          'sftp:uploadStagingTemplates',
          'sftp:uploadStagingScripts',
          'sftp:uploadStagingImages',
          'sftp:uploadStagingStyles'
      ]);
  });

  grunt.registerTask( 'ep-production-upload', 'Production deployment', function() {
    setProductionConfig();
    buildSymlinkCommand();
    grunt.task.run([
      'ep-dist-build',
      'sftp:uploadProduction',
      'sshexec:production'
    ]);
  } );

  grunt.registerTask( 'ep-prepare-symlink', 'Create symlink commands', function() {
    buildSymlinkCommand();
  } );

  function setProductionConfig() {
    var split = process.env.prodcredentials.split(':');
    var username = split[0];
    var password = split[1];
    var releasePath = grunt.config.get('ep_config.production.remote_root_path')+'scootr_releases/'+process.env.tag;
    grunt.config('sshprod.username', username);
    grunt.config('sshprod.password', password);
    grunt.config('sshprod.releasepath', releasePath);
  }

  function buildSymlinkCommand() {
    var symlinkCommand = ['echo "<%%= sshprod.password %>" | sudo -S chown -R :scootr-www <%%= sshprod.releasepath %>',
                'ln -sfn <%%= sshprod.releasepath %>/www/styles <%%= ep_config.production.remote_root_path %>www/styles',
                'ln -sfn <%%= sshprod.releasepath %>/www/images <%%= ep_config.production.remote_root_path %>www/images',
                'ln -sfn <%%= sshprod.releasepath %>/www/scripts <%%= ep_config.production.remote_root_path %>www/scripts',
                'ln -sfn <%%= sshprod.releasepath %>/templates <%%= ep_config.production.remote_root_path %>templates'
                ];
    if(grunt.file.exists(grunt.config.get('config.ep')+'/lib')) {
      symlinkCommand.push('ln -sfn <%%= sshprod.releasepath %>/lib <%%= ep_config.production.remote_root_path %>lib');
    }
    if(grunt.file.exists(grunt.config.get('config.ep')+'/www/api')) {
      symlinkCommand.push('ln -sfn <%%= sshprod.releasepath %>/www/api <%%= ep_config.production.remote_root_path %>www/api');
    }
    if(grunt.file.exists(grunt.config.get('config.ep')+'/www/fonts')) {
      symlinkCommand.push('ln -sfn <%%= sshprod.releasepath %>/www/fonts <%%= ep_config.production.remote_root_path %>www/fonts');
    }
    grunt.config('sshprod.command', symlinkCommand);
  }
  
};
  