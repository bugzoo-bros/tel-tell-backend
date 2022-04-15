import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const updateTotalOnlineUsers = functions
    .region("us-central1")
    .database.ref("status/{uid}")
    .onUpdate(async (change, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.database();
      const totalOnlineUsers = (
        await db.ref("status").orderByChild("presence").equalTo(true).get()
      ).numChildren();
      await db.ref().update({totalOnlineUsers: totalOnlineUsers});
    });
