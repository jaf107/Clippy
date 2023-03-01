// load the PDF file
const pdfUrl = "example.pdf";
const pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;

// get the page to be rendered
const pageNumber = 1;
const page = await pdfDoc.getPage(pageNumber);

// define the viewport for the specific area to be rendered
const viewport = page.getViewport({ scale: 1.0 });
const region = { x: 100, y: 100, width: 200, height: 200 };
viewport.width = region.width;
viewport.height = region.height;
viewport.transform = [
  region.width / viewport.width,
  0,
  0,
  region.height / viewport.height,
  -region.x,
  -region.y,
];

// render the specific area of the page
const canvas = document.createElement("canvas");
canvas.width = region.width;
canvas.height = region.height;
const ctx = canvas.getContext("2d");
const renderTask = page.render({ canvasContext: ctx, viewport });
await renderTask.promise;

const imageDataUrl = canvas.toDataURL();
