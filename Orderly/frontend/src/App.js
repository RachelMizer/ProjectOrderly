import './App.css';

import axios from 'axios';
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/")
      .then(response => {
        console.log("Backend connected:", response.data);
      })
      .catch(error => {
        console.error("Connection error:", error);
      });
  }, []);



  return (
    <div>
     <h1>Orderly frontend running...</h1> 
    </div>
  );
}

export default App;
