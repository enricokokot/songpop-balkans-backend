import connect, { userDb } from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Db, ObjectId, PushOperator } from "mongodb";

(async () => {
  const db = await connect();
  await db.collection(userDb).createIndex({ username: 1 }, { unique: true });
})();

export default {
  async registerUser(userData: {
    username: string;
    password: string;
    playlist: string;
  }) {
    const db = (await connect()) as Db;
    const doc = {
      username: userData.username,
      password: await bcrypt.hash(userData.password, 8),
      playlists: [userData.playlist],
      friends: [] as string[],
      duels: [] as string[],
      reply: [] as ObjectId[],
      challenge: [] as ObjectId[],
      waiting: [] as ObjectId[],
      coins: 0,
      "games played": 0,
      "games won": 0,
      "games lost": 0,
      "games tied": 0,
      appendedAchievement: -1,
      achievements: [
        {
          id: 0,
          mission: "Win 10 games",
          progress: 0,
          total: 10,
        },
        {
          id: 1,
          mission: "Win a match agains 3 different people",
          progress: 0,
          total: 3,
        },
        {
          id: 2,
          mission: "Win with 5 different playlists",
          progress: 0,
          total: 5,
        },
        {
          id: 3,
          mission: "Earn a score of 250",
          progress: 0,
          total: 1,
        },
        {
          id: 4,
          mission: "Earn a score of 300",
          progress: 0,
          total: 1,
        },
      ],
    };

    const cursor = await db.collection(userDb).find();
    const result = await cursor.toArray();
    doc.challenge = result.map((user) => user._id);

    try {
      const result = await db.collection(userDb).insertOne(doc);
      if (result && result.insertedId) {
        await db.collection(userDb).updateMany(
          { _id: { $ne: result.insertedId } },
          {
            $push: {
              challenge: result.insertedId,
            } as unknown as PushOperator<Document>,
          }
        );
      }
      return result.insertedId;
    } catch (e) {
      // might be cause of subsequent errors after this one
      // if (e.code == 11000) {
      //   throw new Error("User already exists");
      // }
      console.error(e);
    }
  },

  async authenticateUser(username: string, password: string) {
    const db: Db = (await connect()) as Db;
    const user = await db.collection(userDb).findOne({ username: username });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      delete user.password;
      if (typeof process.env.JWT_SECRET !== "string") {
        throw new Error("JWT_SECRET is missing!");
      }
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      return { token, userId: user._id };
    } else {
      throw new Error("Cannot authenticate");
    }
  },
};
