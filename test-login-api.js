const axios = require('axios');

async function testLoginAPI() {
  const baseURL = 'http://localhost:3001'; // Sunucu adresinizi buraya yazın
  
  console.log('Login API testi başlatılıyor...');
  console.log('='.repeat(50));
  
  // Test edilecek kullanıcı bilgileri
  const testUsers = [
    { username: 'serhat', password: '123' },
    { username: 'testkullanici', password: 'gizli123' },
    { username: 'yanliskullanici', password: 'yanlissifre' } // Hatalı test
  ];
  
  for (const user of testUsers) {
    console.log(`\nTest ediliyor: ${user.username}`);
    console.log('-'.repeat(30));
    
    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, {
        username: user.username,
        password: user.password
      });
      
      console.log('✅ Login başarılı!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Login başarısız!');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Network Error:', error.message);
      }
    }
  }
}

testLoginAPI(); 