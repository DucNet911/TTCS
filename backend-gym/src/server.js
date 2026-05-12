require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║    🏋️  FitGear Backend API Server       ║
  ║    📡 Running on: http://localhost:${PORT}  ║
  ║    📦 Database:   fitgear_db             ║
  ║    📋 Tables:     22                     ║
  ╚══════════════════════════════════════════╝
  `);
});
