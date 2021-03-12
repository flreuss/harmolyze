import { connectToDatabase } from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default function signup(req, res) {
  let resStatus = 201;
  let resJson = {};
  if (req.method === "POST") {
    bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
      addUserToDB({
        name: req.body.name,
        password: hashedPassword,
      }).then((result) => {
        if (result.insertedCount >= 1) {
          resJson = result.ops;
        } else {
          resStatus = 400;
        }
      });
    });
  } else {
    //Method Not Allowed
    resStatus = 405;
  }
  res.status(resStatus).json(resJson);
}

async function addUserToDB(user) {
  const { db } = await connectToDatabase();
  const result = await db.collection("users").insertOne(user);

  return result;
}
