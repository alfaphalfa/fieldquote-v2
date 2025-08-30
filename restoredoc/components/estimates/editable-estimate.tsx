'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit2, Save, Plus, Trash2, Minus, DollarSign, 
  Clock, Percent, Calculator, AlertCircle 
} from 'lucide-react';

interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  category: string;
  isLabor?: boolean;
  isEquipment?: boolean;
}

interface EditableEstimateProps {
  initialData: {
    damageType: string;
    totalEstimate: number;
    affectedAreaSqFt: number;
    estimatedDays: number;
    lineItems: LineItem[];
    equipment?: any[];
    urgency?: string;
    severity?: string;
    category?: number;
    class?: number;
    level?: number;
    notes?: string;
  };
  onSave?: (updatedEstimate: any) => void;
  projectInfo?: {
    clientName: string;
    propertyAddress: string;
    notes: string;
  };
}

const LABOR_RATES = [
  { value: 85, label: '$85/hr (Standard)' },
  { value: 125, label: '$125/hr (Emergency)' },
  { value: 150, label: '$150/hr (After Hours)' },
];

const EQUIPMENT_DAYS = [3, 5, 7];

const MARKUP_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 10, label: 'Insurance +10%' },
  { value: 25, label: 'Emergency +25%' },
];

export function EditableEstimate({ initialData, onSave, projectInfo }: EditableEstimateProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>(initialData.lineItems);
  const [laborRate, setLaborRate] = useState(85);
  const [customLaborRate, setCustomLaborRate] = useState<number | null>(null);
  const [equipmentDays, setEquipmentDays] = useState(3);
  const [customEquipmentDays, setCustomEquipmentDays] = useState<number | null>(null);
  const [markupPercent, setMarkupPercent] = useState(0);
  const [customMarkup, setCustomMarkup] = useState<number | null>(null);
  
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const markupAmount = subtotal * ((customMarkup ?? markupPercent) / 100);
  const total = subtotal + markupAmount;

  // Identify labor and equipment items
  useEffect(() => {
    const updatedItems = lineItems.map(item => ({
      ...item,
      isLabor: item.category === 'labor' || item.description.toLowerCase().includes('labor'),
      isEquipment: item.category === 'equipment' || 
                   item.description.toLowerCase().includes('equipment') ||
                   item.description.toLowerCase().includes('scrubber') ||
                   item.description.toLowerCase().includes('dehumidifier')
    }));
    setLineItems(updatedItems);
  }, []);

  // Update labor rates
  const updateLaborRates = useCallback((newRate: number) => {
    const currentRate = customLaborRate || laborRate;
    const rateMultiplier = newRate / currentRate;
    
    setLineItems(prev => prev.map(item => {
      if (item.isLabor) {
        const newUnitPrice = item.unitPrice * rateMultiplier;
        return {
          ...item,
          unitPrice: Math.round(newUnitPrice * 100) / 100,
          total: Math.round(newUnitPrice * item.quantity * 100) / 100
        };
      }
      return item;
    }));
  }, [laborRate, customLaborRate]);

  // Update equipment days
  const updateEquipmentDays = useCallback((newDays: number) => {
    const currentDays = customEquipmentDays || equipmentDays;
    const daysMultiplier = newDays / currentDays;
    
    setLineItems(prev => prev.map(item => {
      if (item.isEquipment && item.unit.includes('day')) {
        const newQuantity = Math.round(item.quantity * daysMultiplier);
        return {
          ...item,
          quantity: newQuantity,
          total: Math.round(item.unitPrice * newQuantity * 100) / 100
        };
      }
      return item;
    }));
  }, [equipmentDays, customEquipmentDays]);

  // Handle line item changes
  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Recalculate total if quantity or unitPrice changed
      if (field === 'quantity' || field === 'unitPrice') {
        updated[index].total = Math.round(updated[index].quantity * updated[index].unitPrice * 100) / 100;
      }
      
      return updated;
    });
  };

  // Add new line item
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'New Line Item',
      quantity: 1,
      unit: 'each',
      unitPrice: 100,
      total: 100,
      category: 'materials'
    };
    setLineItems([...lineItems, newItem]);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSave = () => {
    const updatedEstimate = {
      ...initialData,
      lineItems,
      subtotal,
      markupPercent: customMarkup ?? markupPercent,
      markupAmount,
      totalEstimate: total,
      adjustments: {
        laborRate: customLaborRate || laborRate,
        equipmentDays: customEquipmentDays || equipmentDays,
        markupPercent: customMarkup ?? markupPercent
      }
    };
    
    if (onSave) {
      onSave(updatedEstimate);
    }
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Edit Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Estimate Details</CardTitle>
              <CardDescription>
                {isEditMode ? 'Editing mode - modify line items and adjustments' : 'View and adjust estimate details'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Edit Mode</label>
              <Switch
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Adjustments */}
      {isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Adjustments</CardTitle>
            <CardDescription>Apply global changes to the estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Labor Rate */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Labor Rate
                </label>
                <Select
                  value={customLaborRate ? 'custom' : laborRate.toString()}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setCustomLaborRate(laborRate);
                    } else {
                      const newRate = parseInt(value);
                      updateLaborRates(newRate);
                      setLaborRate(newRate);
                      setCustomLaborRate(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LABOR_RATES.map(rate => (
                      <SelectItem key={rate.value} value={rate.value.toString()}>
                        {rate.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Rate</SelectItem>
                  </SelectContent>
                </Select>
                {customLaborRate !== null && (
                  <Input
                    type="number"
                    value={customLaborRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setCustomLaborRate(value);
                      updateLaborRates(value);
                    }}
                    placeholder="Enter custom rate"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Equipment Days */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Equipment Rental Days
                </label>
                <Select
                  value={customEquipmentDays ? 'custom' : equipmentDays.toString()}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setCustomEquipmentDays(equipmentDays);
                    } else {
                      const newDays = parseInt(value);
                      updateEquipmentDays(newDays);
                      setEquipmentDays(newDays);
                      setCustomEquipmentDays(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_DAYS.map(days => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} Days
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Days</SelectItem>
                  </SelectContent>
                </Select>
                {customEquipmentDays !== null && (
                  <Input
                    type="number"
                    value={customEquipmentDays}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setCustomEquipmentDays(value);
                      updateEquipmentDays(value);
                    }}
                    placeholder="Enter days"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Job Markup */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Job Markup
                </label>
                <Select
                  value={customMarkup !== null ? 'custom' : markupPercent.toString()}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setCustomMarkup(markupPercent);
                    } else {
                      setMarkupPercent(parseInt(value));
                      setCustomMarkup(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKUP_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Markup</SelectItem>
                  </SelectContent>
                </Select>
                {customMarkup !== null && (
                  <Input
                    type="number"
                    value={customMarkup}
                    onChange={(e) => setCustomMarkup(parseFloat(e.target.value))}
                    placeholder="Enter %"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>{lineItems.length} items</CardDescription>
            </div>
            {isEditMode && (
              <Button onClick={addLineItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id || index} className="border rounded-lg p-3">
                <div className="space-y-2">
                  {/* Description and Total */}
                  <div className="flex justify-between items-start gap-2">
                    {isEditMode ? (
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="flex-1"
                      />
                    ) : (
                      <p className="flex-1 font-medium">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">${item.total.toFixed(2)}</span>
                      {isEditMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quantity, Unit, Price */}
                  <div className="flex items-center gap-2 text-sm">
                    {isEditMode ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateLineItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateLineItem(index, 'quantity', item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                          className="w-24"
                        />
                        <span>@</span>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
                          className="w-24"
                          step="0.01"
                        />
                        <span>/unit</span>
                      </>
                    ) : (
                      <span className="text-gray-500">
                        {item.quantity} {item.unit} @ ${item.unitPrice}/unit
                      </span>
                    )}
                    <Badge variant="outline" className="ml-auto">
                      {item.category}
                    </Badge>
                    {item.isLabor && <Badge variant="secondary">Labor</Badge>}
                    {item.isEquipment && <Badge variant="secondary">Equipment</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {markupAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Markup ({customMarkup ?? markupPercent}%)</span>
                <span>${markupAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total Estimate</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditMode && (
        <div className="flex gap-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setLineItems(initialData.lineItems);
              setIsEditMode(false);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}