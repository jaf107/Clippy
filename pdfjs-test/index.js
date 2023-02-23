const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");

class Paragraph {
  constructor(title, text) {
    this.title = title;
    this.text = text;
  }

  appendText(newtext) {
    this.text.appendText(newtext);
  }
}

/**
 * Extarct texts from a pdf file
 * @param {string} src
 */
async function getPdfTextContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const totalPageCount = doc.numPages;

  // clear the text file //
  fs.truncateSync("./output.txt", 0);
  fs.truncateSync("./object.txt", 0);

  let textChunkArray = [];
  heights = [];

  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    textChunkArray = textChunkArray.concat(getTextChunkObject(textContent));
    writeToFile("./output.txt", textContent, i);
    writeObjectToFile("./object.txt", textContent, i);
    writeUniqueHeights(heights, textContent);
  }

  // heights.sort();

  // console.log(sortedHeights);
  /* sortedHeights.forEach((element) => {
    fs.appendFileSync(
      "./heights.txt",
      JSON.stringify(element) + "\n",
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  }); */

  // fs.appendFileSync("./heights.txt", JSON.stringify(height));
  return textChunkArray;
}

function writeUniqueHeights(heights, content) {
  const items = content.items.map((item) => {
    heights.push(item.height);
  });
}

function getTextChunkObject(content) {
  let retItems = content.items.map((item) => {
    return {
      ...item,
      style: content.styles[item.fontName],
    };
  });
  return retItems;
}

function writeObjectToFile(filePath, content, pageNo) {
  let data = `page No: ${pageNo} \n===============\n`;
  let pos = 0;

  const items = content.items.map((item) => {
    let style = content.styles[item.fontName];
    // console.log(item, style);

    heights.push(item.height);

    data += `item no ${pos}
    ------------------------
    item.str=${item.str}
    item.dir=${item.dir}
    item.width=${item.width}
    item.height=${item.height}
    item.transforme=${item.transform}
    item.hasEOL=${item.hasEOL}
    item.fontName=${style.fontFamily}
    
    content.styles object for this chunk
    ${JSON.stringify(style)}
    --------------------------------\n`;
    pos++;
  });

  data += `\n`;

  // fs.appendFileSync("./heights.txt", uniqueHeight);
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

async function createJsonObjectFromPdf() {
  // let doc = await getPdfTextContent("./sample3.pdf");
  const doc = await pdfjs.getDocument("./sample1.pdf").promise;

  const totalPageCount = doc.numPages;

  heights = [];
  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);

    const textContent = await page.getTextContent();

    writeUniqueHeights(heights, textContent);
  }
  // console.log(heights);
  allHeights = heights;

  const uniqueHeight = new Set(heights);

  heights = Array.from(uniqueHeight);
  sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

  heightsCounter = new Array(heights.length).fill(0);
  allHeights.forEach((element) => {
    for (var i = 0; i < heights.length; i++) {
      // console.log(typeof element + typeof heights[i]);
      if (heights[i] === element) {
        heightsCounter[i]++;
      }
    }
  });

  for (var i = 0; i < heights.length; i++) {
    console.log(heights[i] + " " + heightsCounter[i]);
  }

  let titleHeightIndex = 0;
  let generalTextHeightIndex = 0;

  let tempMax = -1;
  for (var i = 0; i < heights.length; i++) {
    if (heightsCounter[i] > heightsCounter[generalTextHeightIndex]) {
      generalTextHeightIndex = i;
    }
  }
  tempMax = -1;
  for (var i = 0; i < generalTextHeightIndex; i++) {
    if (heightsCounter[i] > heightsCounter[titleHeightIndex]) {
      titleHeightIndex = i;
    }
  }

  console.log("Title index is " + titleHeightIndex);
  console.log("General Text index is " + generalTextHeightIndex);

  // Figure out the most occuring text chunk ~ general text
  // Identify text and title chunks
  // append them

  // extract them out
  // make a JSON object for summarization
}

createJsonObjectFromPdf();
