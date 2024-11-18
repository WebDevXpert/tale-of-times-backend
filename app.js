const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));


const articleRoutes = require('./routes/articles');
app.use('/api/articles', articleRoutes);


app.use(express.static('public')); 


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
