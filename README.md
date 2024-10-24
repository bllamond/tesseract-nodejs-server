# OCR API Server

This project provides an API server that utilizes Tesseract OCR to extract text and bounding boxes from images. The server is implemented using Node.js and provides two main API endpoints:

1. `/api/get-bboxes`: Extracts the bounding boxes for text elements (words, lines, paragraphs, blocks, or pages) from an uploaded image.
2. `/api/get-text`: Extracts the text content from an uploaded image.

## Prerequisites

Before running the server, you need to install Tesseract OCR on your system. Follow the steps below to download and install Tesseract.

### Installing Tesseract OCR

#### Windows

1. Download the Tesseract installer from the [official repository](https://github.com/UB-Mannheim/tesseract/wiki).
2. Run the installer and follow the installation instructions.
3. After installation, add Tesseract's `bin` directory to the system's PATH environment variable.

