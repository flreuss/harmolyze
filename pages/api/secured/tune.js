import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const session = await getSession({ req });
  switch (req.method) {
    case "POST":
      const newTune = {
        abc: req.body.abc,
        title: req.body.title,
        points: req.body.points,
        tunebook_id: req.body.tunebook_id,
        createdAt: new Date(),
        createdBy: session.user._id,
      };
      try {
        const { db } = await connectToDatabase();
        const tunebook = await db
          .collection("tunebooks")
          .findOne({ _id: newTune.tunebook_id });
        if (tunebook.public || session.user.isAdmin) {
          const tunes = await db.collection("tunes").insertOne(newTune);
          db.collection("tunebooks").updateOne(
            { _id: tunebook._id },
            { $push: { tunes: ObjectId(tunes.insertedId) } }
          );
          //201 Created
          res.status(201).json(tunes.ops[0]);
        } else {
          // 401 Unauthorized
          res.status(401).json({});
        }
      } catch (err) {
        //500 Internal Server Error
        console.error(err);
        res.status(500).json(err);
      }
      break;
    case "DELETE":
      try {
        const { db } = await connectToDatabase();
        const tune = await db
          .collection("tunes")
          .findOne({ _id: ObjectId(req.body._id) });
        if (session.user._id === tune.createdBy || session.user.isAdmin) {
          await db
            .collection("tunes")
            .deleteOne({ _id: ObjectId(req.body._id) });
          db.collection("tunebooks").updateOne(
            { _id: tune.tunebook_id },
            { $pull: { tunes: ObjectId(req.body._id) } }
          );
          //200 OK
          res.status(200).json(tune.value);
        } else {
          // 401 Unauthorized
          res.status(401).json({});
        }
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
