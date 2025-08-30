// IICRC S520-2024 Mold Remediation Analysis Module
// Major Restoration Services - York, PA Regional Implementation

// IICRC S520 Conditions Classification (2024 Edition)
const MOLD_CONDITIONS = {
  condition1: {
    name: "Normal Fungal Ecology",
    definition: "Indoor environment comparable to outdoor reference",
    sporeCount: "< 200 spores/m³ total",
    indicators: "No visible growth, normal background levels",
    action: "No remediation required",
    documentation: "Baseline documentation only"
  },
  
  condition2: {
    name: "Settled Spores/Contamination",
    definition: "Elevated airborne spores and surface contamination without visible growth",
    sporeCount: "200-1,500 spores/m³",
    indicators: "Mycotoxins, ECM components, elevated Pen/Asp",
    action: "HEPA cleaning, air scrubbing required",
    documentation: "Pre/post verification testing"
  },
  
  condition3: {
    name: "Actual Mold Growth",
    definition: "Visible mold growth present",
    sporeCount: "> 1,500 spores/m³ or visible growth",
    indicators: "Visible colonies, moisture damage, musty odor",
    action: "Full remediation with containment",
    documentation: "Detailed protocol and clearance testing"
  }
};

// Mold Species Identification & Risk Matrix
const MOLD_SPECIES = {
  stachybotrys: {
    commonName: "Black/Toxic Mold",
    appearance: "Dark green/black, slimy when wet",
    toxicity: "HIGH - Produces mycotoxins",
    healthRisk: "Severe respiratory, neurological symptoms",
    moistureNeeds: "Requires direct water source, 90%+ humidity",
    growthSurfaces: ["Drywall", "Ceiling tiles", "Wood", "Paper"],
    sporeThreshold: "ANY presence requires immediate action",
    costMultiplier: 1.5
  },
  
  aspergillus: {
    commonName: "Common Indoor Mold",
    appearance: "Green, white, yellow, or black powdery",
    toxicity: "MODERATE - Some species produce mycotoxins",
    healthRisk: "Aspergillosis in immunocompromised",
    moistureNeeds: "Grows with humidity alone, 65%+",
    growthSurfaces: ["HVAC", "Carpets", "Basements", "Food"],
    sporeThreshold: "< 700 spores/m³ acceptable",
    costMultiplier: 1.0
  },
  
  penicillium: {
    commonName: "Blue/Green Mold",
    appearance: "Blue or green with velvety texture",
    toxicity: "MODERATE - Allergen and mycotoxin producer",
    healthRisk: "Allergic reactions, sinus infections",
    moistureNeeds: "Moderate moisture, 60%+ humidity",
    growthSurfaces: ["Wallpaper", "Fabrics", "Insulation", "Furniture"],
    sporeThreshold: "< 700 spores/m³ with Aspergillus",
    costMultiplier: 1.0
  },
  
  cladosporium: {
    commonName: "Most Common Outdoor/Indoor",
    appearance: "Olive-green to brown/black, suede texture",
    toxicity: "LOW - Primarily allergenic",
    healthRisk: "Hay fever symptoms, asthma triggers",
    moistureNeeds: "Low moisture requirements",
    growthSurfaces: ["Wood", "Textiles", "Window frames", "HVAC"],
    sporeThreshold: "< 500-1500 spores/m³",
    costMultiplier: 0.8
  },
  
  chaetomium: {
    commonName: "Water Damage Indicator",
    appearance: "White to gray, cotton-like changing to black",
    toxicity: "MODERATE-HIGH - Mycotoxin producer",
    healthRisk: "Skin/nail infections, neurological",
    moistureNeeds: "Chronic water damage indicator",
    growthSurfaces: ["Wet drywall", "Wallpaper", "Window frames"],
    sporeThreshold: "ANY presence = water problem",
    costMultiplier: 1.3
  },
  
  alternaria: {
    commonName: "Allergenic Mold",
    appearance: "Dark green or brown with velvet texture",
    toxicity: "LOW-MODERATE - Strong allergen",
    healthRisk: "Asthma, allergic reactions",
    moistureNeeds: "Minimal water needed",
    growthSurfaces: ["Showers", "Window frames", "Damp areas"],
    sporeThreshold: "< 200 spores/m³",
    costMultiplier: 0.9
  }
};

