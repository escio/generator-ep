'use strict';

var join = require('path').join;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var _ = require('lodash');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // setup the test-framework property, Gruntfile template will need this
    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.testFramework = this.options['test-framework'];

    this.option('coffee', {
      desc: 'Use CoffeeScript',
      type: Boolean,
      defaults: false
    });
    this.coffee = this.options.coffee;

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')());
      this.appname = this.appname.replace(/\s+/g, '.');
      this.log(chalk.white('Prosjektnavn vil være samme som foldername: '+ this.appname));
      this.log(chalk.magenta(
        'Basert på yo webapp generator lages nå oppsett for EP utvikling'+
        ' med CI funksjonalitet'
      ));
    }

    var prompts = [{
      type: 'list',
      name: 'styleframework',
      message: 'Velg rammeverk?',
      choices: [{
        name: 'Foundation',
        value: 'includeFoundation',
      },{
        name: 'Bootstrap',
        value: 'includeBootstrap',
      }]
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Hvilke features vil du ha med?',
      choices: [{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      },{
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      when: function (answers) {
        return answers && answers.features &&
          answers.features.indexOf('includeSass') !== -1;
      },
      type: 'confirm',
      name: 'libsass',
      value: 'includeLibSass',
      message: 'Would you like to use libsass? Read up more at \n' +
        chalk.green('https://github.com/andrew/node-sass#node-sass'),
      default: false
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;
      var styleframework = answers.styleframework;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      function hasFramework(feat) {
        return styleframework && styleframework.indexOf(feat) !== -1;
      }

      this.includeSass = hasFeature('includeSass');
      this.includeFoundation = hasFramework('includeFoundation');
      this.includeBootstrap = hasFramework('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.log('includeFoundation '+ this.includeFoundation);

      this.includeLibSass = answers.libsass;
      this.includeRubySass = !answers.libsass;

      done();
    }.bind(this));
  },

  secretJSON: function () {
    this.copy('secret.json', 'secret.json');
  },
  
  hostpathJSON: function () {
    this.template('scootr_ep_config.json', 'scootr_ep_config.json');
  },

  gruntfile: function () {
    this.template('Gruntfile.js', 'Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },


  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function () {
    var bower = {
      name: this._.slugify(this.appname),
      private: true,
      dependencies: {}
    };

    if(this.includeFoundation) {
      bower.dependencies.foundation = "zurb/bower-foundation#~5.4.7";
    }
    bower.dependencies.jquery = "~2.1.1";

    if (this.includeBootstrap) {
      var bs = 'bootstrap' + (this.includeSass ? '-sass-official' : '');
      bower.dependencies[bs] = "~3.2.0";
    }

    if (this.includeModernizr) {
      bower.dependencies.modernizr = "~2.8.2";
    }

    this.copy('bowerrc', '.bowerrc');
    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  mainStylesheet: function () {
    var css = 'main.' + (this.includeSass ? 's' : '') + 'css';
    this.template(css, 'app/styles/' + css);
  },

  writeIndex: function () {
    this.indexFile = this.engine(
      this.readFileAsString(join(this.sourceRoot(), 'index.html')),
      this
    );

    // wire Bootstrap plugins
    if (this.includeBootstrap && !this.includeSass) {
      var bs = 'bower_components/bootstrap/js/';

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/plugins.js',
        sourceFileList: [
          bs + 'affix.js',
          bs + 'alert.js',
          bs + 'dropdown.js',
          bs + 'tooltip.js',
          bs + 'modal.js',
          bs + 'transition.js',
          bs + 'button.js',
          bs + 'popover.js',
          bs + 'carousel.js',
          bs + 'scrollspy.js',
          bs + 'collapse.js',
          bs + 'tab.js'
        ],
        searchPath: '.'
      });
    }

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/main.js',
      sourceFileList: ['scripts/main.js'],
      searchPath: ['app', '.tmp']
    });
  },

  app: function () {
    this.directory('app');
    this.mkdir('app/scripts');
    this.mkdir('app/styles');
    this.mkdir('app/images');
    this.write('app/index.html', this.indexFile);

    if (this.coffee) {
      this.write(
        'app/scripts/main.coffee',
        'console.log "\'Allo from CoffeeScript!"'
      );
    }
    else {
      this.write('app/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
    }
  },
  eptemplates: function () {
    this.directory('ep');
    this.mkdir('ep/templates');
    this.mkdir('ep/templates/static');
    this.copy('sitemap.tpl', 'ep/templates/sitemap.tpl');
    this.copy('page-sitemap.tpl', 'ep/templates/page-sitemap.tpl');
    this.copy('head-metadata.tpl', 'ep/templates/head-metadata.tpl');
    this.copy('head-title.tpl', 'ep/templates/head-title.tpl');
    this.copy('static-css.tpl', 'ep/templates/static/static-css.tpl');
    this.copy('static-javascript.tpl', 'ep/templates/static/static-javascript.tpl');

  },

  install: function () {
    this.on('end', function () {
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          'coffee': this.options.coffee
        }
      });

      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  }
});
