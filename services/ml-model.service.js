const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

const getModels = async () => {
  try {
    const response = await openai.listModels();
    return response.data.data;
  } catch (err) {
    console.error('Error fetching models:', err);
    return [];
  }
};

module.exports = {
  getModels,
};
