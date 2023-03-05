const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const pdfLinkService = require("pdfjs-dist/lib/web/pdf_link_service");
const fs = require("fs");

/**
 * Extarct texts from a pdf file
 * @param {string} src
 */
async function getPdfTextContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const totalPageCount = doc.numPages;
  doc.getDestination;
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
  sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

  // sortedHeights.forEach((element) => {
  //   fs.appendFileSync(
  //     "./heights.txt",
  //     JSON.stringify(element) + "\n",
  //     (err) => {
  //       if (err) {
  //         throw err;
  //       }
  //     }
  //   );
  // });

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
    "./sample69.pdf"
  );
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

  // Filter page chunk for regular text chunks
  let finalOut = [];
  for (let pageIndex = 0; pageIndex < arr.length; pageIndex++) {
    let regularText = arr[pageIndex].filter(
      (item) =>
        item.height < max.height + 0.7 &&
        item.height > max.height - 0.7 &&
        isAlphanumeric(item.str)
    );

    let captionType;
    regularText.map((item, index, array) => {
      // Table
      if (item.str.toLowerCase().includes("table")) {
        if (
          index + 1 < array.length &&
          Math.abs(item.transform[5] - array[index + 1].transform[5]) >= 25
        ) {
          captionType = "table";
          let xPos = item.transform[4];
          if (xPos - 300 > 15 || xPos - 50 > 15) {
            let tempX = -1;
            if (item.transform[4] < 300) {
              tempX = 25;
            } else tempX = 280;

            finalOut.push({
              str: extractKeywordFromStr(item.str, "table"),
              page: pageIndex + 1,
              height: 250,
              width: 580,
              x: tempX,
              y: item.transform[5],
            });
          }
        }
      }

      // For figure
      else if (
        index == 0 &&
        (item.str.toLowerCase().includes("fig") ||
          item.str.toLowerCase().includes("figure"))
      ) {
        if (710 - item.transform[5] >= 50) {
          let tempX = -1;

          if (item.str.toLowerCase().includes("fig")) captionType = "fig";
          else if (item.str.toLowerCase().includes("figure"))
            captionType = "figure";

          if (item.transform[4] < 280) {
            tempX = 25;
          } else tempX = 280;

          finalOut.push({
            str: extractKeywordFromStr(item.str, captionType),
            page: pageIndex + 1,
            height: 750 - item.transform[5],
            width: 580,
            x: tempX,
            y: 750,
          });
        }
      } else if (
        index + 1 < array.length &&
        (array[index + 1].str.toLowerCase().includes("fig") ||
          array[index + 1].str.toLowerCase().includes("figure")) &&
        index != 0
      ) {
        if (Math.abs(array[index + 1].transform[5] - item.transform[5]) >= 70) {
          let tempHeight, tempY, tempX;

          if (array[index + 1].str.toLowerCase().includes("fig"))
            captionType = "fig";
          else if (array[index + 1].str.toLowerCase().includes("figure"))
            captionType = "figure";

          if (item.transform[5] - array[index + 1].transform[5] > 0) {
            tempHeight = item.transform[5] - array[index + 1].transform[5];
            tempY = item.transform[5];
          } else {
            tempHeight = 750 - array[index + 1].transform[5];
            tempY = 750;
          }

          if (array[index + 1].transform[4] < 280) {
            tempX = 25;
          } else tempX = 280;

          finalOut.push({
            str: extractKeywordFromStr(array[index + 1].str, captionType),
            page: pageIndex + 1,
            height: tempHeight,
            width: 580,
            x: tempX,
            y: tempY,
          });
        }
      }
    });
  }
  writeChunksArrayToFile("./finalOut.json", finalOut);
}
wrapper();

function extractKeywordFromStr(chunkStr, type) {
  chunkStr = chunkStr.toLowerCase();
  let startingIndex = chunkStr.indexOf(type);
  let textStr = "";
  for (let i = startingIndex; i < chunkStr.length; i++) textStr += chunkStr[i];
  let splittedArr = textStr.split(" ");
  textStr = splittedArr[0] + " " + splittedArr[1];
  return textStr;
}

async function test() {
  const { textChunkArray: pdfChunks, uniqueHeight: heights } =
    await getPdfTextContent("./sample4.pdf");
  // console.log("dhukse", pdfChunks);

  function getPageHeight(pdfChunks) {
    let max = 0;
    pdfChunks.map((pageChunks, pageIndex) => {
      let lastChunkIndex = pageChunks.length - 1;
      console.log(
        "page NO:",
        pageIndex + 1,
        "Chunks in a page:",
        pageChunks.length,
        "starting chunk height:",
        pageChunks[0].height,
        "starting chunk y:",
        pageChunks[0].transform[5],
        "last chunk y:",
        pageChunks[lastChunkIndex].transform[5],
        "y diffrence:",
        pageChunks[0].transform[5] - pageChunks[lastChunkIndex].transform[5]
      );
    });
  }

  function getMaxChunkDistanceInAPage(pageChunks) {
    let maxDis = 0;
    for (let i = 1; i < pageChunks.length; i++) {
      let dis = Math.abs(
        pageChunks[i].transform[5] - pageChunks[i - 1].transform[5]
      );
      if (dis > maxDis) maxDis = dis;
    }
    return maxDis;
  }

  getPageHeight(pdfChunks);
}
// test();

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9 =_\/+\-:.,;'"“”<>#@?!%&()*{}\[\]$]+$/.test(str);
}
