/**
 * Food Storage Profiles and Scientific Storage Guidelines
 * References: FSSAI (Food Safety and Standards Authority of India),
 * US FDA Food Code, and USDA Postharvest Storage Guidelines.
 */

export const FOOD_PROFILES = {
  mixed: {
    id: 'mixed',
    name: 'Mixed Food',
    icon: 'PackageOpen',
    shortDesc: 'Multiple food categories sharing a single storage chamber',
    ambientDisclaimer: 'Critical: Different food products have divergent temperature and humidity requirements. A single chamber cannot meet all optimal conditions.',
    temp: {
      min: 0,
      max: 5,
      strictestMax: 5, // FSSAI recommendation for perishable items
      unit: '°C',
      guidance: 'Because mixed food may contain perishable items, ambient assessment defaults to the strictest cold chain limit (≤ 5°C). However, ambient temperature does not represent internal core temperature.'
    },
    humidity: {
      min: 65,
      max: 85,
      unit: '% RH',
      guidance: 'Incompatible humidity requirements exist between high-moisture produce (85-95%) and dry grains (<60%). Physical separation or sealed containment is required.'
    },
    incompatibilityNotes: [
      'High-humidity produce will cause moisture damage, clumping, or mold in dry goods/grains.',
      'Raw meat/poultry stored adjacent to ready-to-eat produce presents cross-contamination risk if not hermetically separated.',
      'Ethylene-producing fruits (apples, bananas) will accelerate senescence and spoilage of ethylene-sensitive vegetables (leafy greens, carrots).'
    ],
    strictestApplies: true
  },
  meat: {
    id: 'meat',
    name: 'Meat and Poultry',
    icon: 'Beef',
    shortDesc: 'Fresh raw meat, poultry cuts, and minced meats',
    ambientDisclaimer: 'Ambient air temperature must maintain cold chain integrity. Pathogen growth (Salmonella, Listeria) accelerates rapidly above 5°C.',
    temp: {
      min: -1,
      max: 4,
      strictestMax: 4,
      unit: '°C',
      guidance: 'Cold storage recommended between -1°C and 4°C. FSSAI & FDA mandate strictly ≤ 4°C to minimize microbial proliferation.'
    },
    humidity: {
      min: 85,
      max: 90,
      unit: '% RH',
      guidance: 'Optimal 85-90% RH prevents carcass and cut surface drying while limiting excessive surface condensation that fosters slime-forming bacteria.'
    },
    incompatibilityNotes: [
      'Must be stored on lowest shelves below cooked foods and produce to prevent drip contamination.',
      'Do not store alongside uncovered dairy or odor-sensitive items.'
    ],
    strictestApplies: true
  },
  fish: {
    id: 'fish',
    name: 'Fish and Seafood',
    icon: 'Fish',
    shortDesc: 'Fresh finfish, crustaceans, and shellfish',
    ambientDisclaimer: 'Seafood is the most perishable protein commodity. Rapid enzymatic breakdown and psychrotrophic bacterial growth occur even near 4°C.',
    temp: {
      min: 0,
      max: 2,
      strictestMax: 4,
      unit: '°C',
      guidance: 'Optimal temperature is 0°C to 2°C, traditionally stored on crushed melting ice. Must not exceed 4°C.'
    },
    humidity: {
      min: 90,
      max: 95,
      unit: '% RH',
      guidance: 'High humidity (90-95%) is necessary to prevent surface dehydration, loss of sheen, and weight loss.'
    },
    incompatibilityNotes: [
      'Volatile trimethylamine (TMA) and seafood odors can transfer readily to dairy, butter, and porous produce.',
      'Melting ice drainage must never contact other stored foods.'
    ],
    strictestApplies: true
  },
  dairy: {
    id: 'dairy',
    name: 'Dairy Products',
    icon: 'Milk',
    shortDesc: 'Milk, cream, butter, yogurt, and fresh soft cheeses',
    ambientDisclaimer: 'Pasteurized milk and soft cheeses require uninterrupted refrigeration to suppress Listeria monocytogenes and spoilage lactobacilli.',
    temp: {
      min: 1,
      max: 4,
      strictestMax: 5,
      unit: '°C',
      guidance: 'Maintain consistently between 1°C and 4°C. Spoilage souring and fat oxidation occur rapidly at elevated temperatures.'
    },
    humidity: {
      min: 65,
      max: 75,
      unit: '% RH',
      guidance: 'Moderate humidity (65-75%) protects cardboard and paperboard packaging from softening, while hard cheeses require controlled curing environments.'
    },
    incompatibilityNotes: [
      'Milk fats rapidly absorb aromas from allium vegetables (onions, garlic) and aromatic fruits.'
    ],
    strictestApplies: false
  },
  cooked: {
    id: 'cooked',
    name: 'Cooked Food & Leftovers',
    icon: 'Utensils',
    shortDesc: 'Prepared meals, sauces, cooked rice, and chilled leftovers',
    ambientDisclaimer: 'Cooked foods in the 5°C to 60°C "Danger Zone" allow spore-forming bacteria (Bacillus cereus, Clostridium perfringens) to multiply.',
    temp: {
      min: 1,
      max: 4,
      strictestMax: 5,
      unit: '°C',
      guidance: 'Rapidly chill to ≤ 4°C within 2 hours of preparation. FSSAI receiving/holding standard recommends ≤ 5°C.'
    },
    humidity: {
      min: 50,
      max: 70,
      unit: '% RH',
      guidance: 'Cooked items should always be stored in sealed, airtight containers, making ambient chamber humidity secondary.'
    },
    incompatibilityNotes: [
      'Must always be placed above raw meats and raw unwashed produce in refrigeration hierarchies.'
    ],
    strictestApplies: true
  },
  fruits: {
    id: 'fruits',
    name: 'Fresh Fruits',
    icon: 'Apple',
    shortDesc: 'Temperate and refrigerated fruits (berries, apples, grapes)',
    ambientDisclaimer: 'High ambient humidity is essential and beneficial for fruits to prevent transpiration and wilting.',
    temp: {
      min: 1,
      max: 5,
      strictestMax: 10,
      unit: '°C',
      guidance: 'Temperate fruits: 1°C - 5°C. Note: Tropical fruits (bananas, mangoes, papayas) suffer chilling injury below 10-12°C and must be stored at ambient/cool rooms.'
    },
    humidity: {
      min: 85,
      max: 95,
      unit: '% RH',
      guidance: 'High humidity (85-95% RH) is physiologically required to maintain cellular turgor and prevent shriveling. Not a hazard.'
    },
    incompatibilityNotes: [
      'Climacteric fruits emit ethylene gas during ripening, which will yellow leafy greens and cause sprouting in potatoes.'
    ],
    strictestApplies: false
  },
  vegetables: {
    id: 'vegetables',
    name: 'Fresh Vegetables',
    icon: 'Carrot',
    shortDesc: 'Leafy greens, brassicas, root vegetables, and herbs',
    ambientDisclaimer: 'Greens require high moisture; root tubers (potatoes/onions) require cool, dark, lower-humidity ventilated storage.',
    temp: {
      min: 1,
      max: 5,
      strictestMax: 10,
      unit: '°C',
      guidance: 'Leafy greens and temperate vegetables require 1°C - 5°C. Root crops (potatoes/onions) require 10°C - 15°C.'
    },
    humidity: {
      min: 85,
      max: 95,
      unit: '% RH',
      guidance: 'Leafy greens require 90-95% RH to avoid rapid wilting. Onions and garlic, conversely, rot rapidly above 70% RH.'
    },
    incompatibilityNotes: [
      'Do not store onions with potatoes (accelerates potato sprouting and moisture decay).'
    ],
    strictestApplies: false
  },
  grains: {
    id: 'grains',
    name: 'Dry Food & Grains',
    icon: 'Wheat',
    shortDesc: 'Flour, rice, pulses, cereals, spices, and dried goods',
    ambientDisclaimer: 'Moisture is the primary enemy of dry storage. Relative humidity above 65% triggers mold, mycotoxins, and pest activity.',
    temp: {
      min: 15,
      max: 22,
      strictestMax: 25,
      unit: '°C',
      guidance: 'Cool ambient storage (15°C - 22°C) in well-ventilated dry spaces away from direct heat sources.'
    },
    humidity: {
      min: 40,
      max: 60,
      unit: '% RH',
      guidance: 'Target RH is 45-55%, never exceeding 60%. High humidity leads to mold growth, grain clumping, and aflatoxin production.'
    },
    incompatibilityNotes: [
      'Must never share unventilated cold refrigeration spaces where condensation can settle on packages.'
    ],
    strictestApplies: false
  },
  custom: {
    id: 'custom',
    name: 'Custom Storage Profile',
    icon: 'Sliders',
    shortDesc: 'User-configured custom temperature and humidity boundaries',
    ambientDisclaimer: 'Evaluated strictly against user-defined environmental thresholds.',
    temp: {
      min: 2,
      max: 8,
      strictestMax: 10,
      unit: '°C',
      guidance: 'User-defined temperature envelope for specialized storage applications.'
    },
    humidity: {
      min: 40,
      max: 80,
      unit: '% RH',
      guidance: 'User-defined relative humidity envelope.'
    },
    incompatibilityNotes: [
      'Custom parameter monitoring requires verification against relevant HACCP or manufacturer documentation.'
    ],
    strictestApplies: false
  }
};

