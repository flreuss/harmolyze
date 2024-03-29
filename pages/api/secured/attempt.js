import { getToken } from "next-auth/jwt"
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const token = await getToken({ req })
  const newAttempt = {
    ...req.body,
    validatedAt: new Date(req.body.validatedAt),
    time: +req.body.time,
    mistakeCount: +req.body.mistakeCount,
    solvedCount: +req.body.solvedCount,
    tune_id: ObjectId(req.body.tune_id),
  };
  if (token && newAttempt.user_id === token._id) {
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
          res.status(201).json(attempts.insertedId);
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
