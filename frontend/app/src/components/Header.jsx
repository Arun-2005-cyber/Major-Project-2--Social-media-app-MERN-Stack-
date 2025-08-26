import React, { useState, useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
function Header() {


    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, [])

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        setUser(null)
        navigate("/login")
    }
    return (
        <>
            <nav className="navbar navbar-expand-lg bg-primary p-3" data-bs-theme="dark">
                <div className="container-fluid">
                    <LinkContainer to='/'>
                        <Link className="navbar-brand">Social Media App</Link>
                    </LinkContainer>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarColor02">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <LinkContainer to='/'>
                                    <Link className="nav-link active">Home
                                        <span className="visually-hidden">(current)</span>
                                    </Link>
                                </LinkContainer>
                            </li>

                            <li className="nav-item">
                                <LinkContainer to="/chats">
                                    <Link  className="nav-link">Chat</Link>
                                </LinkContainer>
                            </li>
                            <li className="nav-item dropdown">
                                <LinkContainer to='/'>
                                    <Link className="nav-link dropdown-toggle" data-bs-toggle="dropdown" to='/' role="button" aria-haspopup="true" aria-expanded="false">{user ? `Welcome  ${user.username}` : "Signin"}</Link>
                                </LinkContainer>
                                <div className="dropdown-menu">

                                    {!user ? (
                                        <>
                                            <LinkContainer to='/login'>
                                                <Link className="dropdown-item">Login</Link>
                                            </LinkContainer>

                                            <LinkContainer to='/signup'>
                                                <Link className="dropdown-item">SignUp</Link>
                                            </LinkContainer>
                                        </>
                                    ) : (
                                        <>
                                            
                                                <Link className="dropdown-item" onClick={logoutHandler}>Logout</Link>
                                            

                                            <div className="dropdown-divider"></div>

                                            <LinkContainer to='/profile'>
                                                <Link className="dropdown-item">Profile</Link>
                                            </LinkContainer>
                                        </>
                                    )}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header