const config = {
    apiBaseUrl: process.env.NODE_ENV === 'production'
      ? 'https://vrapi.welcomedcc.com'
      : 'http://localhost:8000',
    fontEndUrl: process.env.NODE_ENV === 'production'
      ? 'https://voicecontest.welcomedcc.com/'
      : 'https://localhost:5173/',
  };
  
  export default config;
