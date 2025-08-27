export class MessageEvent {
  static message(channel: string, message: string) {
    return {
      type: "message",
      channel,
      message,
    };
  }
}