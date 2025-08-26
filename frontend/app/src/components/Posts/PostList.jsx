import React, { useState } from 'react'
import { Card, Button, Form, Modal } from 'react-bootstrap'
import axios from 'axios'
import Loader from '../Loader'
import Message from '../Message'
import { Trash } from 'lucide-react'

function PostList({ posts, fetchPosts }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [commentContent, setCommentContent] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [deletePostId, setDeletePostId] = useState(null)

  const openDeleteModal = (postId) => {
    setDeletePostId(postId)
    setShowModal(true)
  }

  const deletePostHandler = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"))
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      }
      await axios.delete(`/api/posts/${deletePostId}`, config)
      setShowModal(false)
      fetchPosts()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    }
  }

  const submitCommentHandler = async (postId) => {
    try {
      setLoading(true)
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`
        }
      }
      await axios.post(
        `/api/posts/${postId}/comments`,
        { content: commentContent[postId] },
        config
      )
      setCommentContent({ ...commentContent, [postId]: '' })
      fetchPosts()
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" onClose={() => setError(null)}>
          {error}
        </Message>
      ) : (
        posts.map((post) => (
          <Card key={post._id} className="my-3 shadow-sm rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={post.user.profilePicture || "https://via.placeholder.com/50"}
                    alt={post.user.username}
                    className="rounded-circle me-2"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                  <span className="fw-bold">{post.user.username}</span>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => openDeleteModal(post._id)}
                >
                  <Trash size={18} /> Delete
                </Button>
              </div>

              <Card.Text className="mt-3">{post.content}</Card.Text>
              {post.image && (
                <Card.Img
                  src={post.image}
                  alt="Post"
                  className="rounded mb-2"
                  style={{ maxHeight: "300px", objectFit: "cover" }}
                />
              )}
            </Card.Body>

            {/* Accordion for comments */}
            <div className="accordion" id={`accordion-${post._id}`}>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${post._id}`}
                    aria-expanded="true"
                    aria-controls={`collapse-${post._id}`}
                  >
                    <i className="fa-solid fa-comments"></i> Comments
                  </button>
                </h2>
                <div
                  id={`collapse-${post._id}`}
                  className="accordion-collapse collapse show"
                >
                  <div className="accordion-body">
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault()
                        submitCommentHandler(post._id)
                      }}
                    >
                      <Form.Group controlId={`comment-${post._id}`}>
                        <Form.Control
                          type="text"
                          placeholder="Write a Comment..."
                          value={commentContent[post._id] || ""}
                          onChange={(e) =>
                            setCommentContent({
                              ...commentContent,
                              [post._id]: e.target.value,
                            })
                          }
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          className="mt-3 btn-sm"
                        >
                          Comment
                        </Button>
                      </Form.Group>
                    </Form>
                    <hr />
                    <Card.Text className="mt-3">
                      {post.comments.map((comment) => (
                        <div key={comment._id}>
                          <strong>{comment.user.username}:</strong>{" "}
                          {comment.content}
                        </div>
                      ))}
                    </Card.Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this post?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deletePostHandler}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PostList
