import bcrypt from 'bcryptjs';

async function generatePasswordHash() {
  const password = 'password';
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  
  // Test the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log(`Hash verification: ${isValid}`);
  
  // Test the current hardcoded hash
  const currentHash = '$2a$10$N9qo8uLOickgx2ZMRZoMye1IVI9gWWFl8Z9zPPJHPJM0pNLJYF6.K';
  const testCurrentHash = await bcrypt.compare(password, currentHash);
  console.log(`Current hash with 'password': ${testCurrentHash}`);
  
  const testHelloHash = await bcrypt.compare('hello', currentHash);
  console.log(`Current hash with 'hello': ${testHelloHash}`);
}

generatePasswordHash().catch(console.error);
