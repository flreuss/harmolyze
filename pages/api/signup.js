import { connectToDatabase } from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default function signup(req, res) {
  if (req.method === "POST") {
    bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
      addUserToDB({
        _id: req.body.name,
        password: hashedPassword,
        createdAt: new Date(),
        image: req.body.image,
        isAdmin: false,
      })
        .then((result) => {
          //201 Created
          res.status(201).json(result.ops[0]);
        })
        .catch((error) => {
          //403 Forbidden
          res.status(403).json(error);
        });
    });
  } else {
    //405 Method Not Allowed
    res.status(405).json({});
  }
}

async function addUserToDB(user) {
  const { db } = await connectToDatabase();
  const result = await db.collection("users").insertOne(user);

  return result;
}
