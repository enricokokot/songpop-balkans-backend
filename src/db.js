import mongo from "mongodb";

let connection_string =
  "mongodb+srv://admin:8Pv63O3i2cViC5H6@studentcluster.ivorqpy.mongodb.net/?retryWrites=true&w=majority";

let client = new mongo.MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;

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
