const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { SerpAPI } = require("langchain/tools");
const { Calculator } = require("langchain/tools/calculator");


const agentController = { };

agentController.runConversationalAgentWithText = async (humanMessage) => {
  process.env.LANGCHAIN_HANDLER = "langchain";
  const model = new ChatOpenAI({ temperature: 0 , openAIApiKey: process.env.OPEN_AI_KEY});
  const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: "Austin,Texas,United States",
      hl: "en",
      gl: "us",
    }),
    new Calculator(),
  ];
  // Passing "chat-conversational-react-description" as the agent type
  // automatically creates and uses BufferMemory with the executor.
  // If you would like to override this, you can pass in a custom
  // memory option, but the memoryKey set on it must be "chat_history".
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "chat-zero-shot-react-description",
    verbose: true,
  });
  console.log("Loaded agent.");
  try{
  const response = await executor._call({input:humanMessage});
  return response;
  console.log("Response::",response);
  } catch(e){
    console.log("Error::",e);
  }
};
module.exports = agentController;

// const { ChatOpenAI } = require("langchain/chat_models/openai");
// const { initializeAgentExecutorWithOptions } = require("langchain/agents");
// const { SerpAPI } = require("langchain/tools");
// const { Calculator } = require("langchain/tools/calculator");
// const { BufferMemory, ChatMessageHistory } = require("langchain/memory");

// const agentController = {};

// agentController.runConversationalAgentWithText = async (humanMessage) => {
//   // Initialize the ChatOpenAI model with the provided API key and temperature
//   const model = new ChatOpenAI({
//     temperature: 0,
//     openAIApiKey: process.env.OPEN_AI_KEY,
//   });

//   // Initialize the tools (SerpAPI and Calculator)
//   const tools = [new SerpAPI(), new Calculator()];

//   // Initialize an empty chat history
//   const chatHistory = new ChatMessageHistory([]);

//   // Initialize a BufferMemory instance with the chat history
//   const memory = new BufferMemory({
//     chatHistory: chatHistory,
//   });

//   // Passing "chat-conversational-react-description" as the agent type
//   // automatically creates and uses BufferMemory with the executor.
//   // If you would like to override this, you can pass in a custom
//   // memory option, but the memoryKey set on it must be "chat_history".

//   // Initialize the agent executor with the model, tools, memory, and custom options
//   const executor = await initializeAgentExecutorWithOptions(tools, model, memory, {
//     agentType: "chat-conversational-react-description",
//     verbose: true,
//   });

//   console.log("Loaded agent.");

//   // Execute the agent with the provided human message
//   const response = await executor._call({ input: humanMessage });

//   console.log("Response:", response);

//   return response;
// };

// module.exports = agentController;