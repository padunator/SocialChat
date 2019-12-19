export interface ChatMessage {
  key?: string;
  email: string;
  username: string;
  message: string;
  timeSent: string;
  url_matches?: string[];
}
