/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const Notifications = () => {
  let navigate = useNavigate();

  const [user, setUser] = useState()
  const [notifications, setNotifications] = useState([])

  const fetchData = async () => {
    try {
      // Retrieve the access token from local storage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate(`/`)
        return;
      }

      const url = `${apiUrl}users/notifications`
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
      
      if (jsonData.success) {
        setUser(jsonData.user)
        setNotifications(jsonData.friendRequests)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  },[])

  const acceptFriend = async (requestId) => {
    try {
      // Retrieve the access token from local storage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate(`/`)
        return;
      }

      const url = `${apiUrl}users/notifications/accept-friend`
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ requestId: requestId }),
      })
      const jsonData = await response.json()
      console.log(jsonData)
      
      if (jsonData.success) {
        console.log("Friend added")
        fetchData()
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const ignoreFriend = async (requestId) => {
    try {
      // Retrieve the access token from local storage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate(`/`)
        return;
      }

      const url = `${apiUrl}users/notifications/reject-friend`
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ requestId: requestId }),
      })
      const jsonData = await response.json()
      console.log(jsonData)
      
      if (jsonData.success) {
        console.log("Friend added")
        fetchData()
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div>
      <NavigationBar />
      <Container>
        <Row>
          <Col>
            <h1>Friend Requests</h1>
          </Col>
        </Row>
        {notifications.map(fr => (
          <Row key={fr._id}>
            <Col>
              <Card style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', backgroundColor: '#f8f9fa' }}>
                <Card.Body>
                  <Card.Title style={{ fontSize: "larger", textAlign: "center"}}>{`${fr.firstname} ${fr.lastname}`}</Card.Title>
                  <Card.Text>
                    <Link to={`/users/profiles/${fr.profile}`}>View Profile</Link>
                  </Card.Text>
                  <Button onClick={()=>(acceptFriend(fr._id))} className="m-1">Accept</Button>
                  <Button onClick={()=>(ignoreFriend(fr._id))} className="m-1">Ignore</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ))}
      </Container>
    </div>
  )
}

export default Notifications