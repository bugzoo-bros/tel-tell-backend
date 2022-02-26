import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

type Ticket = {
  ticketId: string;
  uid: string;
  createdAt: FirebaseFirestore.Timestamp;
  callMode: CallMode;
  gender: Gender;
};

type CallMode = "all" | "wantMen" | "wantWomen";
type Gender = "男" | "女";

export const match = functions
    .region("asia-northeast2")
    .firestore.document("ticket/{ticketId}")
    .onCreate(async (snapshot, context) => {
      const app = admin.initializeApp(undefined, context.eventId);
      const db = app.firestore();

      const ticket = snapshot.data() as Ticket;
      functions.logger.info(ticket);

      // マッチ相手検索（検索フィールドが増えたらアルゴリズムの改善必要？）
      const collection = db.collection("ticket");
      let query: FirebaseFirestore.Query;
      if (ticket.callMode === "all") {
        if (ticket.gender === "男") {
          query = collection.where("callMode", "in", ["all, wantMen"]);
        } else {
          query = collection.where("callMode", "in", ["all", "wantWomen"]);
        }
      } else if (ticket.callMode === "wantMen") {
        if (ticket.gender === "男") {
          query = collection
              .where("gender", "==", "男")
              .where("callMode", "in", ["all", "wantMen"]);
        } else {
          query = collection
              .where("gender", "==", "男")
              .where("callMode", "in", ["all", "wantWomen"]);
        }
      } else {
        if (ticket.gender === "男") {
          query = collection
              .where("gender", "==", "女")
              .where("callMode", "in", ["all", "wantMen"]);
        } else {
          query = collection
              .where("gender", "==", "女")
              .where("callMode", "in", ["all", "wantWomen"]);
        }
      }
      // 自分を除外
      query = query.where("createdAt", "!=", ticket.createdAt);
      // 最新順に並び替え
      query = query.orderBy("createdAt", "desc");
      // 1件に制限
      // query = query.limit(1);
      // データ取得
      const result = await query.get();
      functions.logger.info(result.size);
      result.docs.map((snapshot) => {
        functions.logger.info(snapshot.data() as Ticket);
      });
    });
