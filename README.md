# Clippy

## Extract text

This folder contains the code to parse a pdf for text and metadata. <br>
The code here is just for demo purpose and module for rendering a pdf in the html canvas is still in developement. <br>
Will update the readme for any further progress.<br>

### Progress

Extract text data from pdf using pdfjs ✅ <br>
Extract embedded images from pdf ✅ <br>
Extract tables as JSON from pdf (ongoing) 🔃 <br>
Extarct Chart data as JSON from pdf (ongoing) 🔃 <br>
Render pdf using HTML canvas in the browser (Ongoing) 🔃 <br>

### To do

1️⃣ Parse keyword for object (image, table, chart) from text data in a pdf <br>
2️⃣ Storing object-key pair in a golbal store/context in the UI <br>
3️⃣ Highlight text in the UI using the keywords in global store <br>

### Library/API used

📑PDF.JS <br>
&emsp;npm link: <a href="https://www.npmjs.com/package/pdfjs">https://www.npmjs.com/package/pdfjs</a> <br>
📷PDF-EXPORT-IMAGES <br>
&emsp;npm link: <a href="https://www.npmjs.com/package/pdf-export-images">https://www.npmjs.com/package/pdf-export-images</a> <br>

### How to run

To install all dependencies run: `npm install` <br>
To install pdfjs library in the project run: `npm install pdfjs-dist` <br>
To run the demo: `node index.js`
