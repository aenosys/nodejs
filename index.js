const express = require('express');
const app = express();
const port = 3000;

// --- Original Timeline Logging ---
// This part remains the same, logging a message every second to show the server is alive.
let counter = 1;
setInterval(() => {
  // We use process.stdout.write to avoid the automatic newline from console.log
  // This can make continuous logs a bit cleaner.
  process.stdout.write(`[${new Date().toLocaleTimeString()}] Server alive log #${counter++}\n`);
}, 1000);

// --- Simple Root Route ---
// A basic endpoint to confirm the server is responding to requests.
app.get('/', (req, res) => {
  res.send('Hello, World! The server is running.');
});

// --- Internal API Endpoints ---
// These are routes that provide information about the service itself.

/**
 * @route GET /health
 * @description A standard health check endpoint.
 * This is crucial for load balancers and container orchestrators (like Kubernetes)
 * to know if the application is healthy and ready to receive traffic.
 */
app.get('/health', (req, res) => {
  // In a real app, you might check database connections or other dependencies here.
  const healthStatus = {
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
  };
  console.log(`[${new Date().toLocaleTimeString()}] Health check successful.`);
  res.status(200).json(healthStatus);
});

// --- START: NEW TEST ENDPOINT ---
/**
 * @route GET /env
 * @description Exposes specific environment variables for debugging purposes.
 * This is the ultimate test. It asks the Node.js process itself to report
 * what it sees in its own environment.
 */
app.get('/env', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Request received for /env. Reporting environment variables.`);
  
  // Pick out the specific variables we want to check.
  // In a real application, you should be very careful about exposing environment
  // variables, as they can contain sensitive data.
  const relevantEnvVars = {
    testkey1: process.env.testkey1 || 'NOT FOUND',
    testkey2: process.env.testkey2 || 'NOT FOUND',
    testkey3: process.env.testkey3 || 'NOT FOUND',
    testkey4: process.env.testkey4 || 'NOT FOUND',
    // You can add any other variables you expect to be there.
    // For example, Kubernetes injects some of its own:
    KUBERNETES_SERVICE_HOST: process.env.KUBERNETES_SERVICE_HOST || 'NOT FOUND',
  };

  res.status(200).json({
    message: "Environment variables as seen by the Node.js process:",
    variables: relevantEnvVars,
  });
});
// --- END: NEW TEST ENDPOINT ---


// --- External Public API Endpoints ---
// These routes demonstrate the server making requests to other APIs on the internet.
// This is exactly what the "Intelligent Egress Rules" are designed to manage and secure.

/**
 * @route GET /posts
 * @description Fetches a list of fake blog posts from JSONPlaceholder.
 * This simulates calling a data service.
 * Egress Rule Required: Allow traffic to `jsonplaceholder.typicode.com` on port 443 (HTTPS).
 */
app.get('/posts', async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Request received for /posts. Fetching from external API...`);
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
 * @description Fetches a random useless fact.
 * This simulates calling a fun, third-party utility utility API.
 * Egress Rule Required: Allow traffic to `uselessfacts.jsph.pl` on port 443 (HTTPS).
 */
app.get('/random-fact', async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Request received for /random-fact. Fetching from external API...`);
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
  console.log('Test Endpoints:');
  console.log(`- http://localhost:${port}/`);
  console.log(`- http://localhost:${port}/health`);
  console.log(`- http://localhost:${port}/env   <-- NEW TEST ENDPOINT`);
  console.log(`- http://localhost:${port}/posts`);
  console.log(`- http://localhost:${port}/random-fact`);
  console.log(`=============================================`);
});
