'use strict';

var express = require('express')
var mongo = require('mongodb')
var mongoose = require('mongoose')
const shortid = require('shortid')
const isWebUri = require('valid-url').isWebUri

var bodyParser = require('body-parser')

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true})
const Schema = mongoose.Schema;
const tinyData = new Schema({
  url: {
    type: String,
    required:true
  },
  miniId: {
    type: String,
    required: true}
})
const options = {
  // Return the document after updates are applied
  new: true,
  // Create a document if one isn't found. Required
  // for `setDefaultsOnInsert`
  upsert: true,
  setDefaultsOnInsert: true
}
const Tiny = mongoose.model("Tiny", tinyData)

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  const url = req.body.url
  if (! isWebUri(url)) {
    return res.status(400).json({"error":"invalid URL"}).end()
  }
  Tiny.findOne({url: url}, function(err, data) {
    if (err) {
      return res.status(500).json(err)
    }
    if (data) {
     return res.json({"original_url":url ,"short_url":data.miniId})
    }
    const tiny = new Tiny({url: url, miniId: shortid.generate()})
    tiny.save( (e, d) => {
      return res.json({"original_url":d.url ,"short_url":d.miniId})
    })
  })
  
});
app.get("/api/shorturl/:urlId", function (req, res) {
  Tiny.findOne({miniId: req.params.urlId}, function(err, data) {
    if (err) {
      return res.status(500).json(err)
    }
    return res.redirect(data.url)
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});