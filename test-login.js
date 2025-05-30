const axios = require('axios');

async function testLogin() {
  const passwords = ['test123', 'admin', 'admin123', 'password', '123456', 'testkullanici'];
  
  for (const password of passwords) {
    try {
      console.log(`Şifre deneniyor: ${password}`);
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username: 'testkullanici',
        password: password
      });
      
      console.log(`✅ Başarılı! Şifre: ${password}`);
      console.log('Token:', response.data.token);
      break;
      
    } catch (error) {
      console.log(`❌ Başarısız: ${password}`);
    }
  }
}

testLogin(); 