import fs from 'node:fs';

const mockDataPath = 'src/data/mockData.ts';

if (!fs.existsSync(mockDataPath)) {
  throw new Error(`File not found: ${mockDataPath}. Run this script from the repository root.`);
}

let source = fs.readFileSync(mockDataPath, 'utf8');

const responseNotes = {
  r1: 'Supplier will deliver the full quantity to the buyer-designated Naga City warehouse. Truck is available.',
  r2: 'Supplier will deliver the available quantity to the buyer-designated Naga City location.',
  r3: 'Supplier will deliver the offered quantity to the buyer-designated Naga City location. Delivery cost is included in the offer unless otherwise agreed before matching.',
  r4: 'Buyer will pick up the offered quantity from the supplier-designated Daet warehouse.',
  r5: 'Buyer will pick up the full offered quantity from the supplier-designated consolidation point in Sorsogon.',
  r6: 'Supplier will deliver the full offered quantity to the buyer-designated Legazpi City location.',
  r7: 'Supplier will deliver the offered quantity to the buyer-designated location within Camarines Sur.',
  r8: 'Buyer will pick up the offered quantity from the supplier-designated consolidation point in Sorsogon.',
  r9: 'Buyer will pick up the offered quantity from the supplier-designated storage location.',
};

function replaceResponseNote(text, responseId, newNote) {
  const pattern = new RegExp(
    `(id:\\s*'${responseId}'[\\s\\S]*?pickupDeliveryNote:\\s*)'[^']*'`
  );

  if (!pattern.test(text)) {
    console.warn(`Could not locate pickupDeliveryNote for ${responseId}.`);
    return text;
  }

  return text.replace(pattern, `$1'${newNote.replaceAll("'", "\\'")}'`);
}

for (const [responseId, note] of Object.entries(responseNotes)) {
  source = replaceResponseNote(source, responseId, note);
}

fs.writeFileSync(mockDataPath, source, 'utf8');

const demandPreferences = {
  d1: 'Delivery',
  d2: 'Delivery',
  d3: 'Pickup',
  d4: 'Pickup',
  d5: 'Delivery',
  d6: 'Delivery',
  d7: 'Delivery',
  d8: 'Pickup',
  d9: 'Delivery',
};

const responseDemandMap = {
  r1: 'd1',
  r2: 'd1',
  r3: 'd2',
  r4: 'd3',
  r5: 'd3',
  r6: 'd6',
  r7: 'd2',
  r8: 'd8',
  r9: 'd4',
};

console.log('\nDemand and Supplier Response fulfillment alignment:');
console.log('---------------------------------------------------');

for (const [responseId, demandId] of Object.entries(responseDemandMap)) {
  console.log(`${responseId} -> ${demandId}: ${demandPreferences[demandId]}`);
}

console.log('\nUpdated supplier response fulfillment notes in src/data/mockData.ts.');
console.log('All sample responses now follow the posted demand preference.');
