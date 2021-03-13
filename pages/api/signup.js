import { connectToDatabase } from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const { db } = await connectToDatabase();
      const user = {
        _id: req.body.name,
        password: hashedPassword,
        createdAt: new Date(),
        image: req.body.image,
        isAdmin: false,
      };
      const users = await db.collection("users").insertOne(user);
      //201 Created
      res.status(201).json(users.insertedId);
    } catch (err) {
      //500 Internal Server Error
      if (error) res.status(500).json(err);
    }
  } else {
    //405 Method Not Allowed
    res.status(405).json({});
  }
};
