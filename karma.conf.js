module.exports = function(config) {
  config.set({
    files: [
      'test/spec/*.spec.js'
    ],
    frameworks: ['browserify','mocha','chai'],
    preprocessors: {
      'test/spec/*.js': ['browserify']
    },
    browsers: ['PhantomJS'],
    reporters: ['mocha'],
    browserify: {
      debug: true, // output source maps
      transform: [ 'babelify' ]
    }
  });
};