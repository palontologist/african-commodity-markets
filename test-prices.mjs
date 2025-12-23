#!/usr/bin/env node

/**
 * Test script for debugging commodity price APIs
 */

const API_KEY = process.env.ALPHA_VANTAGE_KEY || '8PA1JLQO04UHLX9Q';

async function testAlphaVantageGold() {
  console.log('\n=== Testing Alpha Vantage Gold (XAU) ===');
  const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`;
  console.log('URL:', url.replace(API_KEY, 'API_KEY'));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data['Realtime Currency Exchange Rate']) {
      const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
      console.log('✅ Gold Price:', rate, 'USD/oz');
    } else if (data['Note']) {
      console.log('⚠️ Rate limit:', data['Note']);
    } else {
      console.log('❌ No valid data found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testAlphaVantageCoffee() {
  console.log('\n=== Testing Alpha Vantage COFFEE Commodity ===');
  const url = `https://www.alphavantage.co/query?function=COFFEE&interval=monthly&apikey=${API_KEY}`;
  console.log('URL:', url.replace(API_KEY, 'API_KEY'));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Response (first 500 chars):', JSON.stringify(data).slice(0, 500));
    
    if (data['data'] && Array.isArray(data['data']) && data['data'].length > 0) {
      const latest = data['data'][0];
      console.log('✅ Latest Coffee Price:', latest.value, 'USD (Date:', latest.date, ')');
    } else if (data['Note']) {
      console.log('⚠️ Rate limit:', data['Note']);
    } else if (data['Information']) {
      console.log('⚠️ API Message:', data['Information']);
    } else {
      console.log('❌ No valid data found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testAlphaVantageWheat() {
  console.log('\n=== Testing Alpha Vantage WHEAT Commodity ===');
  const url = `https://www.alphavantage.co/query?function=WHEAT&interval=monthly&apikey=${API_KEY}`;
  console.log('URL:', url.replace(API_KEY, 'API_KEY'));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Response (first 500 chars):', JSON.stringify(data).slice(0, 500));
    
    if (data['data'] && Array.isArray(data['data']) && data['data'].length > 0) {
      const latest = data['data'][0];
      console.log('✅ Latest Wheat Price:', latest.value, 'USD/bushel (Date:', latest.date, ')');
    } else if (data['Note']) {
      console.log('⚠️ Rate limit:', data['Note']);
    } else if (data['Information']) {
      console.log('⚠️ API Message:', data['Information']);
    } else {
      console.log('❌ No valid data found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testWorldBankCoffee() {
  console.log('\n=== Testing World Bank Coffee Price ===');
  const currentYear = new Date().getFullYear();
  const url = `https://api.worldbank.org/v2/country/all/indicator/PCOFFOTM?format=json&per_page=5&date=${currentYear-2}:${currentYear}&mrv=1`;
  console.log('URL:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2).slice(0, 1000));
    
    if (Array.isArray(data) && data.length > 1 && data[1]?.length > 0) {
      for (const entry of data[1]) {
        if (entry.value !== null) {
          console.log('✅ Coffee Price:', entry.value, 'USD (Date:', entry.date, ')');
          break;
        }
      }
    } else {
      console.log('❌ No valid data found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testWorldBankGold() {
  console.log('\n=== Testing World Bank Gold Price ===');
  const currentYear = new Date().getFullYear();
  const url = `https://api.worldbank.org/v2/country/all/indicator/PGOLD?format=json&per_page=5&date=${currentYear-2}:${currentYear}&mrv=1`;
  console.log('URL:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2).slice(0, 1000));
    
    if (Array.isArray(data) && data.length > 1 && data[1]?.length > 0) {
      for (const entry of data[1]) {
        if (entry.value !== null) {
          console.log('✅ Gold Price:', entry.value, 'USD/oz (Date:', entry.date, ')');
          break;
        }
      }
    } else {
      console.log('❌ No valid data found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('🔍 Testing Commodity Price APIs...\n');
  
  await testAlphaVantageGold();
  await testAlphaVantageCoffee();
  await testAlphaVantageWheat();
  await testWorldBankCoffee();
  await testWorldBankGold();
  
  console.log('\n✨ Tests complete!');
}

main();
