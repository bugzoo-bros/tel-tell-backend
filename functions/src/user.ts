import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {User, UserPublic} from "./type";

export const createUserPublic = functions
    .region("asia-northeast2")
    .firestore.document("user/{uid}")
    .onCreate(async (snapshot, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.firestore();
      const user = snapshot.data() as User;
      const userPublic: UserPublic = {
        faculty: user.faculty,
        name: user.name,
        grade: user.grade,
        gender: user.gender,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      await db.collection("userPublic").doc(user.uid).set(userPublic);
    });

export const updateUserPublic = functions
    .region("asia-northeast2")
    .firestore.document("user/{uid}")
    .onUpdate(async (snapshot, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.firestore();
      const user = snapshot.after.data() as User;
      const userPublic: UserPublic = {
        faculty: user.faculty,
        name: user.name,
        grade: user.grade,
        gender: user.gender,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      await db.collection("userPublic").doc(user.uid).update(userPublic);
    });

export const deleteUserPublic = functions
    .region("asia-northeast2")
    .firestore.document("user/{uid}")
    .onDelete(async (snapshot, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.firestore();
      const user = snapshot.data() as User;
      await db.collection("userPublic").doc(user.uid).delete();
    });
