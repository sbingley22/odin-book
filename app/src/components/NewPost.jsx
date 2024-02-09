import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar"
import { Form, Button, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL

const NewPost = () => {
  let navigate = useNavigate();

  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data for submission
      const data = {
        content: content,
      };
      // Submit the form
      const response = await fetch(`${apiUrl}users/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        // Redirect or handle success
        navigate(`/users/posts`);
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
      <h1>Create a New Post</h1>
      <Form>
        <Form.Group controlId="formContent"  className="m-2">
          <Form.Control
            type="text"
            placeholder="Enter content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSubmit} className="m-2">
          Submit
        </Button>
      </Form>
    </div>
  )
}

export default NewPost