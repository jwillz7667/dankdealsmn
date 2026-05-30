/* ============================================================
   DankDeals — Catalog data
   ============================================================ */
window.DD_CATEGORIES = [
  { id: 'flower',       name: 'Flower',        blurb: 'Premium buds, jarred fresh',      icon: 'flower' },
  { id: 'prerolls',     name: 'Pre-Rolls',     blurb: 'Ready to spark',                  icon: 'joint' },
  { id: 'edibles',      name: 'Edibles',       blurb: 'Gummies, chocolate & more',       icon: 'gummy' },
  { id: 'vapes',        name: 'Vapes & Carts', blurb: 'Discreet & potent',               icon: 'vape' },
  { id: 'concentrates', name: 'Concentrates',  blurb: 'Wax, rosin & badder',             icon: 'concentrate' },
  { id: 'tinctures',    name: 'Tinctures',     blurb: 'Precise, fast-acting drops',      icon: 'dropper' },
  { id: 'topicals',     name: 'Topicals',      blurb: 'Balms, lotions & relief',         icon: 'balm' },
  { id: 'accessories',  name: 'Accessories',   blurb: 'Grinders, papers & gear',         icon: 'grinder' },
];

window.DD_PRODUCTS = [
  // ---- Flower ----
  { id: 'f1', name: 'Northern Lights', brand: 'Lakeside Botanicals', cat: 'flower', type: 'Indica', thc: 24, cbd: 0.1, price: 42, old: 52, size: '3.5g', rating: 4.8, reviews: 312, badges: ['deal','best'], effects: ['Relaxed','Sleepy','Happy'], desc: 'A legendary indica with a sweet, earthy aroma. Northern Lights melts away tension and eases you into a deep, restful calm — our most-ordered nightcap strain.' },
  { id: 'f2', name: 'Sour Diesel', brand: 'Twin Cities Grown', cat: 'flower', type: 'Sativa', thc: 26, cbd: 0.2, price: 48, size: '3.5g', rating: 4.7, reviews: 256, badges: ['best'], effects: ['Energetic','Uplifted','Creative'], desc: 'Fast-acting, fuel-forward sativa. Sour Diesel delivers a clear, dreamy, cerebral lift that pairs perfectly with a busy Twin Cities day.' },
  { id: 'f3', name: 'Wedding Cake', brand: 'North Star Farms', cat: 'flower', type: 'Hybrid', thc: 25, cbd: 0.1, price: 50, size: '3.5g', rating: 4.9, reviews: 401, badges: ['new'], effects: ['Relaxed','Euphoric','Hungry'], desc: 'Rich, tangy and decadent. Wedding Cake is a balanced hybrid with frosted trichomes and a smooth, vanilla finish.' },
  { id: 'f4', name: 'Blue Dream', brand: 'Lakeside Botanicals', cat: 'flower', type: 'Hybrid', thc: 22, cbd: 0.3, price: 38, old: 44, size: '3.5g', rating: 4.6, reviews: 198, badges: ['deal'], effects: ['Happy','Relaxed','Focused'], desc: 'The all-day classic. A gentle berry sweetness and a balanced, functional high that beginners and veterans both love.' },
  { id: 'f5', name: 'GG4 (Gorilla Glue)', brand: 'North Star Farms', cat: 'flower', type: 'Hybrid', thc: 28, cbd: 0.1, price: 54, size: '3.5g', rating: 4.8, reviews: 277, badges: ['best'], effects: ['Relaxed','Euphoric','Couch-lock'], desc: 'Heavy-hitting and sticky with a pungent, coffee-chocolate nose. GG4 glues you to the couch in the best way.' },
  { id: 'f6', name: 'Granddaddy Purple', brand: 'Twin Cities Grown', cat: 'flower', type: 'Indica', thc: 23, cbd: 0.2, price: 46, size: '3.5g', rating: 4.7, reviews: 221, badges: [], effects: ['Sleepy','Relaxed','Calm'], desc: 'Deep purple buds with a grape-berry aroma. A textbook indica for unwinding after a long day.' },

  // ---- Pre-Rolls ----
  { id: 'p1', name: 'Infused Diamond Pre-Roll', brand: 'Bolt Extracts', cat: 'prerolls', type: 'Hybrid', thc: 38, cbd: 0, price: 18, old: 24, size: '1g', rating: 4.8, reviews: 143, badges: ['deal','best'], effects: ['Euphoric','Potent','Happy'], desc: 'A full gram of premium flower coated in kief and packed with THC diamonds. One and done.' },
  { id: 'p2', name: 'Daily Driver 5-Pack', brand: 'North Star Farms', cat: 'prerolls', type: 'Sativa', thc: 21, cbd: 0.2, price: 32, size: '5 × 0.5g', rating: 4.6, reviews: 188, badges: ['best'], effects: ['Uplifted','Social','Energetic'], desc: 'Five perfectly-rolled half-grams of bright sativa. Stash them anywhere and spark whenever.' },
  { id: 'p3', name: 'Bedtime Indica Roll', brand: 'Lakeside Botanicals', cat: 'prerolls', type: 'Indica', thc: 23, cbd: 0.3, price: 14, size: '1g', rating: 4.7, reviews: 96, badges: [], effects: ['Sleepy','Relaxed','Calm'], desc: 'A mellow single gram designed for the end of the night. Smooth, slow-burning and calming.' },
  { id: 'p4', name: 'Mini Roll 7-Pack', brand: 'Twin Cities Grown', cat: 'prerolls', type: 'Hybrid', thc: 20, cbd: 0.1, price: 28, old: 34, size: '7 × 0.35g', rating: 4.5, reviews: 74, badges: ['deal'], effects: ['Balanced','Happy','Relaxed'], desc: 'Bite-size dogwalkers for when you just want a few minutes. Great to share.' },

  // ---- Edibles ----
  { id: 'e1', name: 'Wild Berry Gummies', brand: 'Boundary Waters Co.', cat: 'edibles', type: 'Hybrid', thc: 10, cbd: 0, price: 22, size: '10 × 10mg', rating: 4.9, reviews: 524, badges: ['best'], effects: ['Happy','Relaxed','Giggly'], desc: 'Real-fruit gummies dosed at a reliable 10mg each. Vegan, gluten-free, and absurdly tasty.' },
  { id: 'e2', name: 'Dark Chocolate Bar', brand: 'North Loop Confections', cat: 'edibles', type: 'Indica', thc: 100, cbd: 0, price: 26, size: '10 × 10mg', rating: 4.7, reviews: 211, badges: [], effects: ['Relaxed','Sleepy','Calm'], desc: 'Single-origin 70% dark chocolate, scored into ten even squares. Melt-in-your-mouth, no weedy aftertaste.' },
  { id: 'e3', name: 'Sleep Gummies + CBN', brand: 'Boundary Waters Co.', cat: 'edibles', type: 'Indica', thc: 5, cbd: 5, price: 28, old: 33, size: '20 × 5mg', rating: 4.8, reviews: 367, badges: ['deal','best'], effects: ['Sleepy','Calm','Relaxed'], desc: 'A 5mg THC + 5mg CBN blend formulated for deep sleep. Wake up clear, not groggy.' },
  { id: 'e4', name: 'Citrus Fast-Acting Gummies', brand: 'Lift Provisions', cat: 'edibles', type: 'Sativa', thc: 10, cbd: 0, price: 24, size: '10 × 10mg', rating: 4.6, reviews: 158, badges: ['new'], effects: ['Energetic','Uplifted','Happy'], desc: 'Nano-emulsified for onset in as little as 15 minutes. Bright citrus flavor, daytime energy.' },
  { id: 'e5', name: 'Microdose Mints', brand: 'Lift Provisions', cat: 'edibles', type: 'Hybrid', thc: 2.5, cbd: 0, price: 20, size: '20 × 2.5mg', rating: 4.5, reviews: 89, badges: [], effects: ['Light','Focused','Social'], desc: 'Tiny 2.5mg mints for a gentle, controllable lift. Perfect for newcomers and functional days.' },

  // ---- Vapes & Carts ----
  { id: 'v1', name: 'Live Resin Cart — Gelato', brand: 'Bolt Extracts', cat: 'vapes', type: 'Hybrid', thc: 84, cbd: 0, price: 45, old: 55, size: '1g', rating: 4.8, reviews: 302, badges: ['deal','best'], effects: ['Euphoric','Relaxed','Happy'], desc: 'Full-spectrum live resin in a 510 cart. Dessert-sweet Gelato terps and a thick, flavorful pull.' },
  { id: 'v2', name: 'All-In-One Disposable — Jack', brand: 'Bolt Extracts', cat: 'vapes', type: 'Sativa', thc: 81, cbd: 0, price: 38, size: '0.5g', rating: 4.6, reviews: 174, badges: [], effects: ['Energetic','Creative','Uplifted'], desc: 'Rechargeable all-in-one with bright Jack Herer terps. No cart, no battery to buy — just go.' },
  { id: 'v3', name: 'Pod Battery Kit', brand: 'Volt Hardware', cat: 'vapes', type: 'Hybrid', thc: 0, cbd: 0, price: 30, size: 'Device', rating: 4.7, reviews: 121, badges: ['new'], effects: [], desc: 'Sleek magnetic 510 battery with three heat settings and USB-C fast charge. Pairs with any cart.' },
  { id: 'v4', name: 'CBD:THC Balance Cart', brand: 'Even Keel', cat: 'vapes', type: 'CBD', thc: 40, cbd: 40, price: 42, size: '1g', rating: 4.5, reviews: 67, badges: [], effects: ['Calm','Clear','Relaxed'], desc: 'A balanced 1:1 cart for relief without the heavy head. Smooth, herbal, and even.' },

  // ---- Concentrates ----
  { id: 'c1', name: 'Live Rosin Badder', brand: 'Bolt Extracts', cat: 'concentrates', type: 'Hybrid', thc: 78, cbd: 0, price: 60, old: 72, size: '1g', rating: 4.9, reviews: 142, badges: ['deal','best'], effects: ['Potent','Euphoric','Relaxed'], desc: 'Solventless, whipped to a creamy badder. Bursting with terpenes and the cleanest dab you can order.' },
  { id: 'c2', name: 'Cured Resin Sugar', brand: 'Bolt Extracts', cat: 'concentrates', type: 'Indica', thc: 82, cbd: 0, price: 40, size: '1g', rating: 4.6, reviews: 88, badges: [], effects: ['Relaxed','Sleepy','Happy'], desc: 'Crystalline sugar with a bold, gassy nose. High-potency value for everyday dabbers.' },
  { id: 'c3', name: 'THCa Diamonds', brand: 'Crystal Lake Labs', cat: 'concentrates', type: 'Sativa', thc: 90, cbd: 0, price: 55, size: '1g', rating: 4.8, reviews: 103, badges: ['new'], effects: ['Potent','Energetic','Euphoric'], desc: 'Near-pure crystalline THCa. Sprinkle on a bowl or dab solo for an intensely clean high.' },

  // ---- Tinctures ----
  { id: 't1', name: 'Full-Spectrum Drops 1:1', brand: 'Even Keel', cat: 'tinctures', type: 'CBD', thc: 15, cbd: 15, price: 44, old: 52, size: '30ml · 450mg', rating: 4.7, reviews: 134, badges: ['deal'], effects: ['Calm','Relaxed','Clear'], desc: 'A balanced MCT-oil tincture for daily balance. Precise dropper, fast sublingual onset.' },
  { id: 't2', name: 'High-THC Tincture', brand: 'Even Keel', cat: 'tinctures', type: 'Hybrid', thc: 30, cbd: 2, price: 48, size: '30ml · 900mg', rating: 4.6, reviews: 76, badges: [], effects: ['Relaxed','Happy','Euphoric'], desc: 'Potent, flavorless drops you can dose to the milligram. Great for replacing inhalables.' },
  { id: 't3', name: 'CBD Calm Tincture', brand: 'Even Keel', cat: 'tinctures', type: 'CBD', thc: 0, cbd: 30, price: 40, size: '30ml · 900mg', rating: 4.8, reviews: 191, badges: ['best'], effects: ['Calm','Clear','Focused'], desc: 'Zero-THC, high-CBD drops for clear-headed calm. Take it any time of day.' },

  // ---- Topicals ----
  { id: 'o1', name: 'Relief Muscle Balm', brand: 'North Loop Body', cat: 'topicals', type: 'CBD', thc: 5, cbd: 50, price: 36, size: '2oz · 550mg', rating: 4.8, reviews: 167, badges: ['best'], effects: ['Soothing','Localized','Warming'], desc: 'A warming menthol-camphor balm for sore muscles and joints. Targeted relief, zero head high.' },
  { id: 'o2', name: 'Daily CBD Lotion', brand: 'North Loop Body', cat: 'topicals', type: 'CBD', thc: 0, cbd: 30, price: 30, old: 36, size: '4oz · 600mg', rating: 4.6, reviews: 92, badges: ['deal'], effects: ['Soothing','Hydrating'], desc: 'Lightweight, fast-absorbing lotion for everyday skin and recovery. Lightly citrus-scented.' },
  { id: 'o3', name: 'Cooling Roll-On Gel', brand: 'Even Keel', cat: 'topicals', type: 'CBD', thc: 2, cbd: 40, price: 28, size: '3oz', rating: 4.5, reviews: 58, badges: ['new'], effects: ['Cooling','Localized'], desc: 'No-mess roll-on with arnica and menthol. Toss it in a gym bag for on-the-spot relief.' },

  // ---- Accessories ----
  { id: 'a1', name: '4-Piece Metal Grinder', brand: 'Volt Hardware', cat: 'accessories', type: 'Hybrid', thc: 0, cbd: 0, price: 24, old: 30, size: '2.5"', rating: 4.7, reviews: 213, badges: ['deal','best'], effects: [], desc: 'Anodized aluminum grinder with a pollen catch and razor-sharp diamond teeth. Smooth magnetic lid.' },
  { id: 'a2', name: 'Hemp Rolling Papers', brand: 'North Star Farms', cat: 'accessories', type: 'Hybrid', thc: 0, cbd: 0, price: 6, size: '1¼ · 50ct', rating: 4.6, reviews: 144, badges: [], effects: [], desc: 'Slow-burning, unbleached hemp papers with natural gum. A pack you’ll actually finish.' },
  { id: 'a3', name: 'Glass Spoon Pipe', brand: 'Volt Hardware', cat: 'accessories', type: 'Hybrid', thc: 0, cbd: 0, price: 22, size: '4"', rating: 4.5, reviews: 77, badges: ['new'], effects: [], desc: 'Hand-blown borosilicate spoon with a deep bowl and comfortable carb. Fits the palm perfectly.' },
  { id: 'a4', name: 'Odor-Proof Stash Bag', brand: 'Volt Hardware', cat: 'accessories', type: 'Hybrid', thc: 0, cbd: 0, price: 34, size: 'Medium', rating: 4.8, reviews: 105, badges: [], effects: [], desc: 'Carbon-lined, lockable stash bag that seals in smell. Keeps everything organized and discreet.' },
];

window.DD_BRANDS = [...new Set(window.DD_PRODUCTS.map(p => p.brand))].sort();

window.DD_DELIVERY = {
  fee: 5,
  freeOver: 75,
  minOrder: 30,
  taxRate: 0.10,
  zones: ['Minneapolis','St. Paul','Bloomington','Edina','Richfield','St. Louis Park','Roseville','Maplewood','Eagan','Plymouth','Minnetonka','Brooklyn Park','Eden Prairie','Burnsville'],
};
