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
    "./sample6.pdf"
  );
  // arr[2];
  let threshholdDistance = 90;
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
  console.log(max);

  // Filter page chunk for regular text chunks
  let regularText = arr[6].filter(
    (item) =>
      item.height < max.height + 0.7 &&
      item.height > max.height - 0.7 &&
      isAlphanumeric(item.str)
  );

  // let regularText = arr[1].filter((item) => item.height === max.height);
  writeChunksArrayToFile("./chunks.json", arr);
  writeChunksArrayToFile("./chunksWithEOL.json", regularText);


  // General Rules For finding figures, tables

  /* 1. Find the keyword (table, figure)
   2. Then find the distance (x, y) of the particulur chunk with prev and next chunk
   3. Return max(y) , x,y,height
   **/

  // Filter the starting chunk of the image

  // x:  35,
  // y:750,

  let temp = {
   page : 1,
    height: 0,
    weight: 0,
    x: 0,
    y: 0
  };



  let finalOut = [];
  let k =0;

  let chunkBeforeImage = regularText.filter((item, index, array) => {
    //  index++;
    // Table
    if (item.str.toLowerCase().includes('table')) {
      if (
        index + 1 < array.length &&
        Math.abs(item.transform[5] - array[index + 1].transform[5]) >= 20
      ) {
        temp.page = 9;   // Need to update the value
        temp.height = 250;
        temp.weight = 580;
        if(item.transform[4]<300)
        {
          temp.x = 25;
        } else temp.x = 280;
        temp.y = item.transform[5];

        finalOut.push(temp);

        console.log("Index " + index + " er  start chunk: " +
          item.str + // start chuk
          "Last chunk:  " +
          array[index + 1].str, // end chunk
          item.transform[5] - array[index + 1].transform[5] // height of the image
        );
        return true;
      } else return false;
    }

    // For figure
 
    if (index == 0 && item.str.toLowerCase().includes('figure')) {
      console.log("index 0 paise");
      if (750 - item.transform[5]  >= 30) {
        // To show the starting part of image
        item.transform[5] = 750;

       temp.page = 9;   // Need to update the value
       temp.height = item.transform[5] - array[0].transform[5];
       temp.weight = 580;
        if(item.transform[4]<280)
        {
         temp.x = 25;
        } else temp.x = 280;
       temp.y = item.transform[5];

       finalOut.push(temp);

        console.log("Index " + index + " er  start chunk: " +
          item.str + // start chunk
          "Last chunk:  " +
          array[0].str, // end chunk
          item.transform[5] - array[0].transform[5] // height of the image
        );
        return true;
      }
    }

    else if ( index+1 < array.length && array[index+1].str.toLowerCase().includes('figure') && index!=0 ) {

        if ( Math.abs(array[index + 1].transform[5] - item.transform[5] )>= 60) {
          // If we find the previous chunk in the bottom of 
          if (item.transform[5]<100) item.transform[5] = 750;
          console.log("Index " + index + " er  start chunk: " +
            item.str + // start chuk
            "Last chunk:  " +
            array[index + 1].str, // end chunk
            item.transform[5] - array[index + 1].transform[5] // height of the image
          );

          
       temp.page = 9;   // Need to update the value
       temp.height = item.transform[5] - array[0].transform[5];
       temp.weight = 580;
        if(item.transform[4]<280)
        {
         temp.x = 25;
        } else temp.x = 280;
       temp.y = item.transform[5];

       finalOut.push(temp);

          return true;
        } else return false;
      
    }

  });



  writeChunksArrayToFile("./out.json", chunkBeforeImage);
  writeChunksArrayToFile("./finalOut.json", finalOut);
}
wrapper();

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
