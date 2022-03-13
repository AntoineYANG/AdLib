/** ESPOIR TEMPLATE */

const main = () => {
  console.log('hello world');

  return 0;
};

if (require.main === module) {
  process.exit(main());  
}

module.exports = main;

