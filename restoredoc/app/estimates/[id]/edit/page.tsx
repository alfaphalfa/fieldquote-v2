'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Minus, Trash2, Save, Loader2 } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  category?: string;
}

export default function EstimateEditPage({ params }: PageProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [editMode, setEditMode] = useState(true);
  const [laborRate, setLaborRate] = useState(125);
  const [equipmentDays, setEquipmentDays] = useState(3);
  const [markupPercent, setMarkupPercent] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [adjustedTotal, setAdjustedTotal] = useState(0);

  useEffect(() => {
    loadEstimate();
  }, [params.id]);

  useEffect(() => {
    calculateTotals();
  }, [lineItems, markupPercent]);

  const loadEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          jobs (*)
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setEstimate(data);
      setLineItems(data.line_items || []);
      setLaborRate(data.labor_rate || 125);
      setEquipmentDays(data.equipment_days || 3);
      setMarkupPercent(data.markup_percent || 0);
      setOriginalTotal(data.original_total || 0);
    } catch (error) {
      console.error('Error loading estimate:', error);
      alert('Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal * (1 + markupPercent / 100);
    setAdjustedTotal(total);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...lineItems];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setLineItems(newItems);
  };

  const updateUnitPrice = (index: number, price: number) => {
    const newItems = [...lineItems];
    newItems[index].unitPrice = Math.max(0, price);
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setLineItems(newItems);
  };

  const deleteLineItem = (index: number) => {
    if (confirm('Delete this line item?')) {
      const newItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newItems);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      description: 'New Item',
      quantity: 1,
      unit: 'each',
      unitPrice: 0,
      total: 0,
      category: 'Custom',
    };
    setLineItems([...lineItems, newItem]);
  };

  const applyLaborRate = (rate: number) => {
    setLaborRate(rate);
    const newItems = lineItems.map(item => {
      if (item.category === 'Labor') {
        return {
          ...item,
          unitPrice: rate,
          total: item.quantity * rate,
        };
      }
      return item;
    });
    setLineItems(newItems);
  };

  const applyEquipmentDays = (days: number) => {
    setEquipmentDays(days);
    const newItems = lineItems.map(item => {
      if (item.category === 'Equipment' && item.unit === 'day') {
        return {
          ...item,
          quantity: days,
          total: days * item.unitPrice,
        };
      }
      return item;
    });
    setLineItems(newItems);
  };

  const saveEstimate = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('estimates')
        .update({
          line_items: lineItems,
          adjusted_total: adjustedTotal,
          labor_rate: laborRate,
          equipment_days: equipmentDays,
          markup_percent: markupPercent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) throw error;

      alert('Estimate saved successfully!');
      router.push(`/estimates/${params.id}/view`);
    } catch (error) {
      console.error('Error saving estimate:', error);
      alert('Failed to save estimate');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Estimate not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/estimates/${params.id}/view`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to View
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Estimate</h1>
          <p className="text-gray-600 mt-2">
            {estimate.jobs.customer_name} - {estimate.jobs.address}
          </p>
        </div>
        
        <Button onClick={saveEstimate} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Quick Adjustments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Adjustments</CardTitle>
          <CardDescription>Apply common adjustments to all relevant items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Labor Rate */}
            <div>
              <label className="text-sm font-medium mb-2 block">Labor Rate ($/hr)</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={laborRate === 85 ? 'default' : 'outline'}
                  onClick={() => applyLaborRate(85)}
                >
                  $85
                </Button>
                <Button
                  size="sm"
                  variant={laborRate === 125 ? 'default' : 'outline'}
                  onClick={() => applyLaborRate(125)}
                >
                  $125
                </Button>
                <Button
                  size="sm"
                  variant={laborRate === 150 ? 'default' : 'outline'}
                  onClick={() => applyLaborRate(150)}
                >
                  $150
                </Button>
              </div>
            </div>

            {/* Equipment Days */}
            <div>
              <label className="text-sm font-medium mb-2 block">Equipment Days</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={equipmentDays === 3 ? 'default' : 'outline'}
                  onClick={() => applyEquipmentDays(3)}
                >
                  3
                </Button>
                <Button
                  size="sm"
                  variant={equipmentDays === 5 ? 'default' : 'outline'}
                  onClick={() => applyEquipmentDays(5)}
                >
                  5
                </Button>
                <Button
                  size="sm"
                  variant={equipmentDays === 7 ? 'default' : 'outline'}
                  onClick={() => applyEquipmentDays(7)}
                >
                  7
                </Button>
              </div>
            </div>

            {/* Markup */}
            <div>
              <label className="text-sm font-medium mb-2 block">Markup %</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={markupPercent === 0 ? 'default' : 'outline'}
                  onClick={() => setMarkupPercent(0)}
                >
                  None
                </Button>
                <Button
                  size="sm"
                  variant={markupPercent === 10 ? 'default' : 'outline'}
                  onClick={() => setMarkupPercent(10)}
                >
                  10%
                </Button>
                <Button
                  size="sm"
                  variant={markupPercent === 25 ? 'default' : 'outline'}
                  onClick={() => setMarkupPercent(25)}
                >
                  25%
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>Edit quantities, prices, and add or remove items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-center">Quantity</th>
                  <th className="pb-3 font-medium text-center">Unit</th>
                  <th className="pb-3 font-medium text-right">Unit Price</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...lineItems];
                          newItems[index].description = e.target.value;
                          setLineItems(newItems);
                        }}
                        className="w-full"
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...lineItems];
                            newItems[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
                            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                            setLineItems(newItems);
                          }}
                          className="w-20 text-center"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <Input
                        value={item.unit}
                        onChange={(e) => {
                          const newItems = [...lineItems];
                          newItems[index].unit = e.target.value;
                          setLineItems(newItems);
                        }}
                        className="w-20 text-center"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateUnitPrice(index, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right"
                      />
                    </td>
                    <td className="py-3 text-right font-medium">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteLineItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Button
            onClick={addLineItem}
            variant="outline"
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Original AI Estimate:</span>
              <span className="font-medium">${originalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Subtotal:</span>
              <span className="font-medium">
                ${lineItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
              </span>
            </div>
            {markupPercent > 0 && (
              <div className="flex justify-between">
                <span>Markup ({markupPercent}%):</span>
                <span className="font-medium">
                  ${((lineItems.reduce((sum, item) => sum + item.total, 0) * markupPercent) / 100).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>Adjusted Total:</span>
              <span className="text-blue-600">${adjustedTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}