import dotenv from "dotenv";
dotenv.config();
import { MongoClient, Db } from "mongodb";

const connection_string = process.env.CONNECTION_STRING;
const db_database = process.env.DB_DATABASE;

if (typeof connection_string !== "string") {
  throw new Error("Connection string is missing!");
}

if (typeof db_database !== "string") {
  throw new Error("Database is missing!");
}

// fix applied: https://stackoverflow.com/a/71013132
const client = new MongoClient(connection_string);

let db = {} as Db;
export const userDb = "users";

export default (): Promise<Db> => {
  return new Promise((resolve, reject) => {
    // FIXME: works but connects to database for every call
    if (db === ({} as Db)) {
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
