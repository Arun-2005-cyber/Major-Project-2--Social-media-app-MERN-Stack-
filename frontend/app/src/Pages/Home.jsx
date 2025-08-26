import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PostForm from '../components/Posts/PostForm';
import PostList from '../components/Posts/PostList';
import ChatPage from '../components/Chat/ChatPage';



function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/api/posts', config);
      setPosts(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (

    <Container>
      <Row>
        <Col md={3}>
          
        </Col>
        <Col md={6}>
          <h3 className="text-center mt-2">Upload Posts</h3>
          <PostForm fetchPosts={fetchPosts} />
          <hr />

          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <PostList posts={posts} fetchPosts={fetchPosts} />
          )}
        </Col>
        <Col md={3}></Col>
      </Row>
      
    </Container>


  );
}

export default Home;
