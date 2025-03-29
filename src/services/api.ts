import axios from 'axios';
// c:\Users\isuru\Desktop\Taproit\docs\knowledge_base.pdf
// const API_BASE = 'http://127.0.0.1:8000';
const API_BASE = 'http://192.168.22.181:8000';

export const ingestPDF = async (pdfPath: string) => {
  return axios.post(`${API_BASE}/ingest_pdf`, { pdf_path: pdfPath });
};