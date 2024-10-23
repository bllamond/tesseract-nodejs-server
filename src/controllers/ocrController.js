const tesseract = require('node-tesseract-ocr');

// Helper function to decode base64 and save as image
// const saveBase64Image = (base64Image, fileName) => {
//     // Clean the base64 string (removing metadata)
//     const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
//     // Decode base64 to binary
//     const binaryImage = Buffer.from(base64Data, "base64");
//     // Save the binary image as a file
//     fs.writeFileSync(fileName, binaryImage);
// };



// export const extractText = async (req, res) => {
//   const { base64_image } = req.body;

//   if (!base64_image) {
//     return res
//       .status(400)
//       .json({ success: false, message: "No image provided." });
//   }

//   // Decode the base64 image
//   const imageBuffer = Buffer.from(base64_image, "base64");
//   const imagePath = "temp_image.png";

//   // Write the image to a temporary file
//   fs.writeFileSync(imagePath, imageBuffer);

//   try {
//     const result = await Tesseract.recognize(imagePath, "eng", {
//       logger: (m) => console.log(m),
//     });

//     res.type("application/json");
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
//     // Clean up the temporary file
//     fs.unlinkSync(imagePath);
//   }
// };

// Modified function to get text from base64-encoded image
// const getTextFromBase64 = async (base64Image) => {
//     console.log('inside controller')
//     const fileName = "temp_image.png"; // Temp file to store the image

//     try {
//         // Step 1: Save the base64 image as a file
//         saveBase64Image(base64Image, fileName);

//         // Step 2: Use Tesseract to recognize text from the saved file
//         const result = await tesseract.recognize(fileName, "eng", {
//             logger: m => console.log(m) // Optional logging
//         });

//         // Step 3: Return the recognized text
//         return result.data.text;
//     } catch (error) {
//         console.error("Error processing image:", error);
//         return error.message;
//     } finally {
//         // Clean up: Optionally delete the temporary file
//         fs.unlinkSync(fileName);
//     }
// };

// Example usage:
// const base64Image = "image.png"; // Replace with actual base64 string
// getTextFromBase64(base64Image).then(text => {
//     console.log("Extracted Text:", text);
// });


const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
}

tesseract
  .recognize("temp_image.png", config)
  .then((text) => {
    console.log("Result:", text)
  })
  .catch((error) => {
    console.log(error.message)
  })