import React, { useState,useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import Loader from '../Loader';
import Message from '../Message';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios'


function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/';
  const [loginAttempted, setLoginAttempted] = useState(false);

  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const [FormValues, setFormValues] = useState({
    email: '',
    password: '',
    token: ''
  });

  const [FormErrors, setFormErrors] = useState({
    email: '',
    password: '',
    token: ''
  });

   useEffect(() => {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        navigate('/profile')
      }
    }, [navigate]);

  // useEffect(() => {
  //   if (userinfo && loginAttempted) {
  //     navigate(redirect);
  //   } else if (loginAttempted) {
  //     navigate('/login');
  //   }
  // }, [userinfo, loginAttempted, navigate, redirect]);

  const getValidationClass = (name) => {
    if (FormValues[name] === "") return "";
    return FormErrors[name] ? "is-invalid" : "is-valid"
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...FormValues, [name]: value });
    validateField(name, value);
  };

  const isFormValid = () => {
    return (
      Object.values(FormErrors).every((error) => error === null) &&
      Object.values(FormValues).every((value) => value !== '' && value !== false)
    );
  };

  const clearForm = () => {
    setFormValues({ email: '', password: '', token: '' });
  };

  const validateField = (name, value) => {
    let errorMessage = null;

    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = 'Your email is invalid.';
        }
        break;
      case 'password':
        if (value.length < 6) {
          errorMessage = 'Password must be at least 6 characters.';
        }

      // eslint-disable-next-line no-fallthrough
      case 'otp':
        if (!value) {
          errorMessage = 'Password must be at least 6 characters.';
        }
        break;

      default:
        break;
    }

    setFormErrors({ ...FormErrors, [name]: errorMessage });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate all fields before submit
    Object.keys(FormValues).forEach((key) => {
      validateField(key, FormValues[key]);
    });

    if (!isFormValid()) {
      setMessage("Please fill out all the form fields correctly...");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError(null);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/auth/login",
        FormValues,
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      clearForm();
      navigate("/profile");
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };
  const [visible, setVisible] = useState(true);
  const handleClose = () => {
    setVisible(false);

  };
  if (!visible) return null;

 


  return (
    <>
      <Container>
        <Row>
          <Col md={3}></Col>
          <Col md={6} className='mt-5'>
            {loading ? (
              <Loader />
            ) : error ? (
              <Message variant="danger" onClick={handleClose} >{error}</Message>
            ) : message ? (
              <Message variant="success" onClick={handleClose} >{message}</Message>
            ) : null}
            <Card>
              <Form onSubmit={submitHandler} className='mt-4 p-3'>
                <h1 className="text-center">Login Here</h1>

                <Form.Group controlId="email" className="mt-3">
                  <Form.Label>E-Mail</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your E-Mail"
                    name="email"
                    value={FormValues.email}
                    onChange={handleChange}
                    isInvalid={!!FormErrors.email}
                    isValid={FormValues.email !== '' && !FormErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {FormErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="pass1" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your Password"
                      name="password"
                      value={FormValues.password}
                      onChange={handleChange}
                      isInvalid={!!FormErrors.password}
                      isValid={FormValues.password !== '' && !FormErrors.password}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ borderLeft: 'none' }}
                    >
                      <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {FormErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label>2FA Token</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter OTP from Authenticator"
                    name="token"
                    value={FormValues.token}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    {FormErrors.token}
                  </Form.Control.Feedback>
                </Form.Group>


                <Button
                  type="submit"
                  className="btn-success mt-4 mb-4 w-100"
                  disabled={!isFormValid()}
                >
                  Login
                </Button>
              </Form>
            </Card>

            <Row className='py-3'>
              <Col>
                New User ?
                <Link to="/signup">SignUp</Link>
              </Col>
            </Row>

          </Col>
          <Col md={3}></Col>
        </Row>
      </Container>
    </>
  );
}

export default LoginScreen;
