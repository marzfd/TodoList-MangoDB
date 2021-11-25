const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');
const db = require("./db");

const collection = "todo";

const app = express();
app.use(bodyParser.json());

// Validation of Inputs
const schema = Joi.object().keys({ todo : Joi.string().required() });


// Static HTML File
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});


// Get todo items
app.get('/getTodos',(req,res)=>{
  db.getDB().collection(collection).find({}).toArray((err,result)=>{
    if (err) console.log(err);
    res.json(result);
  });
});


// Update todo items
app.put('/:id', (req,res) => {
  const todoID = req.params.id;
  const userInput = req.body;

  db.getDB().collection(collection).findOneAndUpdate(
    {_id : db.getPrimaryKey(todoID)},
    {$set : { todo : userInput.todo }},
    {returnOriginal : false},
    (err, result) => {
      if (err) console.log(err);
      res.json(result);
  });
});


// Create todo items
app.post('/', (req, res, next) => {
  const userInput = req.body;

  Joi.validate(userInput, schema, (err, result) => {
    if (err) {
        const error = new Error("Invalid Input ❌");
        error.status = 400;
        next(error);
    }
    else{
      db.getDB().collection(collection).insertOne(
        userInput,
        (err,result) => {
        if (err) {
          const error = new Error("Failed to insert Todo Document ❌");
          error.status = 400;
          next(error);
        }
        res.json({
          result : result,
          document : result.ops[0],
          msg : "Successfully inserted Todo ✅",
          error : null
        });
      });
    }
  })
});


// Delete todo items
app.delete('/:id', (req, res) => {
  const todoID = req.params.id;
  db.getDB().collection(collection).findOneAndDelete(
    { _id : db.getPrimaryKey(todoID) },
    (err,result) => {
      if(err) console.log(err);
      res.json(result);
  });
});

// Handle Error
app.use((err, req, res, next) => {
    res.status(err.status).json({ error : { message : err.message } });
})


db.connect(err => {
  if (err) {
    console.log(err.message, 'Unable to connect to MongoDB !');
    process.exit(1);
  }
  const Port = process.env.PORT || 3000;
  app.listen(Port, () => console.log(`connected to MongoDB! Listening on ${Port} ...`));
});