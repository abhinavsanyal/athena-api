const mongoose = require("mongoose");

const mlModelSchema = new mongoose.Schema({
  name: String,
  fineTunes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FineTune',
    },
  ],
});

const MlModel = mongoose.model('Model', mlModelSchema);

export default MlModel;
