module.exports = {
  outputDir: '../www',
  publicPath: './',
  chainWebpack: config => {
    config.module
      .rule('typescript')
      .test(/\.ts$/)
      .use('ts-loader')
      .loader('ts-loader')
      .end();
  }
};
