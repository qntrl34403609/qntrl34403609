const process = require('process');

function execute(data) {
    console.log('Initial memory usage:');
    console.log(process.memoryUsage());

    createLargeArray();

    console.log('\nMemory usage after creating large array:');
    console.log(process.memoryUsage());

    console.log(process.memoryUsage());
}


function createLargeArray() {
  const size = 1000000; // 1 million elements
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(new Array(100).fill('a')); // Each element is an array of 100 strings
  }
  return arr;
}
