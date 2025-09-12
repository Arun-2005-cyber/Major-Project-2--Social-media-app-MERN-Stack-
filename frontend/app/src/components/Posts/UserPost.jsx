import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import API from "../../api/axios"; // ✅ use same axios instance

function UserPost({ userId: propUserId }) {
  const { userId: paramUserId } = useParams();
  const userId = propUserId || paramUserId;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchUserPosts = async () => {
      try {
        setError("");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        };

        const { data } = await API.get(`/api/posts/user/${userId}`, config);
        setPosts(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="mt-3">
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <Card key={post._id} className="mb-3">
            {post.image && (
              <Card.Img
                variant="top"
                src={post.image}
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            )}
            <Card.Body>
              <Card.Title>{post.user?.username || "Unknown User"}</Card.Title>
              <Card.Text>{post.content}</Card.Text>

              {/* Comments */}
              <div className="mt-3">
                <h6>Comments</h6>
                {Array.isArray(post.comments) && post.comments.length > 0 ? (
                  post.comments.map((c) => (
                    <div key={c._id} className="d-flex align-items-center mb-2">
                      <img
                        src={
                          c.user?.profilePicture ||
                          "https://via.placeholder.com/30"
                        }
                        alt={c.user?.username}
                        className="rounded-circle me-2"
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "cover",
                        }}
                      />
                      <strong>{c.user?.username}:</strong> {c.content}
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
}

export default UserPost;
