export interface SupplierResponsePhoto {
  src: string;
  alt: string;
  caption: string;
}

export const sampleResponsePhotos: Record<string, SupplierResponsePhoto[]> = {
  r1: [
    { src: '/sample-products/palay-rc216-1.svg', alt: 'Palay RC-216 fresh harvest sample', caption: 'Freshly harvested RC-216 sample from the cooperative.' },
    { src: '/sample-products/palay-rc216-2.svg', alt: 'Palay RC-216 bagged stock sample', caption: 'Prepared sacks available for the matched quantity.' },
  ],
  r2: [
    { src: '/sample-products/palay-rc216-2.svg', alt: 'Palay RC-216 small batch sample', caption: 'Small-batch RC-216 stock from the supplier farm.' },
  ],
  r3: [
    { src: '/sample-products/palay-rc222-1.svg', alt: 'NSIC Rc 222 field sample', caption: 'Field sample showing the supplier crop condition.' },
    { src: '/sample-products/palay-rc222-2.svg', alt: 'NSIC Rc 222 grain close-up', caption: 'Close-up sample for visual grain and cleanliness review.' },
  ],
  r4: [
    { src: '/sample-products/copra-1.svg', alt: 'Coconut copra drying batch', caption: 'Drying batch with moisture tested below the buyer limit.' },
    { src: '/sample-products/copra-2.svg', alt: 'Coconut copra warehouse stock', caption: 'Warehouse stock prepared for buyer pickup.' },
  ],
  r5: [
    { src: '/sample-products/copra-3.svg', alt: 'Grade A copra quality sample', caption: 'Grade A copra sample from aggregated farm sources.' },
    { src: '/sample-products/copra-4.svg', alt: 'Aggregated copra stock', caption: 'Full-quantity aggregated stock ready for scheduled fulfillment.' },
  ],
  r6: [
    { src: '/sample-products/pili-1.svg', alt: 'Premium Bicol pili nut sample', caption: 'Premium shell-on Bicol pili with no cracked shells.' },
    { src: '/sample-products/pili-2.svg', alt: 'Sorted Bicol pili nut batch', caption: 'Sorted batch prepared for food-processing use.' },
  ],
  r7: [
    { src: '/sample-products/palay-rc222-3.svg', alt: 'NSIC Rc 222 prepared sacks', caption: 'Prepared sacks from the Libmanan farm.' },
    { src: '/sample-products/palay-rc222-4.svg', alt: 'NSIC Rc 222 farm stock', caption: 'Current farm stock with reported moisture of 13.8%.' },
  ],
  r8: [
    { src: '/sample-products/ginger-1.svg', alt: 'Fresh local ginger harvest', caption: 'Fresh local ginger aggregated from Sorsogon farmers.' },
    { src: '/sample-products/ginger-2.svg', alt: 'Sorted ginger roots', caption: 'Sorted roots free from visible rot.' },
  ],
  r9: [
    { src: '/sample-products/abaca-1.svg', alt: 'Grade A abaca fiber sample', caption: 'Grade A fiber sample following Philippine grading.' },
    { src: '/sample-products/abaca-2.svg', alt: 'Bundled abaca fiber stock', caption: 'Bundled stock available for delivery or pickup.' },
  ],
};
