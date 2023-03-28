import * as pdfjs from 'pdfjs-dist';

async function getPdfTextContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const totalPageCount = doc.numPages;
  doc.getDestination;
  // clear the text file //
  let textChunkArray = [];
  let heights = [];

  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    textChunkArray.push(getTextChunkObject(textContent));
    getUniqueHeights(heights, textContent);
  }
  const uniqueHeight = new Set(heights);
  heights = Array.from(uniqueHeight);
  return { textChunkArray, uniqueHeight };
}

function getUniqueHeights(heights, content) {
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

function extractKeywordFromStr(chunkStr, type) {
  chunkStr = chunkStr.toLowerCase();
  let startingIndex = chunkStr.indexOf(type);
  let textStr = '';
  for (let i = startingIndex; i < chunkStr.length; i++) textStr += chunkStr[i];
  let splittedArr = textStr.split(' ');
  textStr = splittedArr[0] + ' ' + splittedArr[1];
  return textStr;
}

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9 =_\/+\-:.,;'"“”<>#@?!%&()*{}\[\]$]+$/.test(str);
}

export async function getManualReferences(src: any) {
  let { textChunkArray: arr, uniqueHeight: heights } = await getPdfTextContent(
    src
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
      if (item.str.toLowerCase().includes('table')) {
        if (
          index + 1 < array.length &&
          Math.abs(item.transform[5] - array[index + 1].transform[5]) >= 25
        ) {
          captionType = 'table';
          let xPos = item.transform[4];
          if (xPos - 300 > 15 || xPos - 50 > 15) {
            let tempX = -1;
            if (item.transform[4] < 300) {
              tempX = 25;
            } else tempX = 280;

            finalOut.push({
              str: extractKeywordFromStr(item.str, captionType),
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
        (item.str.toLowerCase().includes('fig') ||
          item.str.toLowerCase().includes('figure'))
      ) {
        if (710 - item.transform[5] >= 50) {
          let tempX = -1;

          if (item.str.toLowerCase().includes('fig')) captionType = 'fig';
          else if (item.str.toLowerCase().includes('figure'))
            captionType = 'figure';

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
        (array[index + 1].str.toLowerCase().includes('fig') ||
          array[index + 1].str.toLowerCase().includes('figure')) &&
        index != 0
      ) {
        if (Math.abs(array[index + 1].transform[5] - item.transform[5]) >= 70) {
          let tempHeight, tempY, tempX;

          if (array[index + 1].str.toLowerCase().includes('fig'))
            captionType = 'fig';
          else if (array[index + 1].str.toLowerCase().includes('figure'))
            captionType = 'figure';

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
  return finalOut;
}
