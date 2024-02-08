import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
//import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const Friends = () => {
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
  
        const url = `${apiUrl}users/friends`
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
          setFriends(jsonData.friends)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  },[])

  return (
    <div>
      <NavigationBar />
      <h1>Friends</h1>
      {
        friends.map(friend => (
          <div key={friend._id}>
            <Link to={`/users/profiles/${friend.profile}`}>
              {`${friend.firstname} ${friend.lastname}`}
            </Link>
          </div>
        ))
      }
    </div>
  )
}

export default Friends