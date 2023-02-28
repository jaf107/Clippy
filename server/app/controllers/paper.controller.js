const db = require("../models");
const User = db.user;
const Paper = db.paper;
const cloudinary = require("cloudinary");
const axios = require("axios");
const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/";
const SERVER_ADDRESS = "http://localhost:8080";
const fs = require("fs");
var apiKey = "b93d9d2475ed072f999710c6949f6a65";
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const { OneAI } = require("oneai");
var endpoint = "https://api.meaningcloud.com/summarization-1.0";

class CitationNode {
  constructor(paperId, title, level) {
    this.paperId = paperId;
    this.title = title;
    this.level = level;
    this.citationChildren = [];
  }

  addCitation(citation) {
    this.citationChildren.push(citation);
  }
}

class CitationEdge {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}

class Title {
  constructor(titleText, titleIndex) {
    (this.titleText = titleText), (this.titleIndex = titleIndex);
  }
}

class Paragraph {
  constructor(title, text) {
    this.title = title;
    this.noOfSentences = 0;
    this.text = text;
    this.summaryText = "";
  }

  setNoOfSentences(noOfSentences) {
    this.noOfSentences = noOfSentences;
  }

  appendText(newtext) {
    this.text.appendText(newtext);
  }
}

exports.getPaperDetails = async (req, res) => {
  const ppr = await Paper.findOne({ paper_id: req.params.id });
  if (ppr) {
    if (req.userId) {
      updateHistory(req.userId, req.params.id, Date.now);
    }
    res.status(200).send(ppr);
  } else {
    res.status(404).send("Paper not found");
  }
};

exports.getPaperDetailsfromSemanticScholar = async (req, res) => {
  const paper_data = await axios
    .get(
      SEMANTIC_SCHOLAR_API +
        req.params.id +
        "?fields=isOpenAccess,openAccessPdf,title,abstract,citationCount,referenceCount,authors"
    )
    .catch((err) => res.status(404).send("Paper Not Found"));
  if (paper_data) res.status(200).send(paper_data.data);
};

exports.uploadPaper = async (req, res) => {
  if (!req.body.title || !req.file) {
    res.status(404).send("File and Title are required");
  } else {
    const paper_data = await axios.get(
      SEMANTIC_SCHOLAR_API +
        `search?query=${req.body.title}&limit=10&fields=title,abstract,isOpenAccess,openAccessPdf,citationCount,referenceCount,authors`
    );
    if (paper_data && paper_data.data) {
      const data = paper_data.data.data[0];
      const ppr = await Paper.findOne({ paper_id: data.paperId });
      if (ppr) {
        await fs.unlink(req.file.path, (err) => {
          if (err) throw err;
          console.log("successfully deleted");
        });
        res.status(200).send(ppr);
      } else {
        const paper = {
          paper_id: data.paperId,
          title: data.title,
          knowledge_graph: "",
          url: data.isOpenAccess ? data.openAccessPdf.url : "",
          abstract: data.abstract,
          abstractive_summary: "",
          extractive_summary: "",
          citationCount: data.citationCount,
          referenceCount: data.referenceCount,
          authors: data.authors,
        };
        await Paper.create(paper);
        await fs.unlink(req.file.path, (err) => {
          if (err) throw err;
          console.log("successfully deleted");
        });
        if (req.userId) {
          updateHistory(req.userId, paper.paper_id);
        }
        res.status(200).send(paper);
      }
    } else {
      const ppr = await Paper.findOne({ title: req.body.title });
      if (ppr) {
        await fs.unlink(req.file.path, (err) => {
          if (err) throw err;
          console.log("successfully deleted");
        });
        if (req.userId) {
          updateHistory(req.userId, ppr.paper_id);
        }
        res.status(200).send(ppr);
      } else {
        var uuid = Math.random().toString(36).substr(2, 9);
        fs.rename(req.file.path, "/upload/" + uuid + ".pdf", (err) => {
          if (err) throw err;
          console.log("File renamed successfully");
        });
        const paper = {
          paper_id: uuid,
          title: req.body.title,
          knowledge_graph: "",
          url: SERVER_ADDRESS + "/upload/" + uuid + ".pdf",
          abstract: "",
          abstractive_summary: "",
          extractive_summary: "",
          citationCount: 0,
          referenceCount: 0,
          authors: [],
        };
        await Paper.create(paper);
        if (req.userId) {
          updateHistory(req.userId, paper.paper_id);
        }
        res.status(200).send(paper);
      }
    }
  }
};

exports.searchPaperByTitle = async (req, res) => {
  const paper_data = await axios.get(
    SEMANTIC_SCHOLAR_API +
      `search?query=${req.body.title}&limit=10&fields=isOpenAccess,openAccessPdf`
  );

  if (paper_data) {
    res.status(200).send(JSON.stringify(paper_data.data));
  } else {
    res.status(404).send("Paper not found");
  }

  // .catch((err) => res.status(404).send("Paper Not Found"));
};

