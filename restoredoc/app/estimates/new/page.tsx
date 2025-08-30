'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhotoUpload } from '@/components/photos/photo-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableEstimate } from '@/components/estimates/editable-estimate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, FileText, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface EstimateAnalysis {
  damageType: string;
  totalEstimate: number;
  affectedAreaSqFt: number;
  estimatedDays: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    category: string;
  }>;
  equipment?: Array<{
    type: string;
    quantity: number;
    days: number;
  }>;
  urgency?: string;
  severity?: string;
  category?: number;
  class?: number;
  level?: number;
  notes?: string;
}

export default function NewEstimatePage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<any[]>([]);
  const [damageType, setDamageType] = useState<string>('');
  const [projectInfo, setProjectInfo] = useState({
    clientName: '',
    propertyAddress: '',
    notes: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EstimateAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!damageType) {
      setError('Please select a damage type');
      return;
    }
    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-damage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: photos.map(p => ({
            base64: p.base64,
            mimeType: p.file.type
          })),
          damageType
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze damage');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveEstimate = async (updatedEstimate: any) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const response = await fetch('/api/estimates/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectInfo: {
            ...projectInfo,
            propertyCity: 'York',
            propertyState: 'PA'
          },
          damageType,
          ...updatedEstimate,
          photos: photos.map(p => ({ 
            url: p.preview,
            caption: p.file.name 
          }))
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save estimate');
      }

      setSaveSuccess(true);
      // Optionally redirect to view the saved estimate
      setTimeout(() => {
        router.push(`/estimates/${result.estimate.id}`);
      }, 2000);

    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save estimate');
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityBadge = (analysis: EstimateAnalysis) => {
    if (damageType === 'water') {
      return (
        <Badge variant={analysis.category === 3 ? 'destructive' : analysis.category === 2 ? 'secondary' : 'default'}>
          Category {analysis.category} / Class {analysis.class}
        </Badge>
      );
    }
    if (damageType === 'fire') {
      const colors = { light: 'default', medium: 'secondary', heavy: 'destructive', structural: 'destructive' };
      return <Badge variant={colors[analysis.severity as keyof typeof colors] as any}>{analysis.severity}</Badge>;
    }
    if (damageType === 'mold') {
      return <Badge variant={analysis.level! > 3 ? 'destructive' : analysis.level! > 2 ? 'secondary' : 'default'}>Level {analysis.level}</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Create New Estimate</h1>
                <p className="text-sm text-gray-600">Upload photos and get AI-powered damage analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Basic details about the restoration project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Smith"
                    value={projectInfo.clientName}
                    onChange={(e) => setProjectInfo({...projectInfo, clientName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Property Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St, York, PA"
                    value={projectInfo.propertyAddress}
                    onChange={(e) => setProjectInfo({...projectInfo, propertyAddress: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Damage Type *</label>
                  <Select value={damageType} onValueChange={setDamageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select damage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="water">💧 Water Damage</SelectItem>
                      <SelectItem value="fire">🔥 Fire & Smoke Damage</SelectItem>
                      <SelectItem value="mold">🦠 Mold Remediation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <Textarea
                    placeholder="Any special considerations..."
                    value={projectInfo.notes}
                    onChange={(e) => setProjectInfo({...projectInfo, notes: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Damage Photos</CardTitle>
                <CardDescription>Upload photos for AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload 
                  onPhotosChange={setPhotos}
                  maxPhotos={10}
                />
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="flex items-center gap-2 py-4">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={!damageType || photos.length === 0 || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing with GPT-4 Vision...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Analyze Damage
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Success Message */}
            {saveSuccess && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex items-center gap-2 py-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-600">Estimate saved successfully! Redirecting...</p>
                </CardContent>
              </Card>
            )}

            {analysis ? (
              <>
                {/* Replace the existing analysis display with EditableEstimate component */}
                <EditableEstimate
                  initialData={analysis}
                  projectInfo={projectInfo}
                  onSave={handleSaveEstimate}
                />

                {/* Keep the original summary card for quick reference */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Analysis Results</CardTitle>
                        <CardDescription>AI-powered damage assessment</CardDescription>
                      </div>
                      {getSeverityBadge(analysis)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Total Estimate</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${analysis.totalEstimate.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Affected Area</p>
                        <p className="text-2xl font-bold">
                          {analysis.affectedAreaSqFt} sq ft
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Timeline</p>
                        <p className="text-lg font-semibold">
                          {analysis.estimatedDays} days
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Urgency</p>
                        <p className="text-lg font-semibold capitalize">
                          {analysis.urgency || 'Standard'}
                        </p>
                      </div>
                    </div>

                    {analysis.notes && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <p className="text-sm font-medium mb-2">Assessment Notes</p>
                          <p className="text-sm text-gray-600">{analysis.notes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>


                {/* Removed duplicate action buttons as they're now in EditableEstimate */}
              </>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    No analysis yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload photos and click "Analyze Damage" to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}