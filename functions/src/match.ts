import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Ticket, CallUserState, CallRoom} from "./type";

export const matchCallUser = functions
    .region("asia-northeast2")
    .firestore.document("ticket/{ticketId}")
    .onCreate(async (snapshot, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.firestore();

      const callerTicket = snapshot.data() as Ticket;

      // マッチ相手検索（検索フィールドが増えたらアルゴリズムの改善必要？）
      const collection = db.collection("ticket");
      let query: FirebaseFirestore.Query;
      if (callerTicket.callMode === "all") {
        if (callerTicket.gender === "男") {
          query = collection.where("callMode", "in", ["all", "wantMen"]);
        } else {
          query = collection.where("callMode", "in", ["all", "wantWomen"]);
        }
      } else if (callerTicket.callMode === "wantMen") {
        if (callerTicket.gender === "男") {
          query = collection
              .where("gender", "==", "男")
              .where("callMode", "in", ["all", "wantMen"]);
        } else {
          query = collection
              .where("gender", "==", "男")
              .where("callMode", "in", ["all", "wantWomen"]);
        }
      } else {
        if (callerTicket.gender === "男") {
          query = collection
              .where("gender", "==", "女")
              .where("callMode", "in", ["all", "wantMen"]);
        } else {
          query = collection
              .where("gender", "==", "女")
              .where("callMode", "in", ["all", "wantWomen"]);
        }
      }
      // 60秒以内
      const createdAtDate = callerTicket.createdAt.toDate();
      createdAtDate.setSeconds(createdAtDate.getSeconds() - 60);
      const createdAtTimestamp =
      admin.firestore.Timestamp.fromDate(createdAtDate);
      query = query.where("createdAt", ">=", createdAtTimestamp);
      // 自分を除外
      query = query.where("createdAt", "!=", callerTicket.createdAt);
      // 古い順に並び替え
      query = query.orderBy("createdAt", "asc");
      // 1件に制限
      query = query.limit(1);

      // データ取得
      const result = await query.get();

      // 検索結果なし
      if (result.empty) return;

      // キャスト & 配列から取り出す
      const calleeTicket = result.docs.map((snapshot) => {
        const ticket = snapshot.data() as Ticket;
        functions.logger.info(ticket);
        return snapshot.data() as Ticket;
      })[0];

      // ブロック判定
      const blockUserDoc = await db
          .collection("user")
          .doc(callerTicket.uid)
          .collection("blockUser")
          .doc(calleeTicket.uid)
          .get();
      if (blockUserDoc.exists) return;

      // チケットを削除
      const ticketRef = db.collection("ticket");
      await ticketRef.doc(callerTicket.ticketId).delete();
      await ticketRef.doc(calleeTicket.ticketId).delete();

      // callUserStateRef
      const callerUserStateRef = db
          .collection("callUserState")
          .doc(callerTicket.uid);
      const calleeUserStateRef = db
          .collection("callUserState")
          .doc(calleeTicket.uid);

      // callRoomとcallUserStateが残っているか確認
      const isRoomResidue =
      (
        await db
            .collection("callRoom")
            .where("users", "array-contains-any", [
              callerTicket.uid,
              calleeTicket.uid,
            ])
            .get()
      ).size != 0;
      const isCallerResidue = (await callerUserStateRef.get()).exists;
      const isCalleeResidue = (await calleeUserStateRef.get()).exists;
      // 残留していたら失敗
      if (isRoomResidue || isCallerResidue || isCalleeResidue) return;

      // callUserState & callRoom書き込み
      const callRoomRef = db.collection("callRoom").doc();
      const callerUserState: CallUserState = {
        uid: callerTicket.uid,
        ticketId: callerTicket.ticketId,
        callRoomId: callRoomRef.id,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      const calleeUserState: CallUserState = {
        uid: calleeTicket.uid,
        ticketId: calleeTicket.ticketId,
        callRoomId: callRoomRef.id,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      const callRoom: CallRoom = {
        callRoomId: callRoomRef.id,
        users: [callerTicket.uid, calleeTicket.uid],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      // transactionじゃなくてもいい？
      await db.runTransaction(async (t) => {
        await t.getAll(callerUserStateRef, calleeUserStateRef);
        t.create(callerUserStateRef, callerUserState);
        t.create(calleeUserStateRef, calleeUserState);
      });
      await callRoomRef.create(callRoom);
    });
