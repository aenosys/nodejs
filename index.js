const express = require('express');
const app = express();
const port = 3000;

// Timeline logging every second
let counter = 1;
setInterval(() => {
  console.log(`[${new Date().toLocaleTimeString()}] Log #${counter++}`);
}, 1000);

// Define a route for the root URL ("/")
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
