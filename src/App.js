import React, { useState } from 'react';
import './App.css';
import TextToExcel from './TextToExcel';

function App() {
  const [data, setData] = useState([]);

  return (
    <div className="App">
      <h1>Text File to Excel File Converter</h1>
      <TextToExcel setData={setData} />

      {/* Display the uploaded data */}
      {data.length > 0 && (
        <div className="uploaded-data">
          <h3>Uploaded Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
