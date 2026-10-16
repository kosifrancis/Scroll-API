
require('dotenv').config();

const app = require('./app');
const connectDB = require('./Config/db');




const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Scroll API is running on port ${PORT}`);
    });
};

startServer();
