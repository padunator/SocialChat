export interface Room {
  _id?: string;
  title: string;
  connections?: { userId: String, socketId: String }[];
  isOpen?: boolean;
  owner?: {userId: String, socketId: String}[];
  rounds?: Number;
  currentRound?: Number;
  noOfPlayers?: Number;
  createdAt?: Date;
  score?: { round: Number, answers: Object, _id: {id: false}}[];
}
