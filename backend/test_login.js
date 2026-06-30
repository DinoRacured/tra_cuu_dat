const axios = require('axios');
async function test() {
  try {
    console.log('Fetching homepage...');
    let res = await axios.get('https://congdulieu.vn/');
    let html = res.data;
    let urls = html.match(/href="([^"]*)"/gi);
    console.log('All urls:', urls.slice(0, 10), urls.find(u => u.toLowerCase().includes('auth') || u.toLowerCase().includes('log')));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
