import dotenv from "dotenv";
dotenv.config();
import mongo from "mongodb";

const connection_string = process.env.CONNECTION_STRING;
const db_database = process.env.DB_DATABASE;

const client = new mongo.MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;
export const userDb = "users";

export default () => {
  return new Promise((resolve, reject) => {
    if (db && client.topology.isConnected()) {
      resolve(db);
    } else {
      client.connect((err) => {
        if (err) {
          reject("Connection to database failed: " + err);
        } else {
          console.log("Database connected successfully!");
          db = client.db(db_database);
          resolve(db);
        }
      });
    }
  });
};
