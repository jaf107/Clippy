const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");

async function getPdfTextContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const totalPageCount = doc.numPages;

  // console.log(doc);

  // clear the text file //
  fs.truncateSync("./output.txt", 0);
  fs.truncateSync("./object.txt", 0);

  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    writeToFile("./output.txt", textContent, i);
    writeObjectToFile("./object.txt", textContent, i);
  }
}

function writeObjectToFile(filePath, content, pageNo) {
  let data = `page No: ${pageNo} \n===============\n`;
  let pos = 0;
  const items = content.items.map((item) => {
    let style = content.styles[item.fontName];
    data += `item no ${pos}
    ------------------------
    item.str=${item.str}
    item.dir=${item.dir}
    item.width=${item.width}
    item.height=${item.height}
    item.transforme=${item.transform}
    item.hasEOL=${item.hasEOL}
    item.fontName=${style.fontFamily}
    content.styles object for this chuk
    ${JSON.stringify(style)}
    --------------------------------\n`;
    pos++;
  });

  data += `\n`;
  fs.appendFileSync(filePath, data);
}

function writeToFile(filePath, content, pageNo) {
  let data = `page No: ${pageNo} \n===============\n`;
  const items = content.items.map((item) => {
    data += item.str + `\n`;
  });
  data += `\n`;
  fs.appendFileSync(filePath, data);
}

getPdfTextContent("./icse-template.pdf");
