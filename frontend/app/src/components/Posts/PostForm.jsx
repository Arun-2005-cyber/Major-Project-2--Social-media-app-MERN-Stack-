import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import axios from 'axios'
import Loader from '../Loader'
import Message from '../Message'


function PostForm({ fetchPosts }) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null)

  const [visible, setVisible] = useState(true);
  const handleClose = () => {
    setVisible(false);

  };
  if (!visible) return null;

  const submitHandler = async (e) => {
    e.preventDefault();
   const formData = new FormData();
  formData.append("image", image); 
  formData.append("content", content);
    try {
      setLoading(true)
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      await axios.post('/api/posts', formData, config);
      setContent("")
      setImage(null)
      fetchPosts()
      setLoading(false)
    }
    catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }




  return (
    <>
      {error && (
        <Message variant='danger' onClose={() => setError(null)}>
          {error}
        </Message>
      )}

      <Form onSubmit={submitHandler}>
        <Form.Group controlId='content' className='mt-3'>
          <Form.Label>Content</Form.Label>
          <Form.Control
            type='text'
            placeholder='Post Something...'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          >
          </Form.Control>
        </Form.Group>

        <Form.Group controlId='image' className='mt-3'>
          <Form.Label>Image</Form.Label>
          <Form.Control
            type='file'
            onChange={(e) => setImage(e.target.files[0])}
          >
          </Form.Control>
        </Form.Group>
        <Button type='submit' className='my-3 w-100' disabled={loading}>
          {loading ? <Loader size='sm' /> : "Post"} <i className='fa-solid fa-upload'></i>
        </Button>
      </Form>
    </>
  )
}

export default PostForm