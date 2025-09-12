import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

function UserPost({ userId: propUserId }) {
  const { userId: paramUserId } = useParams(); // from route if available
  const userId = propUserId || paramUserId; // ✅ pick prop first, fallback to params

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return; // prevent crash

    const fetchUserPosts = async () => {
      try {
        const { data } = await axios.get(`/api/posts/user/${userId}`, {
          withCredentials: true,
        });
        setPosts(data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
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
              <Card.Title>{post.user?.username}</Card.Title>
              <Card.Text>{post.content}</Card.Text>

              {/* Comments */}
              <div className="mt-3">
                <h6>Comments</h6>
                {post.comments.length === 0 ? (
                  <p>No comments yet.</p>
                ) : (
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
