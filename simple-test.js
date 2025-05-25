const http = require('http');

const data = JSON.stringify({
  width: 100,
  height: 10000,
  quantity: 1500
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products/24feb613-14dc-45ab-b2aa-af9c5b440c93/stock',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log('Success:', jsonResponse.success);
      
      if (jsonResponse.success && jsonResponse.data) {
        console.log('\nSize Options:');
        jsonResponse.data.sizeOptions.forEach(so => {
          const note = so.stockNote ? ` - ${so.stockNote}` : '';
          console.log(`- ${so.width}x${so.height} (optional: ${so.is_optional_height}, stock: ${so.stockQuantity})${note}`);
        });
        
        console.log('\nVariations:');
        jsonResponse.data.variations.forEach(v => {
          console.log(`- ${v.width}x${v.height} (stock: ${v.stockQuantity})`);
        });
      } else {
        console.log('Error:', jsonResponse.message);
      }
    } catch (error) {
      console.log('Raw Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.write(data);
req.end(); 