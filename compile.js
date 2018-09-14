import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import { cdn, assetsSubDir } from './config'

const pathResolve = (...dir) => path.resolve.apply(null, [__dirname, ...dir])

// 是否开发环境
const dev = process.argv.slice(2).some((item, index, arr) => {
  return /^--mode=dev$/.test(item)
})

// 模式
const mode = dev ? 'development' : 'production'

// 入口
const entry = { app: ['babel-polyfill', pathResolve('src/js/index.js')] }

// 输出
const output = {
  path: pathResolve('dist'),
  filename: `${assetsSubDir}/js/[name].${dev ? '' : '[chunkhash:10].'}js`,
  chunkFilename: `${assetsSubDir}/js/[name].${dev ? '' : '[chunkhash:10].'}js`,
  publicPath: dev ? './' : cdn
}

// 模块
const module = {
  rules: [{
    test: /\.jsx?$/,
    include: [pathResolve('src')],
    loader: 'babel-loader',
    options: {
      presets: ['env'],
      plugins: ['transform-runtime']
    }
  }, {
    test: /\.(le|c)ss$/,
    include: [pathResolve('src', 'css')],
    use: [ MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader' ]
  }, {
    test: /\.(jpe?g|png|gif|svg|ico)$/,
    include: [pathResolve('src', 'img')],
    loader: 'url-loader',
    options: {
      fallback: 'file-loader',
      outputPath: `${assetsSubDir}/img`,
      name: `[name].${!dev ? '[hash:10].' : ''}[ext]`,
      limit: 3 * 1024,
    }
  }, {
    test: /\.(eot|svg|ttf|woff)$/, 
    include: [pathResolve('src', 'font')],
    loader: 'url-loader',
    options: {
      fallback: 'file-loader',
      outputPath: `${assetsSubDir}/font`,
      name: `[name].${!dev ? '[hash:10].' : ''}[ext]`,
      limit: 3 * 1024,
    }
  }, {
    test: /\.html?$/, 
    include: [pathResolve('src')],
    loader: 'html-loader'
  }]
}

// 解析
const resolve = {
  extensions: ['.js', '.json', '.css', '.less'],
  alias: {
    'src': pathResolve('src'),      
    'js': pathResolve('src', 'js'),
    'img': pathResolve('src', 'img'),
    'css': pathResolve('src', 'css'),
    'media': pathResolve('src', 'media'),
    'font': pathResolve('src', 'font'),
    '@': pathResolve(__dirname)   
  },
  modules: [pathResolve('src'), pathResolve('node_modules')]
}

// devtool
const devtool = dev ? 'cheap-module-eval-source-map' : 'cheap-module-source-map'

// 插件
const plugins = [
  new CleanWebpackPlugin(pathResolve('dist')),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: pathResolve('src', 'index.html'),
    hash: dev,
    chunksSortMode: 'dependency',
    minify: {
      collapseWhitespace: false, // 合并空格，默认false
      collapseBooleanAttributes: true, // 省略布尔属性，默认false
      keepClosingSlash: true, // 单标签元素保留斜杠，默认false
      quoteCharacter: '\'', // 使用单引号还是双引号，默认双引号
      removeAttributeQuotes: false, // 删除属性的引号，默认false
      removeComments: false, // 删除HTML注释，默认false
      removeEmptyAttributes: false, // 删除空的属性，默认false
      removeRedundantAttributes: true, // 删除默认的属性，默认false
      removeScriptTypeAttributes: true, // 删除script的type默认属性，默认false
      removeStyleLinkTypeAttributes: true, // 删除style和link的type默认属性，默认false
      sortAttributes: true, // 按频率排序属性，默认false
      sortClassName: true, // 按频率排序class，默认false
      useShortDoctype: true // 使用HTML5的Doctype，默认false
    }
  }), // 创建HTML
  new MiniCssExtractPlugin({
    filename: `${assetsSubDir}/css/[name].${!dev ? '[hash:10].' : ''}css`,
    chunkFilename: `${assetsSubDir}/css/[name].${!dev ? '[hash:10].' : ''}css`
  }) // 提取CSS
]

// devServer
const devServer = {
  contentBase: pathResolve('dist'), // 根目录
  host: 'liuyuanquan.com', // host
  compress: true, // 启用gzip，默认false
  https: true, // 启用https，默认false
  port: 80, // 端口
  hot: true, // HMR
  open: 'Google Chrome', // 开启时，打开chrome
  openPage: 'index.html', // 打开页面
  useLocalIp: false, // 使用本地ip
  disableHostCheck: true, // 不进行域名校验，默认为false
  publicPath: '/',
  proxy: {

  }, // 代理
  headers: {

  } // header
}

// optimization
const optimization = {
  splitChunks: {
    chunks: 'initial',
    cacheGroups: {
      vendor: {
        test: /node_modules\//,
        name: 'vendor',
        priority: 10,
        enforce: true
      }
    }
  },
  runtimeChunk: {
    name: 'manifest'
  }
}

const baseConfig = { mode, entry, output, module, resolve, devtool, context: __dirname, plugins, optimization }

const devConfig = { 
  devServer,
  plugins: [
    new webpack.HotModuleReplacementPlugin() // 热替换
  ]
}

const prodConfig = {
  plugins: [
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css$/,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { 
        safe: true, 
        discardComments: { 
          removeAll: true 
        },
        autoprefixer: false // 使用postcss的autoprefixer功能，必须为false
      },
      canPrint: true
    }) // 压缩CSS
  ]
}

const compiler = webpack(merge(baseConfig, dev ? devConfig : prodConfig))

compiler.run(((err, stats) => {
  if (err || stats.hasErrors()) {
    console.log('编译失败')
  } else {
    console.log('编译成功')
  }
}))
