export interface Question {
  _id?: string;
  question: string;
  room: string;
  answers: { email: String, own: String, guess: String,  _id: {id: false} }[];
  options: { val: String, text: String, _id: {id: false} }[];
  createdAt: Date;
}
