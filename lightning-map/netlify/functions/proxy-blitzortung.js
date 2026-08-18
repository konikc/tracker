// Netlify Function - Proxy for Blitzortung API (ES6 Module)
import https from 'https';

export const handler = async (event, context) => {
  const url = 'https://data.blitzortung.org/Data_Region_7/Processed/JSON/Lightning.GeoJSON';
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET'
          },
          body: data
        });
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: err.message })
      });
    });
  });
};
