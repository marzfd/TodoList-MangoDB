const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dotenv = require('dotenv');
dotenv.config();

const dbName = "crud_mongodb";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4wwal.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
// const url = "mongodb://localhost:27017";
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const state = {
  db: null
};

const connect = (cb) => {
  if (state.db) cb();
  MongoClient.connect(url, mongoOptions, (err, client) => {
    if (err) cb(err);
    state.db = client.db(dbName);
    cb();
  });
};

// returns ID for items
const getPrimaryKey = _id => ObjectID(_id);

// Returns database connection
const getDB = () => state.db;

module.exports = {
  getDB,
  connect,
  getPrimaryKey
};