// York, PA Mold Remediation Pricing Matrix
const YORK_PA_MOLD_PRICING = {
  perSquareFoot: {
    level1_small: { min: 10, max: 15, size: "< 10 sq ft" },
    level2_medium: { min: 15, max: 25, size: "10-30 sq ft" },
    level3_large: { min: 20, max: 30, size: "30-100 sq ft" },
    level4_extensive: { min: 25, max: 35, size: "> 100 sq ft" },
    level5_hvac: { min: 30, max: 50, size: "HVAC contamination" }
  },
  
  containment: {
    miniContainment: { cost: 200, size: "< 10 sq ft" },
    fullContainment: { cost: 500, size: "10-100 sq ft" },
    multiRoomContainment: { cost: 1500, size: "> 100 sq ft" },
    negativePressure: { cost: 150, unit: "per_zone" }
  },
  
  equipment: {
    airScrubber500CFM: { daily: 175, weekly: 875, monthly: 2625 },
    negativeAirMachine: { daily: 200, weekly: 1000, monthly: 3000 },
    hepaVacuum: { daily: 75, weekly: 375, monthly: 1125 },
    dehumidifierLGR: { daily: 100, weekly: 500, monthly: 1500 },
    fogger: { daily: 125, weekly: 625, monthly: 1875 }
  },
  
  treatment: {
    antimicrobialApplication: { min: 1.50, max: 3.00, unit: "sq_ft" },
    hepaVacuuming: { min: 0.75, max: 1.50, unit: "sq_ft" },
    wirebrushingSanding: { min: 3.00, max: 5.00, unit: "sq_ft" },
    encapsulation: { min: 2.00, max: 4.00, unit: "sq_ft" },
    fogging: { min: 200, max: 500, unit: "room" }
  },
  
  testing: {
    airSampling: { cost: 150, unit: "per_sample" },
    surfaceSampling: { cost: 100, unit: "per_sample" },
    postRemediationVerification: { cost: 500, unit: "complete_test" },
    labAnalysis: { cost: 75, unit: "per_sample" }
  },
  
  materialRemoval: {
    drywall: { min: 3.00, max: 5.00, unit: "sq_ft" },
    insulation: { min: 2.50, max: 4.00, unit: "sq_ft" },
    carpet: { min: 2.00, max: 3.50, unit: "sq_ft" },
    ceilingTiles: { min: 3.50, max: 5.50, unit: "sq_ft" },
    woodFraming: { min: 25, max: 50, unit: "linear_ft" }
  }
};

// Equipment Calculation Formulas (IICRC S520)
const MOLD_EQUIPMENT_CALCULATIONS = {
  airChangesRequired: {
    level1: 4,
    level2: 6,
    level3: 8,
    level4: 10,
    level5: 12
  },
  
  calculateAirScrubbers: function(cubicFeet, level, cfmPerUnit = 500) {
    const achRequired = this.airChangesRequired[level];
    const cfhRequired = cubicFeet * achRequired;
    const cfmRequired = cfhRequired / 60;
    return Math.ceil(cfmRequired / cfmPerUnit);
  },
  
  calculateNegativePressure: function(cubicFeet) {
    const exhaustCFM = cubicFeet * 0.1 / 60;
    return Math.ceil(exhaustCFM / 500);
  },
  
  calculateContainment: function(perimeterFeet, heightFeet) {
    const sqFtBarrier = perimeterFeet * heightFeet;
    const plasticSheeting = sqFtBarrier * 1.2;
    const zipperDoors = Math.ceil(perimeterFeet / 30);
    return {
      plasticSqFt: plasticSheeting,
      zipperDoors: zipperDoors,
      cost: (plasticSheeting * 0.25) + (zipperDoors * 45)
    };
  }
};

// Validation Rules for Mold Estimates
const MOLD_ESTIMATE_VALIDATION = {
  minimums: {
    smallJob: 500,
    condition2: 1500,
    condition3: 2500,
    hvacContamination: 5000
  },
  
  criticalFlags: {
    noContainment: "Containment required for > 10 sq ft",
    noAirScrubber: "Air scrubbing mandatory for mold work",
    noTesting: "PRV testing required for Condition 3",
    quickTimeline: "Minimum 3 days for proper drying",
    noMoistureSource: "Must identify moisture source per S520"
  },
  
  speciesAlerts: {
    stachybotrys: {
      alert: "Black mold detected - enhanced PPE required",
      minCost: 5000,
      requiresPRV: true
    },
    chaetomium: {
      alert: "Chronic water damage indicator present",
      checkStructural: true
    }
  },
  
  healthSafetyCompliance: {
    respiratorRequired: "> 10 sq ft or toxic species",
    containmentRequired: "> 10 sq ft",
    thirdPartyPRV: "Required for insurance claims",
    oshaCompliance: "29 CFR 1910.134 for respirators"
  }
};

// Test Scenarios for Mold Validation
const MOLD_TEST_SCENARIOS = [
  {
    description: "Small bathroom mold",
    expectedCondition: 3,
    expectedLevel: 1,
    expectedRange: { min: 500, max: 1500 }
  },
  {
    description: "Basement black mold 50 sq ft",
    expectedCondition: 3,
    expectedLevel: 3,
    expectedSpecies: "Stachybotrys",
    expectedRange: { min: 5000, max: 10000 }
  },
  {
    description: "Attic mold on sheathing",
    expectedCondition: 3,
    expectedLevel: 4,
    expectedRange: { min: 8000, max: 15000 }
  },
  {
    description: "HVAC system contamination",
    expectedCondition: 3,
    expectedLevel: 5,
    expectedRange: { min: 10000, max: 20000 }
  },
  {
    description: "Settled spores, no visible growth",
    expectedCondition: 2,
    expectedLevel: "N/A",
    expectedRange: { min: 1500, max: 3000 }
  }
];

// Enhanced AI Prompt for Mold Remediation
function getMoldRemediationPrompt() {
  return `You are an IICRC S520-2024 certified mold remediation expert analyzing photos for Major Restoration Services in York, PA.

CRITICAL STANDARDS:
- Follow ANSI/IICRC S520-2024 Fourth Edition standards
- Apply EPA mold remediation guidelines
- Consider OSHA respiratory protection requirements
- Use York, PA regional pricing (10-15% below national)
- Emphasize source removal over chemical treatment (S520-2024 update)

ANALYSIS PROTOCOL:

STEP 1: Condition Assessment (S520-2024)
Determine the condition based on visible evidence:
- CONDITION 1: Normal fungal ecology (no action needed)
- CONDITION 2: Settled spores without growth (cleaning required)
- CONDITION 3: Actual mold growth visible (full remediation)

STEP 2: Mold Species Identification
From visible characteristics, identify likely species:
- BLACK/SLIMY: Stachybotrys (toxic black mold)
- GREEN/POWDERY: Aspergillus/Penicillium complex
- OLIVE/SUEDE: Cladosporium
- WHITE-TO-BLACK COTTON: Chaetomium (water indicator)
- DARK GREEN/VELVET: Alternaria

STEP 3: Contamination Level (per S520)
- LEVEL 1: < 10 sq ft (minimal PPE, no containment)
- LEVEL 2: 10-30 sq ft (PPE, limited containment)
- LEVEL 3: 30-100 sq ft (full PPE, containment, negative air)
- LEVEL 4: > 100 sq ft (extensive protocols)
- LEVEL 5: HVAC contamination (specialized procedures)

STEP 4: Moisture Source Assessment
Critical per S520-2024: Must identify and document:
- Active leak (plumbing, roof, window)
- Condensation (poor ventilation, thermal bridging)
- Ground water (foundation, flooding)
- Humidity (> 60% sustained)

STEP 5: Containment & Equipment Requirements
Based on area and level:
Calculate cubic feet: L × W × H
Air changes needed based on level
Air scrubbers: Cubic feet × ACH ÷ 60 ÷ 500 CFM
Negative air: Additional unit for pressure differential

STEP 6: Line Item Estimate Generation
Generate detailed line items using York, PA rates.

CRITICAL HEALTH WARNINGS:
- If Stachybotrys detected: "Requires N95 minimum, full-face preferred"
- If immunocompromised occupants: "Enhanced containment required"
- If > 100 sq ft: "Consider temporary relocation"
- Pre-1980 building: "Asbestos/lead testing required before disturbance"

DOCUMENTATION REQUIREMENTS (S520-2024):
- Photo documentation before, during, after
- Moisture readings for all affected materials
- Chain of custody for samples
- Worker protection verification
- Post-remediation verification by third-party IEP

Return a structured JSON response with:
{
  "condition": "1, 2, or 3",
  "conditionName": "condition name",
  "level": "1-5 or N/A",
  "affectedArea": "square footage",
  "roomDimensions": {
    "length": number,
    "width": number,
    "height": number,
    "cubicFeet": number
  },
  "species": {
    "identified": ["species names"],
    "characteristics": "visible characteristics",
    "riskLevel": "LOW/MODERATE/HIGH"
  },
  "moistureSource": {
    "type": "leak/condensation/groundwater/humidity",
    "description": "specific source details",
    "repairRequired": true/false
  },
  "equipment": {
    "airScrubbers": number,
    "negativeAir": number,
    "dehumidifiers": number,
    "days": number
  },
  "containment": {
    "type": "mini/full/multi-room",
    "plasticSqFt": number,
    "zipperDoors": number
  },
  "lineItems": [
    {
      "description": "item description",
      "quantity": number,
      "unit": "unit type",
      "unitPrice": number,
      "total": number
    }
  ],
  "healthWarnings": ["warning strings"],
  "complianceNotes": ["compliance requirements"],
  "totalEstimate": number,
  "timeline": "estimated days",
  "documentation": ["required documents"]
}`;
}

