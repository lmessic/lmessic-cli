import { Configuration, DefinePlugin } from 'webpack';
import * as dotenv from 'dotenv';
import WebpackBar from 'webpackbar';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development'; // 是否是开发模式

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const lessRegex = /\.less$/;
const stylRegex = /\.styl$/;
const imageRegex = /\.(png|jpe?g|gif|svg)$/i;
const fontRegex = /.(woff2?|eot|ttf|otf)$/;
const mediaRegex = /.(mp4|webm|ogg|mp3|wav|flac|aac)$/;
const jsonRegex = /\.json$/;

const styleLoadersArray = [
	isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
	{
		loader: 'css-loader',
		options: {
			modules: {
				localIdentName: '[path][name]__[local]--[hash:5]'
			}
		}
	},
	'postcss-loader'
];

console.log('NODE_ENV', process.env.NODE_ENV);
console.log('BASE_ENV', process.env.BASE_ENV);

// 加载配置文件
const envConfig = dotenv.config({
	path: path.resolve(__dirname, `../env/.env.${process.env.BASE_ENV}`)
});

const baseConfig: Configuration = {
	entry: path.join(__dirname, '../src/index.tsx'), // 入口文件
	// 打包出口文件
	output: {
		filename: 'static/js/[name].[chunkhash:8].js', // 每个输出js的名称
		path: path.join(__dirname, '../dist'), // 打包结果输出路径
		clean: true, // webpack4需要配置clean-webpack-plugin来删除dist文件,webpack5内置了
		publicPath: '/', // 打包后文件的公共前缀路径
		assetModuleFilename: 'images/[hash][ext][query]'
	},
	// loader 配置
	module: {
		rules: [
			{
				test: /.(ts|tsx)$/,
				exclude: /node_modules/, // 不解析模块
				use: ['thread-loader', 'babel-loader']
			},
			{
				test: /.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: cssRegex, // 匹配 css 文件
				use: styleLoadersArray
			},
			{
				test: lessRegex,
				use: [
					...styleLoadersArray,
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								importLoaders: 2,
								modules: true,
								// 如果要在less中写类型js的语法，需要加这一个配置
								javascriptEnabled: true
							}
						}
					}
				]
			},
			{
				test: sassRegex,
				use: [...styleLoadersArray, 'sass-loader']
			},
			{
				test: stylRegex,
				use: [...styleLoadersArray, 'stylus-loader']
			},
			{
				test: imageRegex, // 匹配图片文件
				type: 'asset',
				parser: {
					dataUrlCondition: {
						maxSize: 20 * 1024 // 小于10kb转base64
					}
				},
				generator: {
					filename: 'static/images/[name].[contenthash:8][ext]' // 文件输出目录和命名
				}
			},
			{
				test: fontRegex, // 匹配字体图标文件
				type: 'asset', // type选择asset
				parser: {
					dataUrlCondition: {
						maxSize: 10 * 1024 // 小于10kb转base64
					}
				},
				generator: {
					filename: 'static/fonts/[name].[contenthash:8][ext]' // 文件输出目录和命名
				}
			},
			{
				test: mediaRegex, // 匹配媒体文件
				type: 'asset', // type选择asset
				parser: {
					dataUrlCondition: {
						maxSize: 10 * 1024 // 小于10kb转base64
					}
				},
				generator: {
					filename: 'static/media/[name].[contenthash:8][ext]' // 文件输出目录和命名
				}
			},
			{
				// 匹配json文件
				test: jsonRegex,
				type: 'asset/resource', // 将json文件视为文件类型
				generator: {
					// 这里专门针对json文件的处理
					filename: 'static/json/[name].[hash][ext][query]'
				}
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js'],
		alias: {
			'@': path.join(__dirname, '../src')
		},
		modules: [path.resolve(__dirname, 'src'), 'node_modules']
	},
	// plugins 的配置
	plugins: [
		new HtmlWebpackPlugin({
			title: 'webpack5-react-ts',
			filename: 'index.html',
			template: path.join(__dirname, '../public/index.html'),
			inject: true, // 自动注入静态资源
			hash: true,
			cache: false,
			minify: {
				collapseWhitespace: true,
				removeComments: true,
				minifyJS: true, // 在脚本元素和事件属性中缩小JavaScript(使用UglifyJS)
				minifyCSS: true // 缩小CSS样式元素和样式属性
			},
			nodeModules: path.resolve(__dirname, '../node_modules')
		}),
		new DefinePlugin({
			'process.env': JSON.stringify(envConfig.parsed),
			'process.env.BASE_ENV': JSON.stringify(process.env.BASE_ENV),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		}),
		new WebpackBar({
			color: '#85d', // 默认green，进度条颜色支持HEX
			basic: false, // 默认true，启用一个简单的日志报告器
			profile: false // 默认false，启用探查器。
		})
	].filter(Boolean),
	cache: {
		type: 'filesystem' // 使用文件缓存
	}
};

export default baseConfig;
