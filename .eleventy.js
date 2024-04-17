module.exports = function (eleventyConfig) {
    eleventyConfig.setBrowserSyncConfig({
      files: './public/static/**/*.css',
    });
  
    return {
      dir: {
        input: 'src',
        output: 'public',
      },
    };
  };