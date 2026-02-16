function execute(data) {
    const limit = 1234567890123456789012345678901234567890n; // Set the limit for the largest prime number.
    printSquaresOfPrimes(limit);
}

function printSquaresOfPrimes(largestPrimeLimit) {
    console.log(`Squares of prime numbers up to ${largestPrimeLimit}:`);
  for (let i = 2; i <= largestPrimeLimit; i++) {
    if (isPrime(i)) {
      console.log(`${i}² = ${i * i}`); 
    }
  }
}

function isPrime(num) {
  if (num <= 1) return false; 
  if (num <= 3) return true;  
  if (num % 2 === 0 || num % 3 === 0) return false; 

  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}
