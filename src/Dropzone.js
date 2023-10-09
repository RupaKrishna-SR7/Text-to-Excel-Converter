import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const Dropzone = ({ setData }) => {
  const [excelData, setExcelData] = useState(null);
  const [fileNameWithoutExtension, setFileNameWithoutExtension] = useState(
    'output'
  ); // Default file name without extension

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        const data = processTextToExcel(content);
        setExcelData(data);
      };

      reader.readAsText(file);
    }
  };

  const processTextToExcel = (textData) => {
    const rows = textData.split('\n');
    const excelData = rows.map((row) => row.split(','));
    return excelData;
  };

  const handleDownloadClick = () => {
    if (excelData) {
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const fileExtension = 'xlsx'; // You can change the extension if needed
      const fullFileName = `${fileNameWithoutExtension}.${fileExtension}`;
      XLSX.writeFile(wb, fullFileName);
    }
  };

  const handleFileNameChange = (event) => {
    setFileNameWithoutExtension(event.target.value);
  };

  return (
    <div className="dropzone">
      <main>
        <h2>Upload a .txt file</h2>
        <input type="file" accept=".txt" onChange={handleFileChange} />

        {excelData && (
          <div>
            <table>
              <thead>
                <tr>
                  {excelData[0].map((cell, index) => (
                    <th key={index}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {excelData && (
         <div>
         <label>
           Enter a name for the file : 
           <input
             type="text"
             value={fileNameWithoutExtension}
             onChange={handleFileNameChange}
           />
         </label>
         <button onClick={handleDownloadClick}>Download</button>
       </div>
        )}
      </main>
    </div>
  );
};

export default Dropzone;
