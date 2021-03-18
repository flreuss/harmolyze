import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const session = await getSession({ req });
  const newAttempt = {
    time: +req.body.time,
    mistakes: +req.body.mistakes,
    user_id: req.body.user_id,
    tune_id: ObjectId(req.body.tune_id),
  };
  if (session && newAttempt.user_id === session.user._id) {
    switch (req.method) {
      case "POST":
        try {
          const { db } = await connectToDatabase();
          const successfulAttempts = await db
            .collection("successfulAttempts")
            .insertOne(newAttempt);
          db.collection("users").updateOne(
            { _id: newAttempt.user_id },
            {
              $push: {
                successfulAttempts: ObjectId(successfulAttempts.insertedId),
              },
            }
          );
          //201 Created
          res.status(201).json(successfulAttempts.ops[0]);
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