// Main analysis function
async function analyzeMoldDamage(imageData) {
  try {
    const base64Image = await fileToBase64(imageData);
    
    const requestBody = {
      contents: [{
        parts: [
          {
            text: getMoldRemediationPrompt()
          },
          {
            inline_data: {
              mime_type: imageData.type,
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${window.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response structure');
    }

    const analysisResult = JSON.parse(data.candidates[0].content.parts[0].text);
    
    // Validate estimate minimums
    if (analysisResult.condition === 3 && analysisResult.totalEstimate < MOLD_ESTIMATE_VALIDATION.minimums.condition3) {
      analysisResult.totalEstimate = MOLD_ESTIMATE_VALIDATION.minimums.condition3;
      analysisResult.complianceNotes.push("Minimum charge applied for Condition 3 remediation");
    }
    
    // Check for critical species
    if (analysisResult.species?.identified?.includes('stachybotrys')) {
      if (analysisResult.totalEstimate < MOLD_ESTIMATE_VALIDATION.speciesAlerts.stachybotrys.minCost) {
        analysisResult.totalEstimate = MOLD_ESTIMATE_VALIDATION.speciesAlerts.stachybotrys.minCost;
      }
      analysisResult.healthWarnings.push(MOLD_ESTIMATE_VALIDATION.speciesAlerts.stachybotrys.alert);
    }
    
    return analysisResult;
    
  } catch (error) {
    console.error('Mold analysis error:', error);
    throw error;
  }
}

// Utility function to convert file to base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Simple Estimate Adjustment System
class EstimateAdjuster {
  constructor(estimate) {
    this.originalEstimate = estimate;
    this.laborMultiplier = 1.0;
    this.daysMultiplier = 1.0;
    this.materialsMultiplier = 1.0;
  }

  // Categorize line items into labor, equipment, and materials
  categorizeLineItems(lineItems) {
    const categories = {
      labor: [],
      equipment: [],
      materials: []
    };

    lineItems.forEach(item => {
      const desc = item.description.toLowerCase();
      
      // Labor items
      if (desc.includes('labor') || desc.includes('installation') || 
          desc.includes('removal') || desc.includes('assessment') ||
          desc.includes('setup') || desc.includes('cleaning') ||
          desc.includes('vacuum') || desc.includes('brush')) {
        categories.labor.push(item);
      }
      // Equipment items
      else if (desc.includes('scrubber') || desc.includes('machine') ||
               desc.includes('rental') || desc.includes('equipment') ||
               desc.includes('dehumidifier') || desc.includes('fogger') ||
               desc.includes('negative') || desc.includes('hepa')) {
        categories.equipment.push(item);
      }
      // Materials items
      else {
        categories.materials.push(item);
      }
    });

    return categories;
  }

  // Calculate category totals
  getCategoryTotals(lineItems) {
    const categories = this.categorizeLineItems(lineItems);
    
    return {
      laborCost: categories.labor.reduce((sum, item) => sum + item.total, 0),
      equipmentCost: categories.equipment.reduce((sum, item) => sum + item.total, 0),
      materialsCost: categories.materials.reduce((sum, item) => sum + item.total, 0)
    };
  }

  // Apply adjustments and get new line items
  getAdjustedLineItems(lineItems) {
    const categories = this.categorizeLineItems(lineItems);
    const adjustedItems = [];

    // Adjust labor items
    categories.labor.forEach(item => {
      adjustedItems.push({
        ...item,
        unitPrice: item.unitPrice * this.laborMultiplier,
        total: item.total * this.laborMultiplier,
        adjusted: true,
        category: 'labor'
      });
    });

    // Adjust equipment items (days multiplier affects quantity)
    categories.equipment.forEach(item => {
      const newQuantity = item.unit.includes('day') ? 
        Math.round(item.quantity * this.daysMultiplier) : 
        item.quantity;
      
      adjustedItems.push({
        ...item,
        quantity: newQuantity,
        total: item.unitPrice * newQuantity,
        adjusted: true,
        category: 'equipment'
      });
    });

    // Adjust materials items
    categories.materials.forEach(item => {
      adjustedItems.push({
        ...item,
        unitPrice: item.unitPrice * this.materialsMultiplier,
        total: item.total * this.materialsMultiplier,
        adjusted: true,
        category: 'materials'
      });
    });

    return adjustedItems;
  }

  // Get adjusted total
  getAdjustedTotal(lineItems) {
    const adjustedItems = this.getAdjustedLineItems(lineItems);
    return adjustedItems.reduce((sum, item) => sum + item.total, 0);
  }

  // Update multipliers
  setLaborMultiplier(value) {
    this.laborMultiplier = Math.max(0.5, Math.min(2.0, value));
  }

  setDaysMultiplier(value) {
    this.daysMultiplier = Math.max(0.33, Math.min(3.0, value));
  }

  setMaterialsMultiplier(value) {
    this.materialsMultiplier = Math.max(0.8, Math.min(1.5, value));
  }

  // Get adjustment summary
  getAdjustmentSummary(lineItems) {
    const original = this.getCategoryTotals(lineItems);
    const adjustedTotal = this.getAdjustedTotal(lineItems);
    const originalTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    
    return {
      original: original,
      multipliers: {
        labor: this.laborMultiplier,
        days: this.daysMultiplier,
        materials: this.materialsMultiplier
      },
      adjustedTotal: adjustedTotal,
      originalTotal: originalTotal,
      difference: adjustedTotal - originalTotal,
      percentChange: ((adjustedTotal - originalTotal) / originalTotal * 100).toFixed(1)
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeMoldDamage,
    EstimateAdjuster,
    MOLD_CONDITIONS,
    MOLD_SPECIES,
    YORK_PA_MOLD_PRICING,
    MOLD_EQUIPMENT_CALCULATIONS,
    MOLD_ESTIMATE_VALIDATION,
    MOLD_TEST_SCENARIOS
  };
}