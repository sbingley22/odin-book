import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Form, Button, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL

const NewThread = () => {
  let navigate = useNavigate();

  const [friends, setFriends] = useState([])
  const [user, setUser] = useState()
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [title, setTitle] = useState("");

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
        //console.log(jsonData)
        
        if (jsonData) {
          setFriends(jsonData.friends)
          setUser(jsonData.user)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  },[])

  const handleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userIds = [...selectedFriends]
    userIds.push(user._id)
    console.log(userIds)

    try {
      // Prepare data for submission
      const data = {
        title: title,
        userids: userIds
      };
      // Submit the form
      const response = await fetch(`${apiUrl}users/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        // Redirect or handle success
        navigate(`/users/threads`);
      } else {
        // Handle error
        console.error('Error submitting form:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div>
      <NavigationBar />
      <h1>Start a New Thread</h1>
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Select Friends</Accordion.Header>
          <Accordion.Body>
            <Form>
              {friends.map(friend => (
                <Form.Check
                  key={friend._id}
                  type="checkbox"
                  id={friend._id}
                  label={`${friend.firstname} ${friend.lastname}`}
                  checked={selectedFriends.includes(friend._id)}
                  onChange={() => handleFriendSelection(friend._id)}
                />
              ))}
              <Form.Group controlId="formTitle"  className="m-2">
                <Form.Control
                  type="text"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleSubmit} className="m-2">
                Submit
              </Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

export default NewThread