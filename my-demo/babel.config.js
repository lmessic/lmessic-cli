const isDEV = process.env.NODE_ENV === 'development'; // 是否是开发模式

module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: { browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'] },
				useBuiltIns: 'usage',
				corejs: 3,
				loose: true
			}
		],
		['@babel/preset-react', { runtime: 'automatic' }],
		'@babel/preset-typescript'
	],
	plugins: [
		['@babel/plugin-proposal-decorators', { legacy: true }],
		isDEV && require.resolve('react-refresh/babel') // 如果是开发模式,就启动react热更新插件
	].filter(Boolean) // 过滤空值
};
