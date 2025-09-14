'use client';

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function BulkUploadButtons() {
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [quotesDeleting, setQuotesDeleting] = useState(false);
  const [imagesDeleting, setImagesDeleting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo-mode');
        const data = await response.json();
        setIsDemoMode(data.isDemoMode);
      } catch (error) {
        console.error('Error checking demo mode:', error);
      }
    };

    checkDemoMode();
  }, []);

  const handleBulkUpload = async (type: 'quotes' | 'images') => {
    if (type === 'quotes') setQuotesLoading(true);
    else setImagesLoading(true);

    try {
      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`${type === 'quotes' ? 'Quotes' : 'Images'} uploaded successfully!\n${result.message}`);
      } else {
        alert(`Error uploading ${type}: ${result.error}`);
      }
    } catch (error) {
      alert(`Error uploading ${type}: ${error}`);
    } finally {
      if (type === 'quotes') setQuotesLoading(false);
      else setImagesLoading(false);
    }
  };

  const handleBulkDelete = async (type: 'quotes' | 'images') => {
    if (!confirm(`Are you sure you want to delete all ${type}? This action cannot be undone.`)) {
      return;
    }

    if (type === 'quotes') setQuotesDeleting(true);
    else setImagesDeleting(true);

    try {
      const response = await fetch('/api/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`${type === 'quotes' ? 'Quotes' : 'Images'} deleted successfully!\n${result.message}`);
      } else {
        alert(`Error deleting ${type}: ${result.error}`);
      }
    } catch (error) {
      alert(`Error deleting ${type}: ${error}`);
    } finally {
      if (type === 'quotes') setQuotesDeleting(false);
      else setImagesDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-black">Sample Data</h3>
        <p className="text-sm text-black opacity-80">Load sample content to explore Commonbase features</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={() => handleBulkUpload('quotes')}
            disabled={quotesLoading || isDemoMode}
            size="sm"
            variant="accent"
            className="flex-1"
          >
            {isDemoMode ? 'Upload Disabled' : quotesLoading ? 'Uploading...' : '+ 100 Quotes'}
          </Button>
          <Button
            onClick={() => handleBulkDelete('quotes')}
            disabled={quotesDeleting || isDemoMode}
            size="sm"
            variant="destructive"
            className="px-3"
          >
            {isDemoMode ? 'Disabled' : quotesDeleting ? '...' : 'Delete'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleBulkUpload('images')}
            disabled={imagesLoading || isDemoMode}
            size="sm"
            variant="accent"
            className="flex-1"
          >
            {isDemoMode ? 'Upload Disabled' : imagesLoading ? 'Uploading...' : '+ 100 Images'}
          </Button>
          <Button
            onClick={() => handleBulkDelete('images')}
            disabled={imagesDeleting || isDemoMode}
            size="sm"
            variant="destructive"
            className="px-3"
          >
            {isDemoMode ? 'Disabled' : imagesDeleting ? '...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}