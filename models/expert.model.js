// models/expert.model.js

const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  modelConfig: {
    type: Object,
  },
});

module.exports = mongoose.model('Expert', ExpertSchema);
