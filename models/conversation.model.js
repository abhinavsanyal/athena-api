const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  expertId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Expert',
  },
  messages: [
    {
      role: String,
      content: String,
    },
  ],
});

module.exports = mongoose.model('Conversation', conversationSchema);
