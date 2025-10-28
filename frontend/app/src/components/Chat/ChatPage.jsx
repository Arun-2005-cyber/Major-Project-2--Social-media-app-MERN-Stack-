import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Container, Row, Col, ListGroup, Form, Button, Card } from "react-bootstrap";
import API from "../../api/axios";
import { useAuth } from "../../Context/AuthContext";

const socket = io(
  process.env.NODE_ENV === "production"
    ? "https://major-project-2-social-media-app-mern.onrender.com"
    : "http://localhost:5000",
  {
    withCredentials: true,
    autoConnect: false, // 👈 important: don’t connect automatically
  }
);

function ChatPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Connect to socket when user logs in
  useEffect(() => {
  if (user?.token) {
    socket.connect();
  } else {
    socket.disconnect();
    setMessages([]);
    setSelectedUser(null);
    setChatId(null);
  }

  return () => {
    socket.removeAllListeners();
    socket.disconnect();
  };
}, [user?.token]);

  // ✅ Fetch following users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.token) return;

      try {
        setLoading(true);
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await API.get("/api/users/following", config);
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // ✅ Join chat room when chatId changes
  useEffect(() => {
    if (!chatId || !user) return;

    socket.emit("joinChat", chatId);

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("messageReceived", handleMessage);

    return () => {
      socket.off("messageReceived", handleMessage);
    };
  }, [chatId, user]);

  // ✅ Open chat
  const openChat = async (u) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data: chat } = await API.post(`/api/chats/${u._id}`, {}, config);
      setSelectedUser(u);
      setChatId(chat._id);

      const { data: msgs } = await API.get(`/api/chats/message/${chat._id}`, config);
      setMessages(msgs);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !user?.token) return;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      await API.post(`/api/chats/message/${chatId}`, { content: newMessage }, config);
      setNewMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  return (
    <Container fluid className="p-3">
      <Row>
        <Col md={3}>
          <h5>Following</h5>
          <ListGroup>
            {users.map((u) => (
              <ListGroup.Item
                key={u._id}
                action
                active={selectedUser?._id === u._id}
                onClick={() => openChat(u)}
              >
                {u.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={9}>
          {selectedUser ? (
            <Card>
              <Card.Header>
                Chat with <b>{selectedUser.username}</b>
              </Card.Header>
              <Card.Body style={{ height: "400px", overflowY: "auto" }}>
                {messages.map((msg, i) => (
                  <div key={i}>
                    <strong>{msg.sender?.username || "Unknown"}: </strong>
                    {msg.content || msg.text}
                  </div>
                ))}
              </Card.Body>
              <Card.Footer>
                <Form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                  <Form.Control
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button onClick={sendMessage} className="ms-2">
                    Send
                  </Button>
                </Form>
              </Card.Footer>
            </Card>
          ) : (
            <h5>Select a user to start chatting</h5>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ChatPage;
