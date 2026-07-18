import fs from 'node:fs';

function updateFile(path, transform) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);

  if (after === before) {
    console.log(`No changes needed: ${path}`);
    return;
  }

  fs.writeFileSync(path, after, 'utf8');
  console.log(`Updated: ${path}`);
}

updateFile('src/types/index.ts', source =>
  source.replace(
    "deliveryPreference: 'Delivery' | 'Pickup' | 'Either';",
    "deliveryPreference: 'Delivery' | 'Pickup';",
  ),
);

const sampleSelections = {
  d2: 'Delivery',
  d4: 'Pickup',
  d6: 'Delivery',
  d8: 'Pickup',
};

updateFile('src/data/mockData.ts', source => {
  let updated = source;

  for (const [demandId, preference] of Object.entries(sampleSelections)) {
    const demandPattern = new RegExp(
      `(id:\\s*'${demandId}'[\\s\\S]*?deliveryPreference:\\s*)'Either'`,
    );

    if (!demandPattern.test(updated)) {
      console.warn(`Could not find an Either preference for sample demand ${demandId}.`);
      continue;
    }

    updated = updated.replace(demandPattern, `$1'${preference}'`);
  }

  if (/deliveryPreference:\s*'Either'/.test(updated)) {
    console.warn(
      "Some 'Either' sample values remain. Review them and select either 'Delivery' or 'Pickup'.",
    );
  }

  return updated;
});

console.log('Delivery Preference update completed.');
