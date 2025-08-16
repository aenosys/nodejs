const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Create an 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// --- Middleware ---
// Enable JSON body parsing for API requests
app.use(express.json());
// Enable file upload handling
app.use(fileUpload());
// Statically serve the 'uploads' directory to make files accessible via URL
app.use('/uploads', express.static(uploadsDir));


// --- Simple Root Route ---
app.get('/', (req, res) => {
  res.send('Hello, World! The server is running.');
});


// --- Internal API Endpoints ---

/**
 * @route GET /health
 * @description A standard health check endpoint.
 */
app.get('/health', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Health check successful.`);
  res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route GET /env
 * @description Exposes specific environment variables for debugging.
 */
app.get('/env', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Request received for /env.`);
  
  const relevantEnvVars = {
    testkey1: process.env.testkey1 || 'NOT FOUND',
    testkey2: process.env.testkey2 || 'NOT FOUND',
    testkey3: process.env.testkey3 || 'NOT FOUND',
    testkey4: process.env.testkey4 || 'NOT FOUND',
    KUBERNETES_SERVICE_HOST: process.env.KUBERNETES_SERVICE_HOST || 'NOT FOUND',
  };

  res.status(200).json({
    message: "Environment variables as seen by the Node.js process:",
    variables: relevantEnvVars,
  });
});


// --- File Upload Feature ---

/**
 * @route POST /upload
 * @description Accepts a file upload and saves it to the 'uploads' directory.
 * To use: Send a POST request with form-data, with a key of 'uploadedFile'.
 */
app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  // 'uploadedFile' is the name of the file input field in the form
  const uploadedFile = req.files.uploadedFile;
  const uploadPath = path.join(__dirname, 'uploads', uploadedFile.name);

  // Move the file to the uploads directory
  uploadedFile.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error during file upload:', err);
      return res.status(500).json({ message: 'Error uploading file.', error: err });
    }
    console.log(`[${new Date().toLocaleTimeString()}] File uploaded successfully: ${uploadedFile.name}`);
    res.status(200).json({ message: 'File uploaded successfully!', filename: uploadedFile.name });
  });
});

/**
 * @route GET /list-uploads
 * @description Returns a list of all filenames in the 'uploads' directory.
 */
app.get('/list-uploads', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Unable to scan directory:', err);
      return res.status(500).json({ message: 'Unable to scan directory.', error: err });
    }
    console.log(`[${new Date().toLocaleTimeString()}] Listed files in uploads directory.`);
    res.status(200).json(files);
  });
});


// --- External Public API Endpoints ---

/**
 * @route GET /posts
 * @description Fetches fake blog posts from an external API.
 */
app.get('/posts', async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Request for /posts. Fetching from external API...`);
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }
    const posts = await response.json();
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching from JSONPlaceholder:', error.message);
    res.status(500).json({ message: 'Failed to fetch posts from external service.' });
  }
});

/**
 * @route GET /random-fact
 * @description Fetches a random fact from an external API.
 */
app.get('/random-fact', async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Request for /random-fact. Fetching from external API...`);
  try {
    const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }
    const fact = await response.json();
    res.status(200).json(fact);
  } catch (error) {
    console.error('Error fetching from Useless Facts API:', error.message);
    res.status(500).json({ message: 'Failed to fetch a random fact.' });
  }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`=============================================`);
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`=============================================`);
  console.log('Available Endpoints:');
  console.log(`- GET  http://localhost:${port}/`);
  console.log(`- GET  http://localhost:${port}/health`);
  console.log(`- GET  http://localhost:${port}/env`);
  console.log(`- POST http://localhost:${port}/upload`);
  console.log(`- GET  http://localhost:${port}/list-uploads`);
  console.log(`- GET  http://localhost:${port}/uploads/<filename>`);
  console.log(`- GET  http://localhost:${port}/posts`);
  console.log(`- GET  http://localhost:${port}/random-fact`);
  console.log(`=============================================`);
});