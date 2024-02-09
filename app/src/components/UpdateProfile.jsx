/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const UpdateProfile = () => {
  let navigate = useNavigate()

  const [profile, setProfile] = useState({
    image: "",
    interests: "",
    about: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem('accessToken');
  
        if (!accessToken) {
          navigate(`/`)
          return;
        }
  
        const url = `${apiUrl}users/user/profile`
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
          setProfile(jsonData.profile)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  },[])

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name)
    setProfile({ ...profile, [name]: value });
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault()

    try {
      // Retrieve the access token from local storage
      const accessToken = localStorage.getItem('accessToken');
      console.log("Posting update profile")
      if (!accessToken) {
        navigate(`/`)
        return;
      }
      console.log("Have access token")

      const url = `${apiUrl}users/user/profile`
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          image: profile.image, 
          interests: profile.interests,
          about: profile.about,
        }),
      })
      console.log("Data fetched")
      const jsonData = await response.json()
      console.log(jsonData)
      
      if (jsonData.success) {
        console.log("navigating to: ", `/users/profiles/${jsonData.user.profile}`)
        navigate(`/users/profiles/${jsonData.user.profile}`)
        //navigate(`/`)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  //console.log(profile)

  //if (!profile) return(<></>)

  return (
    <div>
      <NavigationBar />
      <Container>
        <Row>
          <Col>
            <Form onSubmit={handleUpdateProfile}>
              <Form.Group controlId="imageUrl">
                <Form.Control
                  type="text"
                  placeholder="Enter a url to your profile picture"
                  value={profile.image}
                  name="image"
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="interests">
                <Form.Control
                  type="text"
                  placeholder="Enter your interests"
                  value={profile.interests}
                  name="interests"
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="about">
                <Form.Control
                  type="text"
                  placeholder="About you"
                  value={profile.about}
                  name="about"
                  onChange={handleChange}
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

export default UpdateProfile