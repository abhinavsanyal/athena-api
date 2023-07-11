const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { VectorDBQAChain }  = require('langchain/chains');
const { OpenAIEmbeddings }  = require("langchain/embeddings/openai");
const { OpenAI }  = require("langchain/llms/openai");
const { loadQAStuffChain }  = require("langchain/chains");
const { Document }  = require("langchain/document");
const { Calculator }  = require("langchain/tools/calculator");
const { initializeAgentExecutorWithOptions }  = require("langchain/agents");
const { ChainTool }  = require("langchain/tools");
const { PineconeClient } = require("@pinecone-database/pinecone");

const client = new PineconeClient();
client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
});

// const queryOpenAiAgent = async (userId, assistantId, messageInput) => {
//     try {
//         const index = client.Index(assistantId);
//         const llm = new OpenAI({
//             modelName: "gpt-4"
//         });
//         const vectorStore = await PineconeStore.fromExistingIndex(
//             new OpenAIEmbeddings(),
//             { pineconeIndex: index });

//         const chain = VectorDBQAChain.fromLLM(llm, vectorStore);

//         const chainTool = new ChainTool({
//             name: "company-docs-qa",
//             description:
//                 "use this tool when answering questions on spending money, withdrawal, expenditures, suppliers, vendors, bank statement, receipts, invoices, bank transactions or legal documents",
//             chain,
//         });

//         const tools = [
//             new Calculator(),
//             chainTool
//         ];

//         const executor = await initializeAgentExecutorWithOptions(tools, llm, {
//             agentType: "zero-shot-react-description",
//             verbose: true,
//         });

//         const result = await executor.call({ input: messageInput });

//         console.log({ result });

//         return result.output;
//     } catch (err) {
//         console.error('Error fetching QUERY:', err);
//         return "";
//     }
// };

const queryOpenAiAgent = async (userId, assistantId, messageInput) => {
    try {
        let bodyFormData = new FormData();
        bodyFormData.append('user_question', messageInput);
        const response = await axios.post('http://127.0.0.1:5000/user_input', bodyFormData, {
            headers: { "Content-Type": "multipart/form-data" }
        })

        return response.data;
    } catch (err) {
        console.error('Error fetching QUERY:', err);
        return "";
    }
};
module.exports = {
    queryOpenAiAgent,
};
