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


const express = require("express");
const tesseract = require("node-tesseract-ocr");
const fs  = require('fs');
const sharp = require('sharp');
const { exec } = require('child_process');

const app = express();
const port = 3000;

app.use(express.json({ limit: "10mb" }));

const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
};

app.post("/api/get-text", async (req, res) => {
  const { base64_image } = req.body; 

  if (!base64_image) {
    return res
      .status(400)
      .json({ success: false, message: "No image provided." });
  }

  try {
    const imageBuffer = Buffer.from(base64_image, "base64");

    const text = await tesseract.recognize(imageBuffer, config);

    res.type("application/json");
    res.json({
      success: true,
      result: {
        text: text // The OCR result text
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing image",
      error: error.message
    });
  }
});


app.post('/api/get-bboxes', async (req, res) => {
    const { base64_image, bbox_type } = req.body;

    if (!base64_image || typeof base64_image !== 'string') {
        return res.status(400).json({
            success: false,
            error: { message: 'Invalid base64_image.' }
        });
    }

    const validBboxTypes = ['word', 'line', 'paragraph', 'block', 'page'];
    if (!bbox_type || !validBboxTypes.includes(bbox_type)) {
        return res.status(400).json({
            success: false,
            error: { message: 'Invalid bbox_type.' }
        });
    }

    try {
        const imageBuffer = Buffer.from(base64_image, 'base64');
        // console.log("Image buffer size:", imageBuffer.length);

        const tempImagePath = 'temp_image.png';
        await sharp(imageBuffer).toFile(tempImagePath);

        exec(`tesseract ${tempImagePath} stdout --psm 6 -c tessedit_create_tsv=1`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Tesseract error: ${error.message}`);
                return res.status(500).json({
                    success: false,
                    error: { message: 'Error processing image.' }
                });
            }

            const lines = stdout.split('\n');
            const bboxes = [];

            let targetLevel = 5; // Default to word level
            if (bbox_type === 'line') {
                targetLevel = 4;
            } else if (bbox_type === 'paragraph') {
                targetLevel = 3;
            } else if (bbox_type === 'block') {
                targetLevel = 2;
            } else if (bbox_type === 'page') {
                targetLevel = 1;
            }

            lines.forEach((line) => {
                const columns = line.split('\t');
                if (columns.length > 10 && columns[0] === targetLevel.toString()) {
                    const [level, page_num, block_num, par_num, line_num, word_num, left, top, width, height, conf, text] = columns;

                    bboxes.push({
                        x_min: parseInt(left, 10),
                        y_min: parseInt(top, 10),
                        x_max: parseInt(left, 10) + parseInt(width, 10),
                        y_max: parseInt(top, 10) + parseInt(height, 10),
                        confidence: parseFloat(conf),
                        text: text.trim()
                    });
                }
            });

            fs.unlink(tempImagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete temporary file: ${err.message}`);
                }
            });

            res.json({
                success: true,
                result: {
                    bboxes: bboxes
                }
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: { message: 'Error processing image.' }
        });
    }
});






// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


