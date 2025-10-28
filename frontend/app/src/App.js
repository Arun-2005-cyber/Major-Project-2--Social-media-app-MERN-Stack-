import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap'
import Header from './components/Header';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './Pages/Profile';
import Home from './Pages/Home';
import ChatPage from './components/Chat/ChatPage';
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";


function App() {
  const { user } = useAuth();
  return (
    <>
      <Router>
        <Header />
        <Container>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chats" element={<PrivateRoute><ChatPage user={user} /></PrivateRoute>} />
          </Routes>

        </Container>
      </Router>
    </>

  )
}

export default App