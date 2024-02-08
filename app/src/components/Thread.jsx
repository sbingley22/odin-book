/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const Thread = ({ threadId }) => {
  let navigate = useNavigate();

  const [thread, setThread] = useState()
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem('accessToken');
  
        if (!accessToken) {
          navigate(`/`)
          return;
        }
  
        const url = `${apiUrl}users/threads/${threadId}`
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        })
        const jsonData = await response.json()
        //console.log(jsonData)
        
        if (jsonData) {
          setThread(jsonData.thread)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  },[])

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${apiUrl}users/threads/${threadId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ msg: newMessage }),
      });
      const jsonData = await response.json();
      console.log(jsonData)
      
      if (jsonData.success) {
        // Assuming the API returns the updated thread with the new message included
        setThread(jsonData.thread);
        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!thread) return (<></>)

  return (
    <div>
      <NavigationBar />
      <Container>
        <Row>
          <Col>
            <h1>{thread.title}</h1>
          </Col>
        </Row>
        {thread.messages.map(msg => (
          <Row key={msg._id}>
            <Col>
              <Card style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', backgroundColor: '#f8f9fa' }}>
                <Card.Body>
                  <Card.Title style={{ fontSize: "medium", textAlign: "left"}}>{msg.name}</Card.Title>
                  <Card.Text>{msg.msg}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ))}
        <Row>
          <Col>
            <Form onSubmit={handleSendMessage}>
              <Form.Group controlId="newMessage">
                <Form.Control
                  type="text"
                  placeholder="Type your message here"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit">Send</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Thread