exports.searchPaperById = async (req, res) => {
  const ppr = await Paper.findOne({ paper_id: req.body.paper_id });
  if (ppr) {
    if (req.userId) {
      updateHistory(req.userId, req.body.paper_id, Date.now);
    }
    res.status(200).send(ppr);
  } else {
    const paper_data = await axios
      .get(
        SEMANTIC_SCHOLAR_API +
          req.body.paper_id +
          "?fields=isOpenAccess,openAccessPdf,title,abstract,citationCount,referenceCount,authors"
      )
      .catch((err) => res.status(404).send("Paper Not Found"));
    if (paper_data.data) {
      if (!paper_data.data.isOpenAccess || !paper_data.data.openAccessPdf)
        res.status(404).send("Paper Not Accessible");
      else {
        var paper = {
          title: paper_data.data.title,
          paper_id: req.body.paper_id,
          knowledge_graph: "",
          abstract: paper_data.data.abstract,
          url: paper_data.data.openAccessPdf.url,
          abstractive_summary: "",
          extractive_summary: "",
          citationCount: paper_data.data.citationCount,
          referenceCount: paper_data.data.referenceCount,
          authors: paper_data.data.authors,
        };
        await Paper.create(paper);
        if (req.userId) {
          updateHistory(req.userId, paper.paper_id);
        }
        res.status(200).send(paper);
      }
    }
  }
};
exports.getAbstractSummary = async (req, res) => {
  var paper = await Paper.findOne({ paper_id: req.params.id });
  if (paper) {
    if (paper.abstractive_summary !== "")
      res.status(200).send(paper.abstractive_summary);
    else {
      console.log(paper);
      let paragraphs = await createJsonObjectFromPdf(paper.url);
      let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      let absApiKey = "453265e9-a392-4e2b-aacc-ecc527a3f41f";

      for (let i = 0; i < paragraphs.length; i++) {
        let element = paragraphs[i];
        let contextString = element.text;
        let retryCount = 0;

        if (element.noOfSentences > 50) {
          noOfSentenceInSummary = parseInt(element.noOfSentences / 10);
        } else {
          noOfSentenceInSummary = parseInt(element.noOfSentences / 3);
        }

        while (retryCount < 3) {
          try {
            let summary = await requestAbsSummaryWithRetry(
              contextString,
              absApiKey,
              retryCount,
              noOfSentenceInSummary
            );
            paragraphs[i].summaryText = summary;
            break;
          } catch (error) {
            console.log(`Error: index ${i} ${error}`);
            retryCount++;
            await delay(1000);
          }
        }
      }
      const result = await Paper.updateOne(
        { paper_id: req.params.id },
        { $set: { abstractive_summary: JSON.stringify(paragraphs) } },
        { upsert: true }
      ).catch((err) => res.status(200).send(err));
      if (result) {
        res.status(200).send(JSON.stringify(paragraphs));
      }
    }
  } else {
    res.status(404).send("Paper not found");
  }
};

exports.getCitation = async (req, res) => {
  const rootPaperId = req.params.id;
  var paperInDB = await Paper.findOne({ paper_id: rootPaperId });
  if (paperInDB && paperInDB.knowledge_graph != "") {
    res.status(200).send(JSON.parse(paperInDB.knowledge_graph));
  } else {
    var citationResponse = await axios
      .get(SEMANTIC_SCHOLAR_API + `${rootPaperId}?fields=title,citations`)
      .catch((err) => res.status(404).send(err));
    let rootNodeTitle = citationResponse.data.title;
    let rootCitationData = citationResponse.data.citations;
    var rootNode = new CitationNode(rootPaperId, rootNodeTitle, 0);
    let edgeList = [];
    let rootEdge = new CitationEdge("-1", rootNode);
    edgeList.push(rootEdge);
    let nodeArray = [];
    nodeArray.push(rootNode);
    let runningNode = rootNode;
    let runningUrl = ``;
    while (nodeArray.length != 0) {
      runningNode = nodeArray[0];
      if (runningNode.level > 1) {
        break;
      }
      paperId = runningNode.paperId;
      runningUrl = SEMANTIC_SCHOLAR_API + `${paperId}?fields=title,citations`;
      var runningCitationResponse = await axios
        .get(runningUrl)
        .catch((err) => res.status(404).send(err));
      citationChildren = runningCitationResponse.data.citations;
      citationChildren
        .filter((element) => element.paperId != null)
        .forEach((element) => {
          let paperId = element.paperId;
          let paperTitle = element.title;
          let paperLevel = runningNode.level + 1;
          let citationNode = new CitationNode(paperId, paperTitle, paperLevel);
          if (nodeArray.length < 11) nodeArray.push(citationNode);
          edgeList.push(new CitationEdge(runningNode, citationNode));
        });
      nodeArray.shift();
    }
    const result = await Paper.updateOne(
      { paper_id: rootPaperId },
      { $set: { knowledge_graph: JSON.stringify(edgeList) } },
      { upsert: true }
    ).catch((err) => res.status(200).send(err));
    if (result) {
      res.status(200).send(JSON.stringify(edgeList));
    }
  }
};

