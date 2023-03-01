# Clippy

## Extract text

This folder contains the code to parse a pdf for text and metadata. <br>
The code here is just for demo purpose and module for rendering a pdf in the html canvas is still in developement. <br>
Will update the readme for any further progress.<br>

### Progress

📄 Extract text data from pdf using pdfjs ✅ <br>
🖼 Extract embedded images from pdf ✅ <br>
📊 Extract tables as JSON from pdf (ongoing) 🔃 <br>
📈 Extarct Chart data as JSON from pdf (ongoing) 🔃 <br>
🌐 Render pdf using HTML canvas in the browser (Ongoing) ✅ <br>

### To do

1️⃣ Parse keyword for object (image, table, chart) from text data in a pdf via nltk or some nlp library in js <br>
2️⃣ Storing object-key pair in a golbal store/context in the UI <br>
3️⃣ Highlight text in the UI using the keywords in global store <br>

### Library/API used

📑 PDF.JS <br>
&emsp;npm link: <a href="https://www.npmjs.com/package/pdfjs">https://www.npmjs.com/package/pdfjs</a> <br>
📷 PDF-EXPORT-IMAGES <br>
&emsp;npm link: <a href="https://www.npmjs.com/package/pdf-export-images">https://www.npmjs.com/package/pdf-export-images</a> <br>

### How to run

To install all dependencies run: `npm install` <br>
To install pdfjs library in the project run: `npm install pdfjs-dist` <br>
To install pdf-export-image library in the project run: `npm i pdf-export-images` <br>
To run the demo: `node index.js`




<h1 align="center">Project Title</h1>
Clippy: Smart PDF Reader for better Paper Reading Experience and Knowledge Mining

<h1 align="center">Project Description</h1>

<h3>1.1. Authentication</h3>
There are two different types of user modes in our system - Guest and authenticated user. A user needs to provide a full name, email, password, institution and  <br> designation to register to the system. A 6 digit OTP will be sent to email for verification. Users can log in with email and password. After a successful login users  <br> can access tools that allow him or her to maintain track of previously read research publications.<br>
<h3>1.2. Searching a Pape</h3>
A user can search paper in two ways: By uploading the PDF manually or by searching by the Paper Title. If a user searches using the paper title, <br> a list of related papers will be displayed. Among the displayed papers, users can select a paper. <br> After selection of the paper, they will get three options:
Cross Referencing of Objects
Summarization of PDF
Generating a knowledge Graph<br>
<h3>1.3. Cross Referencing of Objects </h3>
A PDF usually contains a number of figures, tables, charts etc. It references other papers as well. For efficient and easy PDF reading, <br> Clippy supports cross referencing of the objects. Clippy works in two modes: cross referencing enabled mode and cross referencing disabled mode. When cross referencing is enabled, the referenced objects will be shown in a popup overlay whenever the reader hovers over the reference keyword. <br>
<h3>1.4. Building a knowledge graph </h3>
A research paper usually references other papers. The referenced papers may have citations among themselves too. <br> Clippy will generate a knowledge graph showing the citations within the paper, also the interrelation among the cited papers too. <br> A user will be able to determine the sequence of study for research articles with the aid of the knowledge graph.<br>
<h3>1.5. Summary of Important Elements </h3>
A research paper's essential components include an abstract, background information, <br> references, methodology, experiment baselines, and result analysis. Summarizing the important elements may help a reader in grabbing the quicker understanding of the paper. <br> Clippy comes with two types of summarization: extractive and abstractive. Clippy will highlight the important sentences from the paper if extractive summary is selected. <br> A summary from each block of the paper ie. abstract, background study etc. and TLDR will be shown as a distinct PDF if the abstractive summary is selected.
All the summary generated by Clippy can be exported as PDF.


<h1 align="center">Installation</h1>

<b>### Tech Stack </b>
MongoDB
Express.js
Angular
Node.js




