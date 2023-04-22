const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller"); // Import chatController
const { requireAuth } = require("../middlewares/authMiddleware");
const conversationService = require("../services/conversation.service");
const { Configuration, OpenAIApi } = require("openai");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fs = require("fs");
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

// Load environment variables
// const { OPEN_AI_ORG, OPEN_AI_KEY, ELEVEN_LABS_API_KEY } = process.env;

router.post(
  "/audio-to-text-completion",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    try {
    //   console.log("req.file:===", req.file);
      const audioFile = req.file.buffer;
      const tmpFilename = "tmp_audio_file.wav";
      fs.writeFileSync(tmpFilename, audioFile);
      const transcript = await openai.createTranscription(
        fs.createReadStream(tmpFilename),
        "whisper-1"
      );

    //   console.log("transcript:===", transcript);
      fs.unlinkSync(tmpFilename); // Delete the temporary file
      const messageText = transcript.data.text;
      console.log("messageText:===", messageText);
      if (messageText) {
        //
        const messages = conversationService.get_recent_messages_fs();
        const user_message = {
            role: "user",
            content: messageText + " Make sure to help me out .",
        };
        messages?.push(user_message);
        
        //   const messages = [{ role: "user", content: messageText }];
        //   const response = await openai.ChatCompletion({
            //     model: "gpt-3.5-turbo",
            //     messages: messages,
            //   });
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages,
        });

        // store the messageText from user and the completion in mongodb database
        const _completionResponseMessageText = completion.data?.choices[0]?.message?.content;
        console.log("response:===", _completionResponseMessageText);
        conversationService.store_messages_fs(messageText, _completionResponseMessageText);
        res.status(200).json({ text:_completionResponseMessageText });
      } else {
        res.status(400).json({ error: "Audio-to-text conversion failed" });
      }
    } catch (error) {
      console.log("error:===", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

// Define a new route for text-to-speech conversion
router.post("/text-to-speech", requireAuth, async (req, res) => {
  try {
    const { message, stability, similarity_boost, voiceId } = req.body;
    const speechData = await chatController.convertTextToSpeech(
      message,
      stability,
      similarity_boost,
      voiceId
    );
    // console.log("speechdata", speechData);
    if (speechData) {
      res.status(200).json(speechData);
    } else {
      res.status(400).json({ error: "Text-to-speech conversion failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const { Readable } = require("stream"); // Import Readable stream
// const chatController = require("../controllers/chat.controller");
// const { requireAuth } = require("../middlewares/authMiddleware");

// router.post("/text-to-speech", requireAuth, async (req, res) => {
//   try {
//     const { message, stability, similarity_boost, voiceId } = req.body;
//     const speechData = await chatController.convertTextToSpeech(
//       message,
//       stability,
//       similarity_boost,
//       voiceId
//     );

//     if (speechData) {
//       // Create a Readable stream from the speech data
//       const readable = new Readable({
//         read() {
//           this.push(speechData);
//           this.push(null);
//         },
//       });

//       // Set the appropriate headers for a streaming response
//       res.setHeader("Content-Type", "application/octet-stream");

//       // Pipe the stream to the response
//       readable.pipe(res);
//     } else {
//       res.status(400).json({ error: "Text-to-speech conversion failed" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
