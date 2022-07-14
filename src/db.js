import dotenv from "dotenv";
dotenv.config();
import mongo from "mongodb";

let connection_string = process.env.CONNECTION_STRING;

let client = new mongo.MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;
export const userDb = "anotherUserDb";

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
          db = client.db("songpop-balkans");
          resolve(db);
        }
      });
    }
  });
};
