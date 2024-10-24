const express = require("express");
const tesseract = require("node-tesseract-ocr");
const fs = require("fs");
const sharp = require("sharp");
const { exec } = require("child_process");

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
        text: text,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing image",
      error: error.message,
    });
  }
});

app.post("/api/get-bboxes", async (req, res) => {
  const { base64_image, bbox_type } = req.body;

  if (!base64_image || typeof base64_image !== "string") {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid base64_image." },
    });
  }

  const validBboxTypes = ["word", "line", "paragraph", "block", "page"];
  if (!bbox_type || !validBboxTypes.includes(bbox_type)) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid bbox_type." },
    });
  }

  try {
    const imageBuffer = Buffer.from(base64_image, "base64");
    // console.log("Image buffer size:", imageBuffer.length);

    const tempImagePath = "temp_image.png";
    await sharp(imageBuffer).toFile(tempImagePath);

    exec(
      `tesseract ${tempImagePath} stdout --psm 6 -c tessedit_create_tsv=1`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Tesseract error: ${error.message}`);
          return res.status(500).json({
            success: false,
            error: { message: "Error processing image." },
          });
        }

        const lines = stdout.split("\n");
        const bboxes = [];

        let targetLevel = 5; // Default to word level
        if (bbox_type === "line") {
          targetLevel = 4;
        } else if (bbox_type === "paragraph") {
          targetLevel = 3;
        } else if (bbox_type === "block") {
          targetLevel = 2;
        } else if (bbox_type === "page") {
          targetLevel = 1;
        }

        lines.forEach((line) => {
          const columns = line.split("\t");
          if (columns.length > 10 && columns[0] === targetLevel.toString()) {
            const [
              level,
              page_num,
              block_num,
              par_num,
              line_num,
              word_num,
              left,
              top,
              width,
              height,
              conf,
              text,
            ] = columns;

            bboxes.push({
              x_min: parseInt(left, 10),
              y_min: parseInt(top, 10),
              x_max: parseInt(left, 10) + parseInt(width, 10),
              y_max: parseInt(top, 10) + parseInt(height, 10),
              // confidence: parseFloat(conf),
              // text: text.trim(),
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
            bboxes: bboxes,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: "Error processing image." },
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// CURL REQUEST TO /get-bboxes
// curl -X POST http://localhost:3000/api/get-bboxes -H "Content-Type: application/json" -d @request1.json

//RESPONSE RECIEVED
// {"success":true,"result":{"bboxes":[{"x_min":296,"y_min":694,"x_max":322,"y_max":726,"confidence":95.96447,"text":"It"},{"x_min":336,"y_min":694,"x_max":361,"y_max":726,"confidence":95.96447,"text":"is"},{"x_min":375,"y_min":689,"x_max":468,"y_max":726,"confidence":96.073074,"text":"what"},{"x_min":482,"y_min":694,"x_max":507,"y_max":726,"confidence":96.873245,"text":"it"},{"x_min":520,"y_min":694,"x_max":555,"y_max":726,"confidence":96.873245,"text":"is."}]}}

// CURL REQUEST TO /get-text
// curl -X POST http://localhost:3000/api/get-text -H "Content-Type: application/json" -d @request.json

// RESPONSE RECIEVED
//  {"success":true,"result":{"text":"KEEP CLEAR\r\n"}}
