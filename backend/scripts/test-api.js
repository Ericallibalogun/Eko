// Simple script to test the backend API
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Testing EKO Navigation Backend API...\n');

  try {
    // Test places endpoint
    console.log('1. Testing places endpoint...');
    const placesResponse = await fetch(`${BASE_URL}/places/category/Nature`);
    const placesData = await placesResponse.json();
    console.log('Places response:', placesData);
    console.log('Status:', placesResponse.status);
    console.log('');

    // Test search endpoint
    console.log('2. Testing search endpoint...');
    const searchResponse = await fetch(`${BASE_URL}/places/search?query=Lekki`);
    const searchData = await searchResponse.json();
    console.log('Search response:', searchData);
    console.log('Status:', searchResponse.status);
    console.log('');

    console.log('API tests completed successfully!');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();