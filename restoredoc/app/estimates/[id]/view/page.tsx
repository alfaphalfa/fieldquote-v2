import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PDFViewer from '@/components/pdf/PDFViewer';
import { ArrowLeft, Edit, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

async function getEstimate(id: string) {
  const supabase = createClient();
  
  const { data: estimate, error } = await supabase
    .from('estimates')
    .select(`
      *,
      jobs (
        *,
        contractors (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !estimate) {
    return null;
  }

  return estimate;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    case 'sent':
      return <Clock className="h-4 w-4" />;
    default:
      return null;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'sent':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function EstimateViewPage({ params }: PageProps) {
  const estimate = await getEstimate(params.id);

  if (!estimate) {
    notFound();
  }

  // Format estimate data for display and PDF
  const estimateData = {
    customer: {
      name: estimate.jobs.customer_name,
      email: estimate.jobs.customer_email,
      phone: estimate.jobs.customer_phone,
      address: estimate.jobs.address,
      city: estimate.jobs.city,
      state: estimate.jobs.state,
      zip: estimate.jobs.zip,
    },
    damageType: estimate.jobs.damage_type,
    assessment: estimate.ai_analysis,
    lineItems: estimate.line_items,
    equipment: estimate.equipment,
    originalTotal: estimate.original_total,
    adjustedTotal: estimate.adjusted_total,
    subtotal: estimate.original_total,
    markupPercent: estimate.markup_percent,
    total: estimate.adjusted_total,
    photos: estimate.photos_urls?.map((url: string) => ({ url })),
    notes: estimate.jobs.notes,
  };

  const damageTypeLabel = {
    water: 'Water Damage',
    fire: 'Fire Damage',
    mold: 'Mold Remediation',
  }[estimate.jobs.damage_type] || 'Damage';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Estimate Details</h1>
          <p className="text-gray-600 mt-2">
            View and manage estimate for {estimate.jobs.customer_name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(estimate.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(estimate.status)}
              {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
            </span>
          </Badge>
          <Link href={`/estimates/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Estimate
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{estimate.jobs.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.jobs.customer_email || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.jobs.customer_phone || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.jobs.address}, {estimate.jobs.city}, {estimate.jobs.state} {estimate.jobs.zip}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Damage Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>{damageTypeLabel} Assessment</CardTitle>
              <CardDescription>
                AI-powered damage analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{damageTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Affected Area</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.ai_analysis?.squareFootage || '500'} sq ft
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Severity</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.ai_analysis?.severity || 'Moderate'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">IICRC Standard</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.jobs.damage_type === 'water' && 'S500'}
                    {estimate.jobs.damage_type === 'fire' && 'S700'}
                    {estimate.jobs.damage_type === 'mold' && 'S520'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
              <CardDescription>
                Itemized breakdown of restoration costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium text-center">Qty</th>
                      <th className="pb-3 font-medium text-center">Unit</th>
                      <th className="pb-3 font-medium text-right">Price</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.line_items.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-center">{item.unit}</td>
                        <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-medium">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="pt-3 text-right font-medium">
                        Subtotal:
                      </td>
                      <td className="pt-3 text-right font-medium">
                        ${estimate.original_total.toFixed(2)}
                      </td>
                    </tr>
                    {estimate.markup_percent > 0 && (
                      <tr>
                        <td colSpan={4} className="pt-2 text-right">
                          Markup ({estimate.markup_percent}%):
                        </td>
                        <td className="pt-2 text-right">
                          ${((estimate.original_total * estimate.markup_percent) / 100).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={4} className="pt-3 text-right font-bold text-lg">
                        Total:
                      </td>
                      <td className="pt-3 text-right font-bold text-lg text-blue-600">
                        ${estimate.adjusted_total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6">
          {/* PDF Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Document Actions</CardTitle>
              <CardDescription>
                Generate and share estimate documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading PDF viewer...</div>}>
                <PDFViewer estimateData={estimateData} estimateId={params.id} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(estimate.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">
                    {new Date(estimate.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {estimate.pdf_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">PDF Generated</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Equipment Details (if any) */}
          {estimate.equipment_days && (
            <Card>
              <CardHeader>
                <CardTitle>Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rental Period</span>
                    <span className="text-sm font-medium">{estimate.equipment_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Labor Rate</span>
                    <span className="text-sm font-medium">${estimate.labor_rate}/hr</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos (if any) */}
          {estimate.photos_urls && estimate.photos_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photo Documentation</CardTitle>
                <CardDescription>
                  {estimate.photos_urls.length} photos attached
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {estimate.photos_urls.slice(0, 4).map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Damage photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
                {estimate.photos_urls.length > 4 && (
                  <p className="text-sm text-gray-500 mt-2">
                    +{estimate.photos_urls.length - 4} more photos
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}