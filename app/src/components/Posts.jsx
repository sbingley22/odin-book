import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Card, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const Posts = () => {
  let navigate = useNavigate();

  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem('accessToken');
  
        if (!accessToken) {
          navigate(`/`)
          return;
        }
  
        const url = `${apiUrl}users/posts`
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
        
        if (jsonData) {
          setPosts(jsonData)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  },[])

  return (
    <Container>
      <NavigationBar />
      <h1>Posts</h1>
      <Row>
        {posts.map(post => (
          <Col key={post._id} lg={4} md={6} sm={12}>
            <Card className="mb-1 pb-1" style={{ backgroundColor: "#EEEEEE"}}>
              <Card.Body >
                <Card.Text className="text-left" style={{ fontSize: "medium", fontWeight: "bold", textAlign: "left"}}>{post.name}</Card.Text>
                <Card.Text className="text-center" style={{ fontSize: "Large"}}>{post.content}</Card.Text>
                {/* <Card.Text className="text-right small m-0">{post.date}</Card.Text> */}
                <Card.Text className="text-left m-1" style={{display: "block", textAlign: "left"}}>Likes: {post.likes.length}</Card.Text>
                <Card.Text className="text-left m-1" style={{display: "block", textAlign: "left"}}>Comments: {post.comments.length}</Card.Text>
                <Link to={`/users/posts/${post._id}`} className="stretched-link" style={{ textDecoration: 'none', margin: 0 }} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Posts