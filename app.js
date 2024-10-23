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


// import express from "express";
// import ocrRoutes from "./routes/ocrRoutes.js"; // Add .js extension

// const app = express();
// const port = 3000;

// app.use(express.json({ limit: "10mb" }));
// app.use("/api", ocrRoutes);

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });



// const express = require("express");
// const Tesseract = require("tesseract.js");

// const app = express();
// const port = 3000;

// app.use(express.json({ limit: "10mb" }));

// app.post("/api/get-text", async (req, res) => {

//   console.log('inside controller')
//     const { base64_image } = req.body;

//     if (!base64_image) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No image provided." });
//     }

//     // Decode the base64 image
//     const imageBuffer = Buffer.from(base64_image, "base64");

//     // Create a temporary file
//     const imagePath = "temp_image.png";
//     require("fs").writeFileSync(imagePath, imageBuffer);

//     try {
//       const result = await Tesseract.recognize(imagePath, "eng", {
//         logger: (m) => console.log(m),
//       });

//       res.type('application/json');
//       res.json({
//         success: true,
//         result: {
//           text: result.data.text,
//         },
//       });
//     } catch (err) {
//       res.status(500).json({
//         success: false,
//         message: "Error processing image",
//         error: err.message,
//       });
//     } finally {
//       require("fs").unlinkSync(imagePath);
//     }
//   });

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
// app.listen(port, () => {
//   console.log(`OCR server running at http://localhost:${port}`);
// });

// const tesseract = require('node-tesseract-ocr');
// const config = {
//   lang: "eng",
//   oem: 1,
//   psm: 3,
// }

// tesseract
//   .recognize("image.png", config)
//   .then((text) => {
//     console.log("Result:", text)
//   })
//   .catch((error) => {
//     console.log(error.message)
//   })


const express = require("express");
const tesseract = require("node-tesseract-ocr");
const fs  = require('fs');

const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json({ limit: "10mb" }));

// Tesseract configuration
const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
};

// API Endpoint to get text from an image
app.post("/api/get-text", async (req, res) => {
  const { base64_image } = req.body; // Extract base64_image from the request body

  if (!base64_image) {
    // If base64_image is not provided, return a 400 Bad Request response
    return res
      .status(400)
      .json({ success: false, message: "No image provided." });
  }

  try {
    // Decode the base64 image to a Buffer
    const imageBuffer = Buffer.from(base64_image, "base64");

    // Run Tesseract OCR on the image buffer
    const text = await tesseract.recognize(imageBuffer, config);

    // Return the extracted text in the response
    res.type("application/json");
    res.json({
      success: true,
      result: {
        text: text // The OCR result text
      }
    });
  } catch (error) {
    // Handle errors during the OCR process
    res.status(500).json({
      success: false,
      message: "Error processing image",
      error: error.message
    });
  }
});


app.post("/api/get-bboxes", async (req, res) => {
  const { base64_image, bbox_type } = req.body;

  if (!base64_image) {
      return res.status(400).json({ success: false, message: "No image provided." });
  }

  try {
      const imageBuffer = Buffer.from(base64_image, "base64");
      const config = {
          lang: "eng",
          oem: 1,
          psm: 3 
      };

      // Perform OCR using Tesseract
      const result = await tesseract.recognize(imageBuffer, config);
      console.log("Tesseract Result:", result); 

      if (typeof result === 'string') {
          console.log("Recognized Text:", result);
          return res.json({
              success: true,
              result: {
                  text: result,
                  bboxes: [] 
              }
          });
      } else {

          const words = result.data.words;
          if (!words || words.length === 0) {
              return res.status(500).json({
                  success: false,
                  message: "Error processing image",
                  error: "No words found in the result."
              });
          }

          // Extract bounding boxes from words
          const bboxes = words.map(word => ({
              x_min: word.bbox.x0,
              y_min: word.bbox.y0,
              x_max: word.bbox.x1,
              y_max: word.bbox.y1
          }));

          res.json({
              success: true,
              result: {
                  bboxes: bboxes
              }
          });
      }
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Error processing image",
          error: error.message
      });
  }
});






// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


