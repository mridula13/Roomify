import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import {
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  REDIRECT_DELAY_MS,
} from '../lib/contants';

interface UploadProps {
  onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileBase64Ref = useRef<string | null>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = (incomingFile: File) => {
    const reader = new FileReader();
    let progressValue = 0;
    fileBase64Ref.current = null;
    setProgress(0);

    const intervalId = window.setInterval(() => {
      progressValue = Math.min(100, progressValue + PROGRESS_INCREMENT);
      setProgress(progressValue);

      if (progressValue >= 100) {
        window.clearInterval(intervalId);

        if (fileBase64Ref.current) {
          window.setTimeout(() => {
            onComplete?.(fileBase64Ref.current!);
          }, REDIRECT_DELAY_MS);
        }
      }
    }, PROGRESS_INTERVAL_MS);

    reader.onload = () => {
      fileBase64Ref.current = String(reader.result ?? '');

      if (progressValue >= 100) {
        window.setTimeout(() => {
          onComplete?.(fileBase64Ref.current!);
        }, REDIRECT_DELAY_MS);
      }
    };

    reader.readAsDataURL(incomingFile);
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!isSignedIn || !files?.length) {
      return;
    }

    const selectedFile = files[0];
    setFile(selectedFile);
    processFile(selectedFile);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files);
    event.target.value = '';
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      return;
    }

    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      return;
    }

    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (!isSignedIn) {
      return;
    }

    handleFileSelection(event.dataTransfer.files);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleInputChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>

            <p>
              {isSignedIn
                ? 'Drag and drop your floor plan here, or click to select a file'
                : 'Please sign in to upload files'}
            </p>
            <p className="help">Supported formats: JPG, JPEG, PNG</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file?.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }}></div>
              <p>{progress}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;