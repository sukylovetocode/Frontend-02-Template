var Generator = require('yeoman-generator');

module.exports = class extends Generator {

  async makePkgJson() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      },
    ]);

    this.log("app name", answers.name);

    const pkgJson = {
      "name": answers.name,
      "version": "1.0.0",
      "main": "generators/app/index.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "",
      "license": "ISC",
      "devDependencies": {

      },
      "dependencies": {
        
      }
    }

    //extends package.json
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
  }

  installNpm() {
    this.npmInstall(['vue'], { 'save-dev': false });
    this.npmInstall(['webpack', 'vue-loader'], { 'save-dev': true});
  }

  copyFiles() {
    this.fs.copyTpl(
      this.templatePath('HelloWorld.vue'),
      this.destinationPath('src/HelloWorld.vue'),
      {}
    );
    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js'),
      {}
    );
  }
};