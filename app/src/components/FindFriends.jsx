import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
//import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "react-bootstrap";

const apiUrl = import.meta.env.VITE_API_URL

const FindFriends = () => {
  let navigate = useNavigate();

  const [friends, setFriends] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem('accessToken');
  
        if (!accessToken) {
          navigate(`/`)
          return;
        }
  
        const url = `${apiUrl}users/add-friends`
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
          setFriends(jsonData.nonFriends)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  },[])

  const sendRequest = async (id) => {
    try {
      // Retrieve the access token from local storage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate(`/`)
        return;
      }

      const url = `${apiUrl}users/add-friends`
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          friendId: id
        }),
      })
      const jsonData = await response.json()
      //console.log(jsonData)
      
      if (jsonData) {
        console.log("Sent Request")
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div>
      <NavigationBar />
      <h1>Potential Friends</h1>
      {
        friends.map(friend => (
          <div key={friend._id}>
            <Link to={`/users/profiles/${friend.profile}`}>
              {`${friend.firstname} ${friend.lastname}`}
            </Link>
            <Button className="m-2" onClick={()=>{sendRequest(friend._id)}}>
              Send Request
            </Button>
          </div>
        ))
      }
    </div>
  )
}

export default FindFriends