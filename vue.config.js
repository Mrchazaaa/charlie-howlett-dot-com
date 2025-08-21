const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default;

// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    devtool: "source-map",
    plugins: [
      ...(process.env.BUILD_STATS
        ? [
            new StatoscopeWebpackPlugin({
              saveReportTo: 'dist/statoscope.html',
              saveStatsTo: 'dist/statoscope-webpack-stats.json',
              normalizeStats: true,
              open: 'false'
            }),
          ]
        : []),
    ],
  },
  css: {
    extract: {
      filename: "[name].css",
      chunkFilename: "[name].css",
    },
  },
});
