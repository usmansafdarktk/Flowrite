export interface Message {
  message: string;
  time: string;
  type: 'sent' | 'received';
  checkpointId?: number;
  messageId?: number;
}
