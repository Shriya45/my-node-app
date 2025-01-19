const express = require('express'); // Import Express
const multer = require('multer');  // Import Multer
const path = require('path');      // Import Path
const fs = require('fs');          // Import File System

const app = express(); // Initialize the Express app
const PORT = 3000;     // Define the server port

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.body.userId;

        // Create a user-specific folder if it doesn't exist
        const userDir = path.join(__dirname, 'uploads', userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file uploads
app.post(
    '/upload',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ]),
    (req, res) => {
        const { userId, email, name } = req.body;

        if (!userId || !email || !name) {
            return res.status(400).send('Missing required user details.');
        }

        const photoPath = `/uploads/${userId}/${req.files.photo[0].filename}`;
        const videoPath = `/uploads/${userId}/${req.files.video[0].filename}`;

        res.send(`
            <h1>Data Uploaded Successfully</h1>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Photo:</strong> <a href="${photoPath}" target="_blank">View Photo</a></p>
            <p><strong>Video:</strong> <a href="${videoPath}" target="_blank">View Video</a></p>
        `);
    }
);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
