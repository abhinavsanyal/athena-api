const axios = require('axios');
const openai = require('openai');
const conversationService = require('../services/conversation.service');


// Load environment variables
const { OPEN_AI_ORG, OPEN_AI_KEY, ELEVEN_LABS_API_KEY } = process.env;

// Configure OpenAI
openai.organization = OPEN_AI_ORG;
openai.api_key = OPEN_AI_KEY;

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
chatController.getChatResponse = async (userId, assistantId, messageInput) => {
    try {
      const recentMessages = await conversationService.getRecentMessages(userId, assistantId);
      const messages = [...recentMessages, { role: 'user', content: messageInput }];

      
      const response = await openai.ChatCompletion.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
      });
      const messageText = response.choices[0].message.content;
      return messageText;
    } catch (error) {
      console.error(error);
      return;
    }
  };

// Convert text to speech using Eleven Labs API
chatController.convertTextToSpeech = async (message="hi there", stability=0, similarity_boost=0, voiceId = 'TxGEqnHWrfWFTfGW9XjX') => {
  const body = {
    text: message,
    voice_settings: {
      stability: stability,
      similarity_boost: similarity_boost,
    },
  };

  const headers = {
    'xi-api-key': ELEVEN_LABS_API_KEY,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg",
  };
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    console.log("endpoint::",endpoint);
    const response = await axios.post(endpoint, body, { headers: headers });
    console.log("response::",response);
    if (response.status === 200) {
      return response.data;
    } else {
      return;
    }
  } catch (error) {
    console.error("error:",error);
    return;
  }
};

module.exports = chatController;
