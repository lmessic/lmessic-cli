const program = require('commander');

const helpOptions = () => {
  // 增加自己的options
  program.option('-d --dest <dest>', 'A destination folder，例如： -d /src/home/index.js')
  program.option('-f --framework <framework>', 'Your framework，例如： React / Vue')

  // 监听指令
  program.on('--help', function () {
    console.log('')
    console.log('Others')
    console.log(' others')
  })
}

module.exports = helpOptions;
