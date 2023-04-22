const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const Conversation = require("../models/conversation.model");

const conversationService = {};

// Store messages between user and their assistant
conversationService.storeMessages = async (
  userId,
  assistantId,
  userMessage,
  assistantMessage
) => {
  try {
    // Find the conversation in the database
    let conversation = await Conversation.findOne({ userId, assistantId });

    // Create a new conversation if none exists
    if (!conversation) {
      conversation = new Conversation({ userId, assistantId, messages: [] });
    }

    // Add messages to the conversation
    conversation.messages.push({ role: "user", content: userMessage });
    conversation.messages.push({
      role: "assistant",
      content: assistantMessage,
    });

    // Save the updated conversation
    await conversation.save();
  } catch (error) {
    console.error(error);
  }
};

// Get recent messages between user and their assistant
conversationService.getRecentMessages = async (userId, assistantId) => {
  try {
    // Find the conversation in the database
    const conversation = await Conversation.findOne({ userId, assistantId });

    if (!conversation) {
      return [];
    }

    // Get the last 5 messages (or fewer if less than 5)
    const recentMessages = conversation.messages.slice(-5);

    return recentMessages;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// file system storage solution

conversationService.store_messages_fs = (requestMessage, responseMessage) => {
  const fileName = "stored_data.json";

  // Get recent messages
  let messages = conversationService.get_recent_messages_fs().slice(1);

  // Add messages to data
  const userMessage = { role: "user", content: requestMessage };
  const assistantMessage = { role: "assistant", content: responseMessage };
  messages.push(userMessage);
  messages.push(assistantMessage);

  // Save the updated file
  fs.writeFileSync(fileName, JSON.stringify(messages));
};

conversationService.reset_messages_fs = () => {
  const fileName = "stored_data.json";

  // Write an empty file
  fs.writeFileSync(fileName, "");
};

conversationService.get_recent_messages_fs = () => {
  const fileName = "stored_data.json";
  const learnInstruction = {
    role: "system",
    content:
      "You are an expert in life coaching, motivation, philosophy, and solving life problems, and your name is Rachel. The user is called Abhinav. Keep responses under 20 words.",
  };

  // Initialize messages
  const messages = [];

  // Add random element
  const x = Math.random();
  if (x < 0.2) {
    learnInstruction.content +=
      "Your response will have some pop culture references.";
  } else if (x >= 0.2 && x < 0.5) {
    learnInstruction.content +=
      "Your response will include an interesting new fact about a random famous philosopher.";
  } else if (x >= 0.5 && x < 0.7) {
    learnInstruction.content +=
      "Your response will recommend a new philosophy book to learn.";
  } else if (x >= 0.7 && x < 0.9) {
    learnInstruction.content +=
      "Your response will include a quote from a famous philosopher.";
  } else {
    learnInstruction.content +=
      "Your response will ask questions about any particular problem the user is facing.";
  }

  // Append instruction to message
  messages.push(learnInstruction);

  // Get last messages
  try {
    const data = JSON.parse(fs.readFileSync(fileName, "utf-8"));

    // Append last 5 rows of data
    if (data) {
      if (data.length < 5) {
        for (const item of data) {
          messages.push(item);
        }
      } else {
        for (const item of data.slice(-5)) {
          messages.push(item);
        }
      }
    }
  } catch (error) {
    console.error("Error reading stored_data.json:", error);
  }

  // Return messages
  return messages;
};

module.exports = conversationService;
