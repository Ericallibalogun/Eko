// Simple test to check what API URL is being used
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API_BASE_URL would be:', process.env.NODE_ENV === 'production' 
  ? 'https://eko-7.onrender.com/api'  
  : 'http://localhost:5000/api');