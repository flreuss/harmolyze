import { connectToDatabase } from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default async (req, res) => {
  switch (req.method) {
    case "POST":
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 8);
        const { db } = await connectToDatabase();
        const user = {
          _id: req.body.name,
          password: hashedPassword,
          createdAt: new Date(),
          groups: ["global"],
        };
        const users = await db.collection("users").insertOne(user);
        //201 Created
        res.status(201).json(users.insertedId);
      } catch (err) {
        //500 Internal Server Error
        console.error(err);
        res.status(500).json(err);
      }
      break;
    default:
      //405 Method Not Allowed
      res.status(405).json({});
  }
};
