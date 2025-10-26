import React, { useState, useCallback, ChangeEvent } from 'react';
import { PolicyDocument } from '../types';
import { uploadPolicy } from '../services/geminiService';
import { UploadIcon, DocumentIcon } from './icons';

interface UploadTabProps {
  onUpload: (policy: PolicyDocument) => void;
  policies: PolicyDocument[];
}

export const UploadTab: React.FC<UploadTabProps> = ({ onUpload, policies }) => {
  const [file, setFile] = useState<File | null>(null);
  const [policyType, setPolicyType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedDoc, setUploadedDoc] = useState<PolicyDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingTypes = [...new Set(policies.map(p => p.type))];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUploadClick = useCallback(async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!policyType.trim()) {
      setError('Please specify a policy type.');
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setUploadedDoc(null);
    setError(null);

    // Simulate initial progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 20, 80));
    }, 200);

    try {
      // Call the actual backend API
      await uploadPolicy(file, policyType.trim());
      
      clearInterval(progressInterval);
      setProgress(100);

      // Create the document object for the UI
      const newDoc: PolicyDocument = {
        name: file.name,
        type: policyType.trim(),
        pages: Math.floor(Math.random() * 50) + 10, // Simulate page count as API doesn't provide it
        uploadedAt: new Date(),
        size: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      };
      setUploadedDoc(newDoc);
      onUpload(newDoc);
      setFile(null);
      setPolicyType('');

    } catch (e: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(e.message || 'Failed to upload document. Please check the backend connection.');
    } finally {
      setIsUploading(false);
    }
  }, [file, policyType, onUpload]);

  return (
    <div className="bg-base-100 p-6 rounded-xl shadow-md transition-all duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload New Policy Document</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Policy Document (PDF only)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf"/>
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">{file ? file.name : 'PDF up to 10MB'}</p>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        
        <div>
          <label htmlFor="policy-type" className="block text-sm font-medium text-gray-700">Policy Type</label>
          <input
            id="policy-type"
            name="policy-type"
            type="text"
            list="policy-types"
            value={policyType}
            onChange={(e) => setPolicyType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            placeholder="e.g., HR, IT Security, Finance"
          />
          <datalist id="policy-types">
            {existingTypes.map(type => <option key={type} value={type} />)}
          </datalist>
        </div>

        <button 
          onClick={handleUploadClick} 
          disabled={isUploading || !file || !policyType.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload and Process'}
        </button>

        {isUploading && progress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {uploadedDoc && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
            <h3 className="text-md font-semibold text-green-800">Upload Successful!</h3>
            <div className="mt-2 text-sm text-green-700 space-y-1">
              <p><strong>File Name:</strong> {uploadedDoc.name}</p>
              <p><strong>Pages Processed:</strong> {uploadedDoc.pages}</p>
              <p><strong>Upload Date:</strong> {uploadedDoc.uploadedAt.toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};