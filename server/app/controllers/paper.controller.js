const db = require("../models");
const User = db.user;
const Paper = db.paper;
const cloudinary = require("cloudinary");
const axios = require("axios");
const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/";
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
const fetch = require('node-fetch');

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

exports.uploadPaper = async (req, res) => {
  const result = await cloudinary.v2.uploader
    .upload(req.params.id, {
      folder: "papers",
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  var paper = {
    user_id: req.userId,
    public_id: result.public_id,
    url: result.secure_url,
  };
  await Paper.create(paper);
  res.status(200).send("Paper Added");
};

exports.uploadPaperById = async (req, res) => {
  const ppr = await Paper.find((e) => e.paper_id === req.body.paper_id);
  if (ppr) {
    res.status(200).send(paper);
  } else {
    const paper_data = await axios
      .get(
        SEMANTIC_SCHOLAR_API +
          req.body.paper_id +
          "?fields=isOpenAccess,openAccessPdf"
      )
      .catch((err) => res.status(404).send("Paper Not Found"));

    if (paper_data.data) {
      if (!paper_data.data.isOpenAccess || !paper_data.data.openAccessPdf)
        res.status(404).send("Paper Not Accessible");
      else {
        const result = await cloudinary.v2.uploader
          .upload(paper_data.data.openAccessPdf.url, {
            folder: "papers",
          })
          .catch((err) => res.status(500).send(err));

        if (result) {
          var paper = {
            // user_id: req.userId,
            paper_id: req.body.paper_id,
            public_id: result.public_id,
            url: result.secure_url,
          };
          await Paper.create(paper);
          res.status(200).send(paper);
        }
      }
    }
  }
};

exports.getCitation = async (req, res) => {
  const rootPaperId = req.params.id;
  var paperInDB = await Paper.findOne({ paper_id: rootPaperId });
  if (paperInDB.knowledge_graph) {
    res.status(200).send(knowledgeGraph);
  } else {
    var citationResponse = await axios.get(
      SEMANTIC_SCHOLAR_API + `${rootPaperId}?fields=title,citations`
    );
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
      var runningCitationResponse = await axios.get(runningUrl);
      citationChildren = runningCitationResponse.data.citations;
      citationChildren
        .filter((element) => element.paperId != null)
        .forEach((element) => {
          let paperId = element.paperId;
          let paperTitle = element.title;
          let paperLevel = runningNode.level + 1;
          let citationNode = new CitationNode(paperId, paperTitle, paperLevel);
          nodeArray.push(citationNode);
          edgeList.push(new CitationEdge(runningNode, citationNode));
        });
      nodeArray.shift();
    }

    console.log(edgeList);
    // const result = await Paper.findOneAndUpdate(
    //   { paper_id: rootPaperId },
    //   { $set: { knowledge_graph: edgeList } },
    //   { upsert: true }
    // ).catch((err) => res.status(200).send(err));
    // if (result) {
    //   res.status(200).send(edgeList);
    // }
  }
};

exports.getReferenceList = async (req, res) => {
  console.log('called')
  let pdfUrl = req.body.url;
  //https://res.cloudinary.com/dpf3hdncd/image/upload/v1677416689/papers/xushnozuswrczvz9tsvh.pdf
  const pdfData = await fetch(pdfUrl).then(res => res.arrayBuffer());
  console.log('pdfdata: ',pdfData)
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const anotationslist = [];
  console.log('pdf: ',pdf)
  // Iterate through all pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    
    // Get annotations from page
    const annotations = await page.getAnnotations();

    // Print annotations to console
    console.log(`Page ${i} annotations: `, annotations);
    anotationslist.push(...annotations)
  }
  res.send(anotationslist)
}
