const axios = require("axios");
const conversationService = require("../services/conversation.service");
const { queryOpenAiAgent } = require("../services/agent.service");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Load environment variables
const { OPEN_AI_ORG, OPENAI_API_KEY, ELEVEN_LABS_API_KEY } = process.env;

// Define the chat controller
const chatController = {};

// Convert audio to text using OpenAI Whisper
chatController.convertAudioToText = async (audioFile) => {
  try {
    const transcript = await openai.Audio.transcribe("whisper-1", audioFile);
    const messageText = transcript.text;
    return messageText;
  } catch (error) {
    console.error(error);
    return;
  }
};

// Get chat response using OpenAI ChatCompletion API (GPT-3.5 Turbo)
chatController.getChatResponseV2 = async (messageInput) => {
  try {
    // const recentMessages = await conversationService.getRecentMessages(userId, assistantId);
    // const messages = [...recentMessages, { role: 'user', content: messageInput }];
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: messageInput }],
    });

    console.log("response::", response.data.choices[0]);
const messageText = response.data.choices[0].message.content;
    return messageText;
  } catch (error) {
    console.error(error);
    return;
  }
};
chatController.getChatResponse = async (userId, assistantId, messageInput) => {
  try {
    // const recentMessages = await conversationService.getRecentMessages(userId, assistantId);
    // const messages = [...recentMessages, { role: 'user', content: messageInput }];

    const response = await openai.ChatCompletion.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    console.log("response::", response);
    const messageText = response.choices[0].message.content;
    return messageText;
  } catch (error) {
    console.error(error);
    return;
  }
};

chatController.getAgentResponse = async (messageInput, userId="sensai", assistantId="sensai" ) => {
  try {
    const response = await queryOpenAiAgent(userId, assistantId, messageInput)
    return response;
  } catch (error) {
    console.error(error);
    return;
  }
};

// Convert text to speech using Eleven Labs API
chatController.convertTextToSpeech = async (
  message = "hi there",
  stability = 0,
  similarity_boost = 0,
  voiceId = "TxGEqnHWrfWFTfGW9XjX"
) => {
  const body = {
    text: message,
    voice_settings: {
      stability: stability,
      similarity_boost: similarity_boost,
    },
  };

  const headers = {
    "xi-api-key": ELEVEN_LABS_API_KEY,
    "Content-Type": "application/json",
    Accept: "audio/mpeg",
  };
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    console.log("endpoint::", endpoint);
    const response = await axios.post(endpoint, body, { headers: headers });
    console.log("response::", response);
    if (response.status === 200) {
      return response.data;
    } else {
      return;
    }
  } catch (error) {
    console.error("error:", error);
    return;
  }
};

module.exports = chatController;
