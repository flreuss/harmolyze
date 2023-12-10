import { getToken } from "next-auth/jwt"
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const token = await getToken({ req })
  switch (req.method) {
    case "POST":
      const newTune = {
        ...req.body,
        _id: new ObjectId(),
        lastModifiedAt: new Date(),
        createdAt: new Date(),
        createdBy: token._id,
      };
      try {
        const { db } = await connectToDatabase();
        const tunebook = await db
          .collection("tunebooks")
          .findOne({ _id: newTune.tunebook_id });
        if (
          tunebook.permissions.read.some((group) =>
            token.groups.includes(group)
          )
        ) {
          const tunes = await db.collection("tunes").insertOne(newTune);
          db.collection("tunebooks").updateOne(
            { _id: tunebook._id },
            { $push: { tunes: ObjectId(tunes.insertedId) } }
          );
          //201 Created
          res.status(201).json(tunes.insertedId);
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
    case "PUT":
      try {
        const { db } = await connectToDatabase();
        const tune = await db
          .collection("tunes")
          .findOne({ _id: ObjectId(req.body._id) });
        if (
          token._id === tune.createdBy ||
          token.groups.includes("admin")
        ) {
          await db
            .collection("tunes")
            .updateOne(
              { _id: ObjectId(req.body._id) },
              { $set: { abc: req.body.abc, points: req.body.points, lastModifiedAt: new Date() } }
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
    case "DELETE":
      try {
        const { db } = await connectToDatabase();
        const tune = await db
          .collection("tunes")
          .findOne({ _id: ObjectId(req.body._id) });
        if (
          token._id === tune.createdBy ||
          token.groups.includes("admin")
        ) {
          await db
            .collection("tunes")
            .deleteOne({ _id: ObjectId(req.body._id) });
          await db.collection("tunebooks").updateOne(
            { _id: tune.tunebook_id },
            { $pull: { tunes: ObjectId(req.body._id) } }
          );
          //200 OK
          res.status(200).json(tune);
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
