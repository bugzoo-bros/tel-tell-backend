import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const firebaseTools = require("firebase-tools");
import {BlockUser, User} from "./type";

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
      await db
          .collection("user")
          .doc(blockeeUser.uid)
          .collection("blockUser")
          .doc(context.params.blockerUid)
          .create(blockerUser);
    });

export const deleteBlockUserCollection = functions
    .runWith({timeoutSeconds: 540, memory: "2GB"})
    .region("asia-northeast2")
    .firestore.document("user/{uid}")
    .onDelete(async (snapshot) => {
      const user = snapshot.data() as User;
      const path = `user/${user.uid}/blockUser`;
      await firebaseTools.firestore.delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        force: true,
        token: functions.config().ci.token,
      });
    });
