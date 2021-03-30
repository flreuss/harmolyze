import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const session = await getSession({ req });
  const newAttempt = {
    ...req.body,
    validatedAt: new Date(req.body.validatedAt),
    time: +req.body.time,
    mistakes: +req.body.mistakes,
    tune_id: ObjectId(req.body.tune_id),
  };
  if (session && newAttempt.user_id === session.user._id) {
    switch (req.method) {
      case "POST":
        try {
          const { db } = await connectToDatabase();
          const attempts = await db
            .collection("attempts")
            .insertOne(newAttempt);
          db.collection("users").updateOne(
            { _id: newAttempt.user_id },
            {
              $push: {
                attempts: ObjectId(attempts.insertedId),
              },
            }
          );
          //201 Created
          res.status(201).json(attempts.ops[0]);
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
  } else {
    // 401 Unauthorized
    res.status(401).json({});
  }
};
