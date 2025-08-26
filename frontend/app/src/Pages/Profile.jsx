import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Card, Form, ListGroup } from 'react-bootstrap';
import QRCode from 'qrcode';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Link, useNavigate } from 'react-router-dom';


function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState([])
  const [profilePicture, setProfilePicture] = useState("")




  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const userInfo = localStorage.getItem("userInfo");

        if (!userInfo) {
          navigate("/login");
          return;
        }
        const parsedUser = JSON.parse(userInfo);
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedUser.token}`
          }
        };
        const { data } = await axios.get("/api/users/profile", config);
        setUser(data)

        if (data.twoFactorAuthSecret) {
          const otpauthurl = `otpauth://totp/SecretKey?secret=${data.twoFactorAuthSecret}`;
          QRCode.toDataURL(
            otpauthurl,
            { width: 200, margin: 2 },
            (err, url) => {
              if (!err) {
                setQrCodeUrl(url)
              }
            }
          )
        }
      }
      catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("userInfo");
          navigate("/login")
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile()
  }, [navigate])


  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      setError(null)
      const userInfo = localStorage.getItem("userInfo");

      if (!userInfo) {
        navigate("/login");
        return;
      }
      const parsedUser = JSON.parse(userInfo);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`
        }
      };

      const { data } = await axios.get(`/api/users/search?keyword=${keyword}`, config)
      setResults(data)
    }
    catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }


  const enable2FA = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const userInfo = localStorage.getItem("userInfo");
      const parsedUser = JSON.parse(userInfo)

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`
        }
      };

      const { data } = await axios.post("/api/auth/enable-2fa", {}, config);


      QRCode.toDataURL(data.otpauthUrl, { width: 200, margin: 2 }, (err, url) => {
        if (err) return setError("Failed to generate QR Code");
        setQrCodeUrl(url);
      });

      setMessage("Two Factor Authentication Enabled.");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };



  const uploadProfilePictureHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const userInfo = localStorage.getItem("userInfo");

      if (!userInfo) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(userInfo);

      const config = {
        headers: {
          Authorization: `Bearer ${parsedUser.token}`
        }
      };

      const formData = new FormData();
      formData.append("profilePicture", profilePicture);

      const { data } = await axios.post("/api/users/profile/upload", formData, config);

      setMessage("Profile Picture is Updated Successfully");
      setUser({ ...user, profilePicture: data.profilePicture })
    }
    catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
    finally {
      setLoading(false);
    }
  };



  const followUser = async (userId) => {
    try {
      setLoading(true);


      const userInfo = localStorage.getItem("userInfo");
      const parsedUser = JSON.parse(userInfo)

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`
        }
      };
      await axios.post(`/api/users/follow/${userId}`, {}, config)
      setMessage("User followed Successfully")

      const { data } = await axios.get("/api/users/profile", config)
      setUser(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }


  const unfollowUser = async (userId) => {
    try {
      setLoading(true);


      const userInfo = localStorage.getItem("userInfo");
      const parsedUser = JSON.parse(userInfo)

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`
        }
      };
      await axios.post(`/api/users/unfollow/${userId}`, {}, config)
      setMessage("User Unfollowed Successfully")

      const { data } = await axios.get("/api/users/profile", config)
      setUser(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Container>
      <Row>
        <Col md={5}>
          <Card className='mt-4 p-3'>
            <h3 className='text-center mt-2'>Welcome</h3>
            {message && (
              <Message variant='success' onClose={() => setMessage("")}>
                {message}
              </Message>
            )}

            {error && (
              <Message variant='danger' onClose={() => setError(null)}>
                {error}
              </Message>
            )}

            {/* Profile pic */}

            <div className="text-center">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="profile" className='rounded-circle' width='150' height='150' />
              ) : (
                <div className='placeholder rounded-circle mb-3' style={{ width: "100px", height: "100px" }}></div>
              )}
            </div>

            <Form onSubmit={uploadProfilePictureHandler}>
              <Form.Group>

                <Form.Control type='file' onChange={(e) => setProfilePicture(e.target.files[0])}>

                </Form.Control>
              </Form.Group>
              <Button type='submit' className='my-3 w-100'>
                Upload / Edit Profile Picture
              </Button>
            </Form>


            <ul className="list-group">
              <li className="list-group-item list-group-item-primary  d-flex justify-content-between align-items-center">
                <strong>Username :</strong>{user.username}
              </li>
              <li className="list-group-item list-group-item-secondary   d-flex justify-content-between align-items-center">
                <strong>Email :</strong>{user.email}
              </li>
              {!user.twoFactorAuthSecret && (
                <Button
                  onClick={enable2FA}
                  variant='primary'
                  className='mt-3'
                >
                  Enable 2FA
                </Button>
              )}
              {qrCodeUrl && (
                <div className="accordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                        Authenticate QR Code
                      </button>
                    </h2>
                    <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show">
                      <div className="accordion-body">
                        <img src={qrCodeUrl} alt="2FA QR Code" />
                      </div>
                    </div>
                  </div>
                </div>

              )}
            </ul>
          </Card>
        </Col>

        <Col md={7}>
          <Card className='mt-4 p-3'>
            <h3 className='text-center mt-2'>Search User</h3>
            <Form onSubmit={searchHandler} className='d-flex'>
              <Form.Group controlId='keyword'>
                <Form.Control
                  type='text'
                  placeholder='Search Username'
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className='form-control me-sm-2'
                ></Form.Control>
              </Form.Group>
              <Button type='submit' className='mt-3 btn btn-primary my-2 my-sm-0'> Search</Button>
            </Form>
            {loading && <Loader />}
            {error && <Message variant='danger'>{error}</Message>}
            <ListGroup className='mt-4'>
              {results.map((result) => (
                <ListGroup.Item key={result._id}>
                  <Link to={`/user/${result._id}`}>{result.username}</Link>
                  <Button variant='success' className='mt-4 my-4 mx-4' onClick={()=>followUser(result._id)}>
                    Follow
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Row>
              <Col md={6}>
                <h5 className='mt-4 p-2 text-center'>Followers <span className="badge bg-primary rounded-pill">
                  {user.followers?.length}
                </span></h5>

                {user.followers?.map((follower) => (
                  <Row>
                    <Col key={follower._id} className='mb-3'>
                      <Card className='h-100 text-center'>
                        <Card.Body className='d-flex align-items-center'>
                          <Link to={`/user/${follower._id}`}>
                            <Card.Img
                              variant='top'
                              src={
                                follower.profilePicture ||
                                "https://via-placeholder.con/50"
                              }
                              alt={follower.username}
                              className='rounded-circle me-2'
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover"
                              }}
                            />
                          </Link>
                          <Card.Title className='mb-3'>
                            <Link to={`/user/${follower._id}`}>
                              {follower.username}
                            </Link>
                          </Card.Title>

                          <Button variant='success' className='ms-2 btn-sm' onClick={()=>followUser(follower._id)}>
                              follow
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                ))}

              </Col>
              <Col md={6}>
                <h5 className='mt-4 p-2 text-center'>Following <span className="badge bg-primary rounded-pill">
                  {user.following?.length}
                </span></h5>


                {user.following?.map((following) => (
                  <Row>
                    <Col key={following._id} className='mb-3'>
                      <Card className='h-100 text-center'>
                        <Card.Body className='d-flex align-items-center'>
                          <Link to={`/user/${following._id}`}>
                            <Card.Img
                              variant='top'
                              src={
                                following.profilePicture ||
                                "https://via-placeholder.con/50"
                              }
                              alt={following.username}
                              className='rounded-circle me-2'
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover"
                              }}
                            />
                          </Link>
                          <Card.Title className='mb-3'>
                            <Link to={`/user/${following._id}`}>
                              {following.username}
                            </Link>
                          </Card.Title>

                          <Button variant='danger' className='ms-2 btn-sm' onClick={()=>unfollowUser(following._id)}>
                                Unfollow
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                ))}

              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );

}

export default Profile;
