/** ESPOIR TEMPLATE */

        const main = (): number => {
  console.log('hello world');

  return 0;
};

if (require.main === module) {
  process.exit(main());  
}

export default main;

