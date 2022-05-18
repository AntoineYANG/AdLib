/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 14:35:33 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-20 18:29:52
 */

const { execSync } = require('child_process');


module.exports = (/** @type {import('grunt')} */ grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    'create-windows-installer': {
      x64: {
        appDirectory: './packages/react/output/ad-lib.client-win32-x64',
        outputDirectory: './packages/react/output/ad-lib.client-win32-x64/installer',
        description: require(
          './package.json'
        ).description,
        authors: require(
          './packages/react/package.json'
        ).author.split(/ +/)[0],
        exe: 'ad-lib.client.exe',
      },
    },
  });

  // Load the plugin.
  grunt.loadNpmTasks('grunt-electron-installer');

  grunt.registerTask('build-react-app', 'Run react.build', () => {
    execSync('espoir run react.build', {
      encoding: 'utf-8'
    });
  });

  grunt.registerTask('generate-electron-app', 'Run react.electron-package', () => {
    execSync('espoir run react.electron-package', {
      encoding: 'utf-8'
    });
  });
  
  // Default task(s).
  grunt.registerTask(
    'build',
    [
      'build-react-app',
      'generate-electron-app',
      'create-windows-installer'
    ]
  );
};
