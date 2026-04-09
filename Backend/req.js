const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: '69be4e5fd7c13e0d5bc9ffb4' }, 'w8K2mVp3R5xQ9jL4nP0vB7yJ3zA6fD2sG1hU4cT8eR9wQ5mK0pV3xY2bN1mL4pK9', { expiresIn: '1h' });
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/expenses/stats?month=4&year=2026',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', e => console.error(e));
req.end();
