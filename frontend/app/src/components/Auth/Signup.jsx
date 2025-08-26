import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Message from "../Message";
import Loader from "../Loader";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/";

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    validateField(name, newValue);
  };

  const isFormValid = () => {
    // FIX: Error fields should be empty strings, not null
    return (
      Object.values(formErrors).every((error) => error === "") &&
      Object.values(formValues).every(
        (value) => value !== "" && value !== false
      )
    );
  };

  const validateField = (name, value) => {
    let errorMessage = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          errorMessage = "This field is required.";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errorMessage = "This field is required.";
        } else if (!emailRegex.test(value)) {
          errorMessage = "Your email is invalid.";
        }
        break;
      case "password":
        const passwordRegex =
          /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
        if (!value) {
          errorMessage = "This field is required.";
        } else if (!passwordRegex.test(value)) {
          errorMessage =
            "Password must include at least one uppercase letter, one number, one special character, and be at least 6 characters long.";
        }
        break;
      case "confirmPassword":
        if (!value) {
          errorMessage = "This field is required.";
        } else if (value !== formValues.password) {
          errorMessage = "Passwords do not match.";
        }
        break;
      case "termsAccepted":
        if (!value) {
          errorMessage = "You must accept the terms and conditions.";
        }
        break;
      default:
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const clearForm = () => {
    setFormValues({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    });
    setFormErrors({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: "",
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate all fields before submit
    Object.keys(formValues).forEach((key) => {
      validateField(key, formValues[key]);
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
        "/api/auth/signup",
        formValues,
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      clearForm();
      navigate(redirect);
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
    <Container>
      <Row>
        <Col md={4}></Col>
        <Col md={4}>
          {loading && <Loader />}
          {message && !loading && (
            <Message variant="success" onClose={handleClose}>
              {message}
            </Message>
          )}
          {error && (
            <Message variant="danger" onClose={() => setError(null)}>
              {error}
            </Message>
          )}
          <Card className="mt-4 p-3">
            <Form noValidate onSubmit={submitHandler}>
              <h1 className="text-center mb-4">Signup Here</h1>

              {/* Username */}
              <Form.Group controlId="username">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter User Name"
                  name="username"
                  value={formValues.username}
                  onChange={handleChange}
                  isInvalid={!!formErrors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.username}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Email */}
              <Form.Group controlId="email" className="mt-3">
                <Form.Label>E-Mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your E-Mail"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  isInvalid={!!formErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password */}
              <Form.Group controlId="password" className="mt-3">
                <Form.Label>Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    isInvalid={!!formErrors.password}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ borderLeft: "none" }}
                    type="button" // FIX: avoid submitting when clicking eye button
                  >
                    <i
                      className={`fa ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </Button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {formErrors.password}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Confirm Password */}
              <Form.Group controlId="confirmPassword" className="mt-3">
                <Form.Label>Confirm Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!formErrors.confirmPassword}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    style={{ borderLeft: "none" }}
                    type="button" // FIX: avoid form submit
                  >
                    <i
                      className={`fa ${
                        showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </Button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {formErrors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Terms */}
              <Form.Group className="mt-3">
                <Form.Check
                  name="termsAccepted"
                  label="Agree to terms and conditions"
                  checked={formValues.termsAccepted}
                  onChange={handleChange}
                  isInvalid={!!formErrors.termsAccepted}
                />
                {formErrors.termsAccepted && (
                  <div className="invalid-feedback d-block">
                    {formErrors.termsAccepted}
                  </div>
                )}
              </Form.Group>

              {/* Submit */}
              <Button
                type="submit"
                className="btn-success mt-4 mb-4 w-100"
              >
                Sign Up
              </Button>
            </Form>
          </Card>

          <Row className="py-3">
            <Col>
              Already a User? <Link to="/login">Login</Link>
            </Col>
          </Row>
        </Col>
        <Col md={4}></Col>
      </Row>
    </Container>
  );
}

export default Signup;
