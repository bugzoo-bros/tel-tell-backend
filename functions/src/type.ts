export type User = {
  uid: string,
  faculty: string
  name: string,
  grade: string,
  gender: string,
  createdAt: FirebaseFirestore.Timestamp,
  updatedAt: FirebaseFirestore.Timestamp
};

export type UserPublic = {
  faculty: string
  name: string,
  grade: string,
  gender: string,
  createdAt: FirebaseFirestore.Timestamp,
  updatedAt: FirebaseFirestore.Timestamp
};

export type Ticket = {
  ticketId: string;
  uid: string;
  createdAt: FirebaseFirestore.Timestamp;
  callMode: CallMode;
  gender: Gender;
};

export type CallUserState = {
  uid: string;
  ticketId: string;
  callRoomId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};

export type CallRoom = {
  callRoomId: string;
  users: string[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};

export type BlockUser = {
  uid: string;
  reason: string[];
  source: boolean;
  destination: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

type CallMode = "all" | "wantMen" | "wantWomen";
type Gender = "男" | "女";
