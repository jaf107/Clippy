const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");

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
    textChunkArray.push(getTextChunkObject(textContent));
    writeToFile("./output.txt", textContent, i);
    writeObjectToFile("./object.txt", textContent, i);
    writeUniqueHeights(heights, textContent);
  }
  const uniqueHeight = new Set(heights);
  heights = Array.from(uniqueHeight);
  // console.log(uniqueHeight);
  // heights.sort();
  sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

  // console.log(sortedHeights);
  sortedHeights.forEach((element) => {
    fs.appendFileSync(
      "./heights.txt",
      JSON.stringify(element) + "\n",
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  });

  // fs.appendFileSync("./heights.txt", JSON.stringify(height));
  return { textChunkArray, uniqueHeight };
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

function writeChunksArrayToFile(filepath, chunksArray) {
  fs.truncateSync(filepath, 0);
  fs.appendFileSync(filepath, JSON.stringify(chunksArray), (err) => {
    if (err) {
      throw err;
    }
  });
}

async function wrapper() {
  let { textChunkArray: arr, uniqueHeight: heights } = await getPdfTextContent(
    "./sample2.pdf"
  );
  // arr[2];
  let threshholdDistance = 90;
  // let chunkWithEOL = arr[5].filter((item, index, arr) => {
  //   if (index === 0 && item.height === 0 && item.width === 0) {
  //     return true;
  //   }
  //   return (
  //     index + 1 < arr.length &&
  //     index + 2 < arr.length &&
  //     arr[index + 1].height === 0 &&
  //     arr[index + 1].width === 0 &&
  //     item.transform[5] - arr[index + 2].transform[5] >= threshholdDistance
  //   );
  // });
  // writeChunksArrayToFile("./chunks.json", arr);
  // writeChunksArrayToFile("./chunksWithEOL.json", chunkWithEOL);
  let freq = Array.from(heights).map((item) => {
    return { height: item, count: 0 };
  });
  arr.map((page) => {
    page.map((chunk) => {
      for (let i = 0; i < freq.length; i++) {
        if (freq[i].height == chunk.height) freq[i].count++;
      }
    });
  });
  let max = freq[0];
  for (let i = 1; i < freq.length; i++) {
    if (max.count < freq[i].count && freq[i].height > 0) max = freq[i];
  }
  console.log(freq);

  let regularText = arr[1].filter(
    (item) =>
      item.height < max.height + 1 &&
      item.height > max.height - 1 &&
      isAlphanumeric(item.str)
  );

  // let regularText = arr[1].filter((item) => item.height === max.height);
  writeChunksArrayToFile("./chunksWithEOL.json", regularText);

  let chunkBeforeImage = regularText.filter((item, index, array) => {
    if (
      index + 1 < array.length &&
      Math.abs(item.transform[5] - array[index + 1].transform[5]) >=
        threshholdDistance
    ) {
      console.log(
        item.str,
        array[index + 1].str,
        item.transform[5] - array[index + 1].transform[5]
      );
      return true;
    } else return false;
  });
  writeChunksArrayToFile("./out.json", chunkBeforeImage);
}
wrapper();

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9 :.,;?!%&()*{}\[\]$]+$/.test(str);
}

// console.log(isAlphanumeric("Figuer 1: 100% coverage. arr[1$*]"));
