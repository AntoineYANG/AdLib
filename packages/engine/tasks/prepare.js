/*
 * @Author: Kanata You 
 * @Date: 2022-03-13 17:51:06 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-13 19:44:23
 */

const checkEnv = require('./scripts/check-env');
const checkLibs = require('./scripts/check-libs');


const main = () => {
  if (checkEnv()) {
    console.info(
      '\x1B[32mEnv check succeeded.\x1B[0m'
    );
  } else {
    console.error(
      '\x1B[31mEnv check failed.\x1B[0m'
    );
    
    return 1;
  }

  if (checkLibs()) {
    console.info(
      '\x1B[32mPython libs preparation succeeded.\x1B[0m'
    );
  } else {
    console.error(
      '\x1B[31mPython libs preparation failed.\x1B[0m'
    );
    
    return 1;
  }

  return 0;
};

if (require.main === module) {
  process.exit(main());  
}

module.exports = main;
