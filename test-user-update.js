const axios = require('axios');

async function testUserUpdate() {
  try {
    // Önce login ol - gerçek admin kullanıcısı ile
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'testadmin',
      password: 'test123' // Gerçek şifreyi buraya yazın
    });
    
    console.log('Login response:', loginResponse.data);
    const token = loginResponse.data.data.token;
    console.log('Login başarılı, token alındı:', token);
    
    // Test kullanıcısının ID'si - kullanici kullanıcısını güncelleyelim
    const userId = '6d34b92c-bc36-4081-b7d8-944bc5c38cd1'; // kullanici kullanıcısının gerçek ID'si
    
    // Önce mevcut kullanıcıyı getir
    const getCurrentUserResponse = await axios.get(
      `http://localhost:3001/api/admin/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Mevcut kullanıcı:', getCurrentUserResponse.data);
    
    // Kullanıcıyı güncelle
    const updateData = {
      username: "kullanici_updated",
      name: "Serhat Updated",
      surname: "Taha Kenar Updated",
      credit: "200",
      debit: "180",
      email: "test123updated@gmail.com",
      userTypeName: "editor"
    };
    
    console.log('Güncelleme verisi:', updateData);
    
    const updateResponse = await axios.put(
      `http://localhost:3001/api/admin/users/${userId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Güncelleme yanıtı:', updateResponse.data);
    
    // Kullanıcıyı tekrar getir ve kontrol et
    const getUserResponse = await axios.get(
      `http://localhost:3001/api/admin/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Güncellenmiş kullanıcı:', getUserResponse.data);
    
  } catch (error) {
    console.error('Hata detayı:');
    console.error('Message:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
    console.error('Full error:', error);
  }
}

testUserUpdate(); 