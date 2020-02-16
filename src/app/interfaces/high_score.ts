/**
 * This Interface represents the data model of the High Score data which is sent between Client and Server
 */

export interface HighScore {
  user: string;
  score: number;
  duration: number;
  createdAt: Date;
}

