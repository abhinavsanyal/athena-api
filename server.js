// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// Passport configuration
require("./config/passport")(passport);

app.use(express.static("public"));
app.use(cors());
app.use(express.json());

// Passport middleware
app.use(passport.initialize());
// app.use(passport.session());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/experts", require("./routes/expert.routes"));
app.use("/api/ml-models", require("./routes/ml-model.routes"));
app.use("/api/chat", require("./routes/chat.routes"));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