async function updateHistory(userId, paper_id) {
  // Find the document that matches the paper_id in the history array
  let doc = await User.findOne({ _id: userId, "history.paper_id": paper_id });
  // If the document exists, update the openedAt field for that paper_id
  if (doc) {
    await User.updateOne(
      { _id: userId, "history.paper_id": paper_id },
      { $set: { "history.$.openedAt": Date.now() } }
    );
    console.log("Updated time for paper_id", paper_id);
  } else {
    // If the document doesn't exist, push a new document to the history array with the paper_id and newTime
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          history: { paper_id: paper_id, openedAt: Date.now() },
        },
      },
      { upsert: true }
    );
    console.log("Pushed new data for paper_id", paper_id);
  }
}

async function requestAbsSummaryWithRetry(
  contextString,
  absApiKey,
  retryCount,
  noOfSentenceInSummary
) {
  const oneai = new OneAI(absApiKey, {
    multilingual: true,
  });

  const pipeline = new oneai.Pipeline(
    oneai.skills.summarize({ min_length: noOfSentenceInSummary })
  );

  async function absTesting() {
    let demo = await pipeline.run(contextString);
    return demo.summary.text;
  }

  return await absTesting();
}

async function createJsonObjectFromPdf(src) {
  let { textChunkArray: arr } = await getPdfTextContent(src);
  arr = arr.flat();

  heights = [];
  arr.forEach((element) => {
    heights.push(element.height);
  });
  allHeights = heights;

  const uniqueHeight = new Set(heights);

  heights = Array.from(uniqueHeight);
  sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

  heightsCounter = new Array(heights.length).fill(0);
  allHeights.forEach((element) => {
    for (var i = 0; i < heights.length; i++) {
      if (heights[i] === element) {
        heightsCounter[i]++;
      }
    }
  });

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

  let titleHeight = heights[titleHeightIndex];
  let generalTextHeight = heights[generalTextHeightIndex];

  let wiggleHeight = heights[generalTextHeightIndex] - 1;

  arr.forEach((element) => {});

  arr = arr.filter((element) => element.height > wiggleHeight);
  let paragraphs = [];
  let isAbstract = false;
  let maxLimit = arr.length;

  for (let i = 0; i < maxLimit; i++) {
    if (arr[i].height == titleHeight && arr[i].str.includes("References")) {
      let referanceText = "";
      let j = i;
      if (j < maxLimit) j++;
      while (j < maxLimit) {
        referanceText += arr[j].str;
        j++;
      }

      let referanceParagraph = new Paragraph("References", referanceText);
      paragraphs.push(referanceParagraph);
      break;
    }
    if (arr[i].str.includes("Abstract")) {
      isAbstract = true;
      let abstractTextTitle = arr[i].str;
      let abstractTextHeight = arr[i].height;
      let titleIterator = i;

      while (arr[titleIterator].height == abstractTextHeight) {
        abstractTextTitle += arr[titleIterator].str;
        titleIterator++;
      }
      i = titleIterator - 1;
      let abstractText = "";

      if (i < maxLimit) i++;
      while (i < maxLimit && arr[i].height != titleHeight) {
        console.log(arr[i].str);
        abstractText += arr[i].str;
        i++;
      }
      i--;
      let abstractParagraph = new Paragraph("Abstract", abstractText);
      paragraphs.push(abstractParagraph);
    }
    if (arr[i].height == titleHeight && isAbstract) {
      let titleString = arr[i].str;
      let titleIterator = i + 1;

      while (arr[titleIterator].height == titleHeight) {
        if (titleString === "") {
          titleString += arr[titleIterator].str;
        } else {
          titleString += " ";
          titleString += arr[titleIterator].str;
        }
        titleIterator++;
      }
      i = titleIterator;
      i--;
      if (i + 1 < maxLimit) i++;
      let genText = "";
      while (i < maxLimit && arr[i].height != titleHeight) {
        if (arr[i].height == generalTextHeight) genText += arr[i].str;
        i++;
      }
      i--;
      let newPara = new Paragraph(titleString, genText);
      paragraphs.push(newPara);
      titleString = "";
      genText = "";
    }
  }

  paragraphs.map((element) => {
    let sentenceNo = noOfSentences(element.text);
    element.setNoOfSentences(sentenceNo);
  });
  return paragraphs;
}

async function getPdfTextContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const totalPageCount = doc.numPages;
  doc.getDestination;
  let textChunkArray = [];
  heights = [];

  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    textChunkArray.push(getTextChunkObject(textContent));
    writeUniqueHeights(heights, textContent);
  }
  const uniqueHeight = new Set(heights);
  heights = Array.from(uniqueHeight);
  sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

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
