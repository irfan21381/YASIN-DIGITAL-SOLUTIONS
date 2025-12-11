import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMaterialDetails } from '@/api/student';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const MaterialViewer: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const [material, setMaterial] = useState<{ title: string; fileUrl: string; fileType: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    if (materialId) {
      fetchMaterialDetails(materialId);
    }
  }, [materialId]);

  const fetchMaterialDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await getMaterialDetails(id);
      setMaterial(response.data);
      toast.success(`Loaded material: ${response.data.title}`);
    } catch (error: any) {
      console.error('Error fetching material:', error);
      toast.error(error.response?.data?.message || 'Failed to load material details.');
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () =>
    setPageNumber((prevPageNumber) => Math.max(1, prevPageNumber - 1));

  const goToNextPage = () =>
    setPageNumber((prevPageNumber) => (numPages ? Math.min(numPages, prevPageNumber + 1) : prevPageNumber));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading material...</p>
      </div>
    );
  }

  if (!material) {
    return <div className="text-center p-8">Material not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{material.title}</CardTitle>
          <p className="text-sm text-muted-foreground">File Type: {material.fileType}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {material.fileType === 'application/pdf' ? (
            <div className="flex flex-col items-center">
              <div className="border rounded-md overflow-hidden shadow-md">
                <Document
                  file={material.fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => {
                    console.error('Error loading PDF:', error);
                    toast.error('Failed to load PDF document.');
                  }}
                >
                  <Page pageNumber={pageNumber} width={Math.min(window.innerWidth * 0.8, 800)} />
                </Document>
              </div>
              {numPages && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button onClick={goToPrevPage} disabled={pageNumber <= 1} variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Page {pageNumber} of {numPages}
                  </p>
                  <Button onClick={goToNextPage} disabled={pageNumber >= numPages} variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4 border rounded-md bg-muted">
              <p className="mb-2">
                This file type ({material.fileType.split('/')[1]}) cannot be previewed directly.
              </p>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button>Download Material</Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialViewer;