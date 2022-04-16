import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {User} from "./type";

export const updateTotalOnlineUsers = functions
    .region("us-central1")
    .database.ref("status/{uid}")
    .onWrite(async (change, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.database();
      const totalOnlineUsers = (
        await db.ref("status").orderByChild("presence").equalTo(true).get()
      ).numChildren();
      await db.ref().update({totalOnlineUsers: totalOnlineUsers});
    });

export const deleteStatus = functions
    .region("asia-northeast2")
    .firestore.document("user/{uid}")
    .onDelete(async (snapshot, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.database();
      const user = snapshot.data() as User;
      await db.ref(`status/${user.uid}`).remove();
    });
