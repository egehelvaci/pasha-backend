const http = require('http');

const data = JSON.stringify({
  width: 80,
  height: 300,
  quantity: 1000
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products/eea687b8-7663-426f-823a-ad2131dcbe48/stock',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.write(data);
req.end(); 