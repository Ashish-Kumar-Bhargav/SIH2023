const express = require('express');
const app = express();
const port = 3001;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const multer = require('multer'); // For handling file uploads


app.use(bodyParser.json()); 
app.use(cors());

const url = "mongodb+srv://root:Shubu%40123@testing.rdqvgba.mongodb.net/DEEPAKSIR";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const User = require('./models/Users');
const Question = require('./models/Questions');




const nodemailer = require('nodemailer'); 

app.post('/login', async (req, res) => {
  const { rollNumber, dob } = req.body;

  try {
    // Find a user with the provided roll number and dob
    const user = await User.findOne({ rollNumber, dob });

    if (user) {
      // User found, authentication successful
      res.json({ message: 'Login successful' });
    } else {
      // User not found or invalid credentials
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    // Handle any errors that occurred during the database query
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/addUser', async (req, res) => {
  try {
    const { email, password, userGroup } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({ email, password, userGroup }); 
    await newUser.save();


    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './'); // Set your desired upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/addQuestion', upload.single('questionImage'), async (req, res) => {
  try {
    const {
      question,
      option1,
      option2,
      option3,
      option4,
      correctOption,
    } = req.body;

    const newQuestion = new Question({
      question,
      option1,
      option2,
      option3,
      option4,
      correctOption,
      imageUploadPath: req.file ? req.file.path : null,
    });

    await newQuestion.save();

    res.status(201).json({ message: 'Question added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
