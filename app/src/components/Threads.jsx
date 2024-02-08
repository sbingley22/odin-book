import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL

const Threads = () => {
  let navigate = useNavigate();

  const [threads, setThreads] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem('accessToken');
  
        if (!accessToken) {
          navigate(`/`)
          return;
        }
  
        const url = `${apiUrl}users/threads`
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
          setThreads(jsonData.threads)
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
      <h1>Threads</h1>
      {
        threads.map(thread => (
          <div key={thread._id}>
            <Link to={`/users/threads/${thread._id}`}>
              {thread.title}
            </Link>
          </div>
        ))
      }
    </div>
  )
}

export default Threads