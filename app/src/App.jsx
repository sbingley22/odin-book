import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap';
import './App.css'

const apiUrl = import.meta.env.VITE_API_URL

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  let navigate = useNavigate();

  const fetchLoginData = async () => {
    try {
      // Retrieve the access token from local storage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        return;
      }

      const url = `${apiUrl}users/`
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      })
      const jsonData = await response.json()
      console.log(jsonData)
      
      if (jsonData && jsonData.profileid) {
        console.log("navigating to profile page")
        navigate(`/users/profiles/${jsonData.profileid}`)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Try to login with webtoken
  useEffect(() => {
    fetchLoginData()
  },[])

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const url = `${apiUrl}users/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const jsonData = await response.json();
      
      // Handle successful login
      console.log('Login successful:', jsonData);

       // Check if the response contains an access token
      if (jsonData && jsonData.accessToken) {
        // Store the access token in local storage or a cookie
        localStorage.setItem('accessToken', jsonData.accessToken);

        fetchLoginData()
      } else {
        // Handle login error, if no access token is provided
        console.error('No token provided!')
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const useDummy = async (e) => {
    e.preventDefault()
    try {
      const url = `${apiUrl}users/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: "user1", password: "password1" }),
      });
      const jsonData = await response.json();
      
      // Handle successful login
      console.log('Login successful:', jsonData);

       // Check if the response contains an access token
      if (jsonData && jsonData.accessToken) {
        // Store the access token in local storage or a cookie
        localStorage.setItem('accessToken', jsonData.accessToken);

        fetchLoginData()
      } else {
        // Handle login error, if no access token is provided
        console.error('No token provided!')
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  const signup = () => {
    navigate('/users/sign-up')
  }

  return (
    <>
      <Form onSubmit={handleLogin}>
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Login
        </Button>

        <Button variant="primary" onClick={signup} style={{ margin: "20px"}}>
          Sign Up
        </Button>

        <Button variant="primary" onClick={useDummy} style={{ margin: "20px"}}>
          Use Dummy Account
        </Button>
      </Form>
    </>
  )
}

export default App
