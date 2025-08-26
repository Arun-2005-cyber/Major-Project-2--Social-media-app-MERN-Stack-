import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Container, Row, Col, ListGroup, Form, Button, Card } from "react-bootstrap";
import axios from "axios";

const socket = io("http://localhost:5000");

function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null); // ✅ store chat room id
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch following users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;

        const parsedUser = JSON.parse(userInfo);

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedUser.token}`,
          },
        };

        const { data } = await axios.get("http://localhost:5000/api/users/following", config);
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ When chatId changes, join that room
  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", chatId);

      socket.on("messageReceived", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.off("messageReceived");
      };
    }
  }, [chatId]);

  // ✅ Open chat with a user (get/create chat)
  const openChat = async (user) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data: chat } = await axios.post(`/api/chats/${user._id}`, {}, config);
      setSelectedUser(user);
      setChatId(chat._id);

      // ✅ fetch messages separately
      const { data: msgs } = await axios.get(`/api/chats/message/${chat._id}`, config);
      setMessages(msgs);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };


  // ✅ Send message
  // inside ChatPage.js

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // ✅ Call backend to save & emit
      const { data } = await axios.post(
        `http://localhost:5000/api/chats/message/${chatId}`,
        { content: newMessage },
        config
      );

      // ⚡ No need to add manually, socket will push to us
      setNewMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };



  return (
    <Container fluid className="p-3">
      <Row>
        {/* Sidebar - Following users */}
        <Col md={3}>
          <h5>Following</h5>
          <ListGroup>
            {users.map((u) => (
              <ListGroup.Item
                key={u._id}
                action
                active={selectedUser?._id === u._id}
                onClick={() => openChat(u)} // ✅ fetch chat on click
              >
                {u.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Chat window */}
        <Col md={9}>
          {selectedUser ? (
            <Card>
              <Card.Header>
                Chat with <b>{selectedUser.username}</b>
              </Card.Header>
              <Card.Body style={{ height: "400px", overflowY: "auto" }}>
                {messages.map((msg, index) => (
                  <div key={index}>
                    <strong>{msg.sender?.username || "Unknown"}: </strong> {msg.content || msg.text}
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
