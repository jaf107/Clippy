const db = require("../models");
const User = db.user;
const Paper = db.paper;
const cloudinary = require("cloudinary");
const axios = require("axios");
const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/";
const fs = require("fs");

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

exports.getPaperDetails = async (req, res) => {
  const ppr = await Paper.findOne({ paper_id: req.params.id });
  if (ppr) {
    res.status(200).send(ppr);
  } else {
    res.status(404).send("Paper not found");
  }
};

exports.uploadPaper = async (req, res, next) => {
  if (!req.file) {
    res.status(404).send("File is required");
  } else {
    var uuid = Math.random().toString(36).substr(2, 9);
    fs.rename(req.file.path, "./uploads/" + uuid + ".pdf", (err) => {
      if (err) throw err;
      console.log("File renamed successfully");
    });
    const paper = {
      paper_id: uuid,
      title: "",
      knowledge_graph: "",
      url: "/uploads/" + uuid + ".pdf",
      abstract: "",
    };
    await Paper.create(paper);
    if (req.userId) {
      updateHistory(req.userId, paper.paper_id, Date.now);
    }
    res.status(200).send(paper);
  }
  // }
};

exports.searchPaperByTitle = async (req, res) => {
  const paper_data = await axios
    .get(
      SEMANTIC_SCHOLAR_API +
        `search?query=${req.body.title}&fields=isOpenAccess,openAccessPdf`
    )
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => res.status(404).send("Paper Not Found"));
};

exports.searchPaperById = async (req, res) => {
  const paper_data = await axios
    .get(
      SEMANTIC_SCHOLAR_API +
        req.body.paper_id +
        "?fields=isOpenAccess,openAccessPdf,title,abstract"
    )
    .catch((err) => res.status(404).send("Paper Not Found"));
  if (paper_data.data) {
    const ppr = await Paper.findOne({ paper_id: paper_data.data.paperId });
    if (ppr) {
      if (req.userId) {
        updateHistory(req.userId, paper.paper_id, Date.now);
      }
      res.status(200).send(ppr);
    } else {
      if (!paper_data.data.isOpenAccess || !paper_data.data.openAccessPdf)
        res.status(404).send("Paper Not Accessible");
      else {
        var paper = {
          title: paper_data.data.title,
          paper_id: req.body.paper_id,
          public_id: result.public_id,
          knowledge_graph: "",
          abstract: paper_data.data.abstract,
          url: paper_data.data.openAccessPdf.url,
        };
        await Paper.create(paper);
        if (req.userId) {
          updateHistory(req.userId, paper.paper_id, Date.now);
        }
        res.status(200).send(paper);
      }
    }
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

async function updateHistory(userId, paper_id, newTime) {
  // Find the document that matches the paper_id in the history array
  let doc = await User.findOne({ _id: userId, "history.paper_id": paper_id });
  // If the document exists, update the openedAt field for that paper_id
  if (doc) {
    await User.updateOne(
      { _id: userId, "history.paper_id": paper_id },
      { $set: { "history.$.openedAt": newTime } }
    );
    console.log("Updated time for paper_id", paper_id);
  } else {
    // If the document doesn't exist, push a new document to the history array with the paper_id and newTime
    await User.updateOne(
      { _id: userId },
      { $push: { history: { paper_id: paper_id, openedAt: newTime } } },
      { upsert: true }
    );
    console.log("Pushed new data for paper_id", paper_id);
  }
}
