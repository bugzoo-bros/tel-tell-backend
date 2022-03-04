import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {BlockUser} from "./type";

export const createBlockeeUser = functions
    .region("asia-northeast2")
    .firestore.document("user/{blockerUid}/blockUser/{blockeeUid}")
    .onCreate(async (snapshot, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.firestore();
      const blockeeUser = snapshot.data() as BlockUser;
      const blockerUser = {
        uid: context.params.blockerUid,
        source: !blockeeUser.source,
        destination: !blockeeUser.destination,
        reason: blockeeUser.reason,
        createdAt: blockeeUser.createdAt,
        updatedAt: blockeeUser.updatedAt,
      } as BlockUser;
      await db.collection("user")
          .doc(blockeeUser.uid)
          .collection("blockUser")
          .doc(context.params.blockerUid).create(blockerUser);
    });
