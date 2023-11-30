import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import CopyPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import path from 'path';
import baseConfig from './webpack.base';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const globAll = require('glob-all');

const prodConfig: Configuration = merge(baseConfig, {
	mode: 'production', // 生产模式,会开启tree-shaking和压缩代码,以及其他优化，
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, '../public'),
					to: path.resolve(__dirname, '../dist'),
					filter: (source) => !source.includes('index.html') // 忽略index.html
				}
			]
		}),
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].[contenthash:8].css' // 抽离css的输出目录和名称
		}),
		// 清理无用css
		new PurgeCSSPlugin({
			paths: globAll.sync([`${path.join(__dirname, '../src')}/**/*`, path.join(__dirname, '../public/index.html')], {
				nodir: true
			}),
			// 指定purgecss-webpack-plugin 的入口
			only: ['dist'],
			safelist: {
				standard: [/^ant-/] // 过滤以ant-开头的类名，哪怕没用到也不删除
			}
		}),
		new CompressionPlugin({
			test: /\.(js|css)$/, // 只生成css,js压缩文件
			filename: '[path][base].gz', // 文件命名
			algorithm: 'gzip', // 压缩格式,默认是gzip
			threshold: 10240, // 只有大小大于该值的资源会被处理。默认值是 10k
			minRatio: 0.8 // 压缩率,默认值是 0.8
		})
	],
	optimization: {
		runtimeChunk: {
			name: 'mainifels'
		},
		minimize: true,
		minimizer: [
			new CssMinimizerPlugin(), // 压缩css
			new TerserPlugin({
				parallel: true, // 开启多线程压缩
				terserOptions: {
					compress: {
						pure_funcs: ['console.log'] // 删除console.log
					}
				}
			})
		],
		// 代码分割
		splitChunks: {
			cacheGroups: {
				// 提取node_modules
				vendors: {
					test: /node_modules/, // 只匹配node_modules里面的模块
					name: 'vendors', // 提取文件命名为vendors,js后缀和chunkhash会自动加
					minChunks: 1, // 只要使用一次就提取出来
					chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
					minSize: 0, // 提取代码体积大于0就提取出来
					priority: 1 // 提取优先级为1
				},
				// 提取页面公共代码
				commons: {
					name: 'commons', // 提取文件命名为commons
					minChunks: 2, // 只要使用两次就提取出来
					chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
					minSize: 0 // 提取代码体积大于0就提取出来
				}
			}
		}
	},
	performance: {
		hints: false,
		maxAssetSize: 4000000, // 整数类型（以字节为单位）
		maxEntrypointSize: 5000000 // 整数类型（以字节为单位）
	}
});

export default prodConfig;
