const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { CharacterTextSplitter } = require("langchain/text_splitter");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const client = new PineconeClient();
client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
});

const { main } = require("../utils/web.utils");

const createPineconeIndex = async (client, indexName, vectorDimension) => {
  // 1. Initiate index existence check
  console.log(`Checking "${indexName}"...`);
  // 2. Get list of existing indexes
  const existingIndexes = await client.listIndexes();
  // 3. If index doesn't exist, create it
  if (!existingIndexes.includes(indexName)) {
    // 4. Log index creation initiation
    console.log(`Creating "${indexName}"...`);
    // 5. Create index
    const createClient = await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: vectorDimension,
        metric: "cosine",
      },
    });
    // 6. Log successful creation
    console.log(`Created with client:`, createClient);
    // 7. Wait 60 seconds for index initialization
    await new Promise((resolve) => setTimeout(resolve, 60000));

    return createClient;
  } else {
    // 8. Log if index already exists
    console.log(`"${indexName}" already exists.`);

    return indexName;
  }
};

const updatePinecone = async (client, indexName, docs) => {
  try {
    console.log("Retrieving Pinecone index...");
    // 3. Retrieve Pinecone index
    const index = client.Index(indexName);
    // 4. Log the retrieved index name
    console.log(`Pinecone index retrieved: ${indexName}`);
    // 5. Process each document in the docs array
    for (const doc of docs) {
      console.log(`Processing document: ${doc.metadata.source}`);
      const txtPath = doc.metadata.source;
      const text = doc.pageContent;
      // 6. Create RecursiveCharacterTextSplitter instance
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
      });
      console.log("Splitting text into chunks...");
      // 7. Split text into chunks (documents)
      const chunks = await textSplitter.createDocuments([text]);
      console.log(`Text split into ${chunks.length} chunks`);
      console.log(
        `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
      );
      // 8. Create OpenAI embeddings for documents
      const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
        chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
      );
      console.log("Finished embedding documents");
      console.log(
        `Creating ${chunks.length} vectors array with id, values, and metadata...`
      );
      // 9. Create and upsert vectors in batches of 100
      const batchSize = 100;
      let batch = [];
      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const vector = {
          id: `${txtPath}_${idx}`,
          values: embeddingsArrays[idx],
          metadata: {
            ...chunk.metadata,
            loc: JSON.stringify(chunk.metadata.loc),
            pageContent: chunk.pageContent,
            txtPath: txtPath,
          },
        };
        batch.push(vector);
        // When batch is full or it's the last item, upsert the vectors
        if (batch.length === batchSize || idx === chunks.length - 1) {
          await index.upsert({
            upsertRequest: {
              vectors: batch,
            },
          });
          // Empty the batch
          batch = [];
        }
      }
      // 10. Log the number of vectors updated
      console.log(`Pinecone index updated with ${chunks.length} vectors`);
    }

    return true;

  } catch (error) {

    console.log(error);

    throw error;
  }
};

const updatePineconeNew = async (client, indexName, docs) => {
  try {
    console.log("Retrieving Pinecone index...");
    // 3. Retrieve Pinecone index
    const index = client.Index(indexName);
    // 4. Log the retrieved index name
    console.log(`Pinecone index retrieved: ${indexName}`);
    // 5. Process each document in the docs array
    for (const doc of docs) {
      console.log(`Processing document: ${doc.metadata.source}`);
      const txtPath = doc.metadata.source;
      const text = doc.pageContent;
      // 6. Create RecursiveCharacterTextSplitter instance
      const textSplitter = new CharacterTextSplitter({
        separator: "\n",
        chunkSize: 1000,
        chunkOverlap:200,
      });
      console.log("Splitting text into chunks...");
      // 7. Split text into chunks (documents)
      const chunks = await textSplitter.splitText(text);
      console.log(`Text split into ${chunks.length} chunks`);
      console.log(
        `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
      );
      // 8. Create OpenAI embeddings for documents
      const vectorStore = await PineconeStore.fromTexts(
        chunks,
        new OpenAIEmbeddings(),
        { pineconeIndex: index });
      // 10. Log the number of vectors updated
      console.log(`Pinecone index updated with ${chunks.length} vectors`);
    }

    return true;

  } catch (error) {

    console.log(error);

    throw error;
  }
};

const updatePineconeWithDataFromWebPages = async (client, indexName) => {
  console.log("Retrieving Pinecone index...");
  // 3. Retrieve Pinecone index
  const index = client.Index(indexName);
  // 4. Log the retrieved index name
  console.log(
    `Pinecone updatePineconeWithDataFromWebPages :: index retrieved: ${indexName} and index ${index}`
  );

  await main(index);
};

module.exports = {
  createPineconeIndex,
  updatePinecone,
  updatePineconeWithDataFromWebPages,
};
