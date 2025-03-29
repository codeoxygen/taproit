import React, { useState } from 'react';
import { ingestPDF } from '../services/api';

export const UploadPage: React.FC = () => {
  const [pdfPath, setPdfPath] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const response = await ingestPDF(pdfPath);
      setMessage(`Uploaded ${response.data.num_chunks} chunks successfully!`);
    } catch (error) {
      setMessage(`Error uploading PDF: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload PDF Document</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={pdfPath}
          onChange={(e) => setPdfPath(e.target.value)}
          placeholder="Enter PDF file path"
        />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};