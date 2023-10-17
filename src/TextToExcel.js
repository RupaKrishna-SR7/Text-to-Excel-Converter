
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { log } from './logger'; // Import the logger

const TextToExcel = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [showPreviewIndex, setShowPreviewIndex] = useState(-1);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);

    if (newFiles.length > 0) {
      for (const file of newFiles) {
        // Check if a file with the same name already exists in the array
        const isDuplicate = files.some((existingFile) => existingFile.file.name === file.name);

        if (isDuplicate) {
          setError(`File ${file.name} has already been uploaded.`);
        } else if (file.size === 0) {
          setError(`File ${file.name} is empty. Please upload a file with content.`);
        } else if (file.name.split('.').pop() !== 'txt') {
          setError(`File ${file.name} is not a .txt file. Please upload .txt files only.`);
        } else {
          setError(null);
          setFiles((prevFiles) => [...prevFiles, { file, newName: '' }]);
          setUploadMessage('File uploaded successfully. To add more files, click on the upload button again.');

          // Reset the file input field
          const fileInput = event.target;
          fileInput.value = '';

          // Log the successful upload
          log(`File ${file.name} uploaded successfully.`);
        }
      }
    }
  };

  const togglePreview = (index) => {
    if (showPreviewIndex === index) {
      setShowPreviewIndex(-1);
      setExcelData(null);
    } else {
      setShowPreviewIndex(index);
      const file = files[index].file;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setExcelData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleRenameFile = (index, newName) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles[index].newName = newName;
      return updatedFiles;
    });
  };

  const handleClearRename = (index) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles[index].newName = '';
      return updatedFiles;
    });
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });

    // Reset the file input field
    const fileInput = document.querySelector('input[type="file"]');
    fileInput.value = null;

    // Log the file removal
    log(`File ${files[index].file.name} removed.`);
  };

  const handleDownloadClick = () => {
    if (files.length === 0) {
      setError('Please upload one or more .txt files before downloading.');
    } else {
      setError(null);

      files.forEach((fileObj, index) => {
        const file = fileObj.file;
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const data = processTextToExcel(content);

          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          const fileExtension = 'xlsx';

          const fileNameWithoutExtension = fileObj.newName || file.name.replace(/\.[^/.]+$/, '');
          const fullFileName = `${fileNameWithoutExtension}.${fileExtension}`;
          XLSX.writeFile(wb, fullFileName);

          // Log the file download
          log(`File ${fullFileName} downloaded.`);
        };

        reader.readAsText(file);
      });
    }
  };

  const processTextToExcel = (textData) => {
    const rows = textData.split('\n');
    const excelData = rows
      .map((row) => row.split(','))
      .filter((row) => row.join('').trim() !== '');
    return excelData;
  };

  return (
    <div className="TextToExcel">
      <main>
        <h2>Upload .txt files</h2>
        <input type="file" accept=".txt" multiple onChange={handleFileChange} />

        {uploadMessage && <p className="upload-message">{uploadMessage}</p>}

        {files.length > 0 && (
          <div>
            <h3>Uploaded Files:</h3>
            <ul>
              {files.map((fileObj, index) => (
                <li key={index}>
                  <h4>{fileObj.file.name.replace(/\.[^/.]+$/, '')}</h4>
                  <label>
                    *Enter a name for the file :
                    <input
                      type="text"
                      value={fileObj.newName}
                      placeholder={`File ${index + 1}`}
                      onChange={(e) => handleRenameFile(index, e.target.value)}
                    />
                  </label>
                  <button onClick={() => handleClearRename(index)}>Clear</button>
                  <button onClick={() => handleRemoveFile(index)}>Remove</button>
                  <button onClick={() => togglePreview(index)}>
                    {showPreviewIndex === index ? 'Hide Preview' : 'Preview'}
                  </button>
                  {showPreviewIndex === index && (
                    <div className="preview">
                      {excelData && (
                        <div className="table-container">
                          <table>
                            <thead>
                              <tr>
                                {excelData
                                  .split('\n')[0]
                                  .split(',')
                                  .map((column, columnIndex) => (
                                    <th key={columnIndex}>{column}</th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              {excelData.split('\n').map((row, rowIndex) => {
                                const columns = row.split(',').map((column) => column.trim());
                                if (columns.some((column) => column !== '')) {
                                  return (
                                    <tr key={rowIndex}>
                                      {columns.map((column, columnIndex) => (
                                        <td key={columnIndex}>{column}</td>
                                      ))}
                                    </tr>
                                  );
                                }
                                return null; // Exclude rows with only commas
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}

        <div>
          <button onClick={handleDownloadClick}>Download</button>
        </div>
      </main>
    </div>
  );
};

export default TextToExcel;
