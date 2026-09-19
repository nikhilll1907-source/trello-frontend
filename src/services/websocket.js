import { WS_URL } from "../config/env";

class BoardWebSocket {
  constructor() {
    this.socket = null;
    this.boardId = null;
    this.token = null;
    this.callbacks = {
      onActiveUsers: () => {},
      onUserJoined: () => {},
      onUserLeft: () => {},
      onError: () => {},
      onAuthSuccess: () => {},
      onAuthError: () => {},
      onOpen: () => {},
      onClose: () => {},
    };
    this.intentionalClose = false;
  }

  connect({ token, boardId, callbacks = {} }) {
    this.disconnect();

    this.token = token;
    this.boardId = boardId;
    this.callbacks = { ...this.callbacks, ...callbacks };
    this.intentionalClose = false;

    if (!token || !boardId) {
      return;
    }

    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        this.callbacks.onOpen?.();
        // Send AUTH message immediately upon connection
        this.send({
          type: "AUTH",
          token: this.token,
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "AUTH_SUCCESS":
              this.callbacks.onAuthSuccess?.(message.user);
              // After authentication succeeds, join the board
              if (this.boardId) {
                this.send({
                  type: "JOIN_BOARD",
                  boardId: this.boardId,
                });
              }
              break;

            case "AUTH_ERROR":
              this.callbacks.onAuthError?.(message.message);
              break;

            case "ACTIVE_USERS":
              this.callbacks.onActiveUsers?.(message.users || []);
              break;

            case "USER_JOINED":
              this.callbacks.onUserJoined?.(message.user);
              break;

            case "USER_LEFT":
              this.callbacks.onUserLeft?.(message.user);
              break;

            case "ERROR":
              this.callbacks.onError?.(message.message);
              break;

            default:
              break;
          }
        } catch {
          // JSON parsing failed or ignore
        }
      };

      this.socket.onerror = () => {
        this.callbacks.onError?.("WebSocket connection error");
      };

      this.socket.onclose = () => {
        this.callbacks.onClose?.();
      };
    } catch {
      this.callbacks.onError?.("Failed to establish WebSocket connection");
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  leaveBoard(boardId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({
        type: "LEAVE_BOARD",
        boardId: boardId || this.boardId,
      });
    }
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.socket) {
      if (this.boardId) {
        this.leaveBoard(this.boardId);
      }
      this.socket.close();
      this.socket = null;
    }
    this.boardId = null;
    this.token = null;
  }
}

export const createBoardWebSocket = () => new BoardWebSocket();

export default BoardWebSocket;
