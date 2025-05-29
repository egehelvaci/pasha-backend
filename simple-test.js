const axios = require('axios');

async function simpleTest() {
  try {
    console.log('API test başlıyor...');
    const response = await axios.post('http://localhost:3001/api/auth/forgot-password', {
      email: 'egehelvaci@gmail.com'
    });
    console.log('Başarılı:', response.data);
  } catch (error) {
    console.log('Hata:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

simpleTest(); 