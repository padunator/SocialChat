/**
 * This Interface represents the data model of the chat messages which are sent between client and server
 */

export interface ChatMessage {
  key?: string;
  email: string;
  username: string;
  message: string;
  timeSent: string;
  url_matches?: string[];
}
