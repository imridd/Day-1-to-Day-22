
import { useCallback, useEffect, useRef, useState } from "react";

export default function useSocket({
  url,
  enabled = true,
  onMessage,
  onOpen,
  onClose,
  onError
}) {
  const socketRef = useRef(null);
  const callbacksRef = useRef({});

  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    callbacksRef.current = {
      onMessage,
      onOpen,
      onClose,
      onError
    };
  }, [onMessage, onOpen, onClose, onError]);

  useEffect(() => {
    if (!enabled || !url) return;

    let socket;
    let active = true;

    try {
      socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = (event) => {
        if (!active) return;

        setConnected(true);
        setError(null);
        callbacksRef.current.onOpen?.(event);
      };

      socket.onmessage = (event) => {
        if (!active) return;

        let parsed = event.data;

        try {
          parsed = JSON.parse(event.data);
        } catch {
          // Keep non-JSON messages as plain text.
        }

        setLastMessage(parsed);
        callbacksRef.current.onMessage?.(parsed);
      };

      socket.onerror = (event) => {
        if (!active) return;

        setError("WebSocket connection error");
        callbacksRef.current.onError?.(event);
      };

      socket.onclose = (event) => {
        if (!active) return;

        setConnected(false);
        callbacksRef.current.onClose?.(event);
      };
    } catch (err) {
      setError(err.message || "Unable to create WebSocket");
    }

    return () => {
      active = false;

      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setConnected(false);
    };
  }, [url, enabled]);

  const sendMessage = useCallback((data) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    const payload =
      typeof data === "string"
        ? data
        : JSON.stringify(data);

    socket.send(payload);
    return true;
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
  }, []);

  return {
    connected,
    lastMessage,
    error,
    sendMessage,
    disconnect
  };
}
