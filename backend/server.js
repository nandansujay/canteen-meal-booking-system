require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 4001;

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Canteen API running on http://localhost:${PORT}`);
  });
});
