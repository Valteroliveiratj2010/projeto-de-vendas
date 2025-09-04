const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyze = env && env.analyze;

  return {
    entry: {
      main: './public/js/main.js',
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      chunkFilename: isProduction ? 'js/[name].[contenthash].chunk.js' : 'js/[name].chunk.js',
      publicPath: '/',
      clean: true,
    },

    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead']
                  },
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: !isProduction
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProduction,
                postcssOptions: {
                  plugins: [
                    'autoprefixer',
                    isProduction && 'cssnano'
                  ].filter(Boolean)
                }
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]'
          },
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8kb
            }
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]'
          }
        }
      ]
    },

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log'] : []
            },
            mangle: isProduction,
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: isProduction
              }
            ]
          }
        })
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true
          },
          shared: {
            test: /[\\/]public[\\/]js[\\/]shared[\\/]/,
            name: 'shared',
            chunks: 'all',
            priority: 8,
            reuseExistingChunk: true
          },
          pages: {
            test: /[\\/]public[\\/]js[\\/]pages[\\/]/,
            name: 'pages',
            chunks: 'all',
            priority: 6,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 1,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single'
    },

    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        } : false,
        meta: {
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
          'theme-color': '#007bff'
        }
      }),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].[contenthash].css' : 'css/[name].css',
        chunkFilename: isProduction ? 'css/[name].[contenthash].chunk.css' : 'css/[name].chunk.css'
      }),
      isProduction && new CompressionPlugin({
        test: /\.(js|css|html|svg)$/,
        algorithm: 'gzip',
        threshold: 10240,
        minRatio: 0.8
      }),
      analyze && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-analysis.html'
      })
    ].filter(Boolean),

    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'public/js'),
        '@shared': path.resolve(__dirname, 'public/js/shared'),
        '@modules': path.resolve(__dirname, 'public/js/modules'),
        '@pages': path.resolve(__dirname, 'public/js/pages'),
        '@css': path.resolve(__dirname, 'public/css'),
        '@utils': path.resolve(__dirname, 'public/js/utils'),
        '@libs': path.resolve(__dirname, 'public/js/libs')
      }
    },

    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      }
    },

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },

    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    }
  };
}; 