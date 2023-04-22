const modelService = require("../services/ml-model.service");

const fs = require("fs");
const { Configuration, OpenAIApi, FineTunes } = require("openai");
const ExcelJS = require("exceljs");

const configuration = new Configuration({ apiKey: process.env.OPEN_AI_KEY });
const openai = new OpenAIApi(configuration);

async function getModels(req, res) {
  try {
    const models = await modelService.getModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: "Error getting models" });
  }
}
async function convertExcelToJson(file) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file.path);
  const worksheet = workbook.getWorksheet(1);
  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const prompt = row.getCell(1).value;
      const completion = row.getCell(2).value;
      data.push({ prompt, completion });
    }
  });
  return data;
}

async function uploadData(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const data = await convertExcelToJson(req.file);
    const jsonlContent = data.map((entry) => JSON.stringify(entry)).join("\n");
    fs.writeFileSync("training_data.jsonl", jsonlContent);

    const fileUploadResponse = await openai.files.create({
      purpose: "fine-tuning",
      file: fs.createReadStream("training_data.jsonl"),
    });

    res.json({
      message: "Data uploaded and converted",
      fileId: fileUploadResponse.id,
    });
  } catch (error) {
    console.error("Error in uploadData:", error);
    res.status(500).json({ message: "Error uploading data" });
  }
}

async function fineTuneModel(req, res) {
  // Implementation for fine-tuning a model using the uploaded data
}

async function listFineTunes(req, res) {
  // Implementation for listing fine-tunes
}

async function createCompletion(req, res) {
  // Implementation for creating a completion with the fine-tuned model
}

module.exports = {
  getModels,
  uploadData,
  fineTuneModel,
  listFineTunes,
  createCompletion,
};
