/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const Post = ({ postId }) => {
  let navigate = useNavigate();

  const [post, setPost] = useState()
  const [newComment, setComment] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem('accessToken');
  
        if (!accessToken) {
          navigate(`/`)
          return;
        }
  
        const url = `${apiUrl}users/posts/${postId}`
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
          setPost(jsonData)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  },[])

  const handleSendComment = async (e) => {
    e.preventDefault();
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${apiUrl}users/posts/${postId}/comment`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });
      const jsonData = await response.json();
      console.log(jsonData)
      
      if (jsonData.success) {
        // Assuming the API returns the updated thread with the new message included
        setPost(jsonData.post);
        setComment('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const likePost = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${apiUrl}users/posts/${postId}/like`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const jsonData = await response.json();
      //console.log(jsonData)
      
      if (jsonData.success) {
        console.log("Liked!")
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  if (!post) return (<></>)

  return (
    <div>
      <NavigationBar />
      <Container>
        <Row>
          <Col>
            <h4>{post.content}</h4>
          </Col>
          <Button onClick={likePost} variant="secondary" className="m-1">Like!</Button>
        </Row>
        {post.comments.map(comment => (
          <Row key={comment._id}>
            <Col>
              <Card style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', backgroundColor: '#f8f9fa' }}>
                <Card.Body>
                  <Card.Title style={{ fontSize: "medium", textAlign: "left"}}>{comment.name}</Card.Title>
                  <Card.Text>{comment.comment}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ))}
        <Row>
          <Col>
            <Form onSubmit={handleSendComment}>
              <Form.Group controlId="newComment">
                <Form.Control
                  type="text"
                  placeholder="Type your comment here"
                  value={newComment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="m-2">Send</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Post