const injestionService = require("../services/injestion.service");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");

const documentPath = __dirname + "/../documents/";

const initiateInjection = async (req, res) => {
  try {
    const audioFile = req.file;
    let bodyFormData = new FormData();

    bodyFormData.append("pdf_docs", audioFile.buffer, audioFile.originalname);
    const response = await axios.post(
      "http://127.0.0.1:5000/upload_files",
      bodyFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    // const loader = new DirectoryLoader(documentPath, {
    //   ".txt": (path) => new TextLoader(path),
    //   ".pdf": (path) => new PDFLoader(path),
    // });

    // const docs = await loader.load();
    // const indexName = "sensai";
    // const vectorDimension = 1536;
    // const client = new PineconeClient();
    // await client.init({
    //   apiKey: process.env.PINECONE_API_KEY,
    //   environment: process.env.PINECONE_ENVIRONMENT,
    // });

    // await injestionService.createPineconeIndex(
    //   client,
    //   indexName,
    //   vectorDimension
    // );

    // await injestionService.updatePineconeNew(client, indexName, docs);

    res.status(200).json({ message: "Success", data: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed!", error });
  }
};

const initiateWebInjestion = async (req, res) => {
  try {
    const { urls } = req.body;

    const indexName = "sensai";
    const vectorDimension = 1536;
    const client = new PineconeClient();

    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    await injestionService.createPineconeIndex(
      client,
      indexName,
      vectorDimension
    );

    await injestionService.updatePineconeWithDataFromWebPages(
      client,
      indexName,
      urls
    );

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed", error });
  }
};

module.exports = {
  initiateInjection,
  initiateWebInjestion
};
