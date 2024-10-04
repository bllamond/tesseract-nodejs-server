const tesseract = require("tesseract.js");
const fs = require("fs");

// Helper function to decode base64 and save as image
const saveBase64Image = (base64Image, fileName) => {
    // Clean the base64 string (removing metadata)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    // Decode base64 to binary
    const binaryImage = Buffer.from(base64Data, "base64");
    // Save the binary image as a file
    fs.writeFileSync(fileName, binaryImage);
};

// Modified function to get text from base64-encoded image
const getTextFromBase64 = async (base64Image) => {
    const fileName = "temp_image.png"; // Temp file to store the image

    try {
        // Step 1: Save the base64 image as a file
        saveBase64Image(base64Image, fileName);

        // Step 2: Use Tesseract to recognize text from the saved file
        const result = await tesseract.recognize(fileName, "eng", {
            logger: m => console.log(m) // Optional logging
        });

        // Step 3: Return the recognized text
        return result.data.text;
    } catch (error) {
        console.error("Error processing image:", error);
        return error.message;
    } finally {
        // Clean up: Optionally delete the temporary file
        fs.unlinkSync(fileName);
    }
};

// Example usage:
const base64Image = "image.png"; // Replace with actual base64 string
getTextFromBase64(base64Image).then(text => {
    console.log("Extracted Text:", text);
});
