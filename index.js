var express = require('express');
var cors = require('cors');
const path = require('path');
const crypto = require('crypto');
var multer = require('multer');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const Schema = mongoose.Schema;
const mongoUri = process.env['MONGO_URI'];
const util = require("util");
const { GridFsStorage } = require("multer-gridfs-storage");
require('dotenv').config()

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const fileSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "Uploaded file must have a name"],
  },
});

const File = mongoose.model("File", fileSchema);

const storage = new GridFsStorage({
    url: mongoUri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const fileInfo = {
          filename: file.originalname,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    }
});

const upload = multer({ storage });

app.use(cors());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single('upfile'), 
  (req, res, next) => {
  console.log(req.file);
    
  let newFile = new File({
    name: req.file.filename
  });

  newFile.save()
    .then((image) => {
      res.status(200).json({
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
       });
    })
    .catch(err => 
      res.status(500).json(err));
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
