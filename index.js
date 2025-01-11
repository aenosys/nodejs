// Import the express module
const express = require('express');

// Create an instance of an Express application
const app = express();

// Define the port the server will listen on
const port = 3000;

// Define a route for the root URL ("/")
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
