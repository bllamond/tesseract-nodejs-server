// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const tesseract = require('tesseract.js');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// // Set up file storage for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique name
//   }
// });

// const upload = multer({ storage });

// // Your existing function to extract text from an image
// const getImageText = async (fileName, lang, logger) => {
//     let recognizeResult = null;
//     try {
//         if (fs.existsSync(fileName)) {
//             if (logger) {
//                 const myLogger = {
//                     logger: m => console.log(m)
//                 };
//                 recognizeResult = await tesseract.recognize(fileName, lang, myLogger);
//             } else {
//                 recognizeResult = await tesseract.recognize(fileName, lang);
//             }
//             if (recognizeResult) {
//                 return recognizeResult.data.text;
//             }
//         }
//     } catch (error) {
//         return error.message;
//     }
// };

// // API to get text from image
// app.post('/get-text', upload.single('image'), async (req, res) => {
//     const imagePath = req.file.path;

//     try {
//         const extractedText = await getImageText(imagePath, 'eng', true); // Set language and logger
//         res.json({ text: extractedText });
//     } catch (err) {
//         res.status(500).json({ error: 'Error processing image', message: err.message });
//     }
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`OCR server running at http://localhost:${port}`);
// });

const express = require("express");
const Tesseract = require("tesseract.js");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
// API to get text from a base64 image

app.post("/api/get-text", async (req, res) => {
    const { base64_image } = req.body;

    if (!base64_image) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided." });
    }

    // Decode the base64 image
    const imageBuffer = Buffer.from(base64_image, "base64");

    // Create a temporary file
    const imagePath = "temp_image.png";
    require("fs").writeFileSync(imagePath, imageBuffer);

    try {
      const result = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => console.log(m),
      });

      // Set Content-Type to application/json without charset
      res.type('application/json'); // Sets Content-Type correctly
      res.json({
        success: true,
        result: {
          text: result.data.text,
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error processing image",
        error: err.message,
      });
    } finally {
      require("fs").unlinkSync(imagePath);
    }
  });

// app.post("/api/get-text", async (req, res) => {
//   const { base64_image } = req.body;

//   if (!base64_image) {
//     return res
//       .status(400)
//       .json({ success: false, message: "No image provided." });
//   }

//   // Decode the base64 image
//   const imageBuffer = Buffer.from(base64_image, "base64");

//   // Create a temporary file
//   const imagePath = "temp_image.png";
//   require("fs").writeFileSync(imagePath, imageBuffer);

//   try {
//     const result = await Tesseract.recognize(imagePath, "eng", {
//       logger: (m) => console.log(m),
//     });

//     // Use res.json() to send the response
//     res.json({
//       success: true,
//       result: {
//         text: result.data.text,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Error processing image",
//       error: err.message,
//     });
//   } finally {
//     require("fs").unlinkSync(imagePath);
//   }
// });

// Start the server
app.listen(port, () => {
  console.log(`OCR server running at http://localhost:${port}`);
});
