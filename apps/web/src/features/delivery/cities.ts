/**
 * Canonical data for the /delivery/[city] local landing pages.
 *
 * These pages target high-intent local search ("cannabis delivery {city}",
 * "{city} dispensary near me"). Content is hand-written and unique per city —
 * never a templated swap — to avoid thin/duplicate-content penalties. Dollar
 * amounts and ETAs are intentionally kept out of the prose; the page renders
 * those live from StoreConfig so marketing copy can't drift from the DB.
 *
 * The served-city list mirrors StoreSettings.zones (see store seed). Keep slugs
 * stable: they are public URLs and may already be indexed.
 */
export interface CityFaq {
  question: string;
  answer: string;
}

export interface City {
  slug: string;
  name: string;
  county: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  /** Exactly two unique paragraphs of local copy. */
  intro: [string, string];
  /** Real, widely-known neighborhoods / districts of this city. */
  neighborhoods: string[];
  /** Three short, city-tailored benefit lines. */
  highlights: [string, string, string];
  faqs: CityFaq[];
}

export const CITIES: City[] = [
  {
    slug: 'minneapolis',
    name: 'Minneapolis',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Minneapolis, MN | DankDeals',
    metaDescription:
      'Fast, licensed cannabis delivery in Minneapolis. Lab-tested flower, edibles & vapes to your door in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Lab-tested flower, edibles and vapes delivered anywhere in Minneapolis — same-day, in about 60–90 minutes.',
    intro: [
      'DankDeals brings licensed cannabis delivery to every corner of Minneapolis, from the lakes of Uptown and Linden Hills to the breweries of Northeast and the towers downtown. Order online, verify your ID once, and a discreet driver routes to your door — no waiting in a dispensary line, no parking ramp, no detour off your day.',
      'Minneapolis moves fast, and so do we. Whether you are in a North Loop loft, a Whittier walk-up, a Longfellow bungalow or a Powderhorn duplex, our drivers know the grid and the bridges. Everything in the catalog is third-party lab-tested and sealed in smell-proof packaging, so what arrives is exactly what you ordered.',
    ],
    neighborhoods: [
      'Uptown',
      'North Loop',
      'Northeast',
      'Downtown',
      'Lyn-Lake',
      'Dinkytown',
      'Longfellow',
      'Linden Hills',
      'Powderhorn',
    ],
    highlights: [
      'Citywide coverage from Northeast to the southwest lakes',
      'Drivers who know the river crossings and one-ways',
      'Discreet, unmarked delivery to apartments and houses alike',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis anywhere in Minneapolis?',
        answer:
          'Yes. We cover all Minneapolis neighborhoods, from Northeast and downtown to Uptown, Longfellow and the southwest lakes. Enter your address at checkout to confirm coverage before you pay — if you are inside our metro zone, you are good to go.',
      },
      {
        question: 'How fast is delivery in Minneapolis?',
        answer:
          'Most Minneapolis orders arrive within 60–90 minutes of being placed, seven days a week. You will get a text when your driver is close, and you can track each stage of the order from confirmed to out for delivery.',
      },
      {
        question: 'How do I pay for a Minneapolis delivery?',
        answer:
          'Pay your driver with cash or a debit card on arrival — there is no online card payment. Delivery is a flat $5 and free on orders of $75 or more, with a $30 order minimum. Have a valid 21+ ID ready at the door.',
      },
    ],
  },
  {
    slug: 'st-paul',
    name: 'St. Paul',
    county: 'Ramsey County',
    metaTitle: 'Cannabis Delivery in St. Paul, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery across St. Paul — Highland Park to Lowertown. Lab-tested products to your door in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Same-day cannabis delivery throughout the capital city, from Cathedral Hill to Highland Park — usually in 60–90 minutes.',
    intro: [
      'In St. Paul, DankDeals delivers from the historic homes of Summit and Cathedral Hill to the lofts of Lowertown and the river bluffs of the West Side. Skip the trip down Grand Avenue — browse our lab-tested menu, check out in under a minute, and let a discreet driver come to you instead.',
      'The capital city has its own rhythm, and our drivers know it: the diagonal of West Seventh, the calm of Mac-Groveland, the parks around Como. Wherever you are in St. Paul, your order arrives sealed, smell-proof and exactly as described, with a quick ID check at the door to keep everything 21+ and compliant.',
    ],
    neighborhoods: [
      'Cathedral Hill',
      'Highland Park',
      'Summit Hill',
      'Macalester-Groveland',
      'Lowertown',
      'Grand Avenue',
      'Como',
      'West Seventh',
      'Dayton’s Bluff',
    ],
    highlights: [
      'Coverage from the West Side bluffs to Como and the North End',
      'Quick routing along West Seventh, Snelling and Grand',
      'Sealed, discreet delivery to homes, condos and lofts',
    ],
    faqs: [
      {
        question: 'Which St. Paul neighborhoods do you deliver to?',
        answer:
          'We serve St. Paul citywide — Highland Park, Mac-Groveland, Summit and Cathedral Hill, Lowertown, Como, the West Side and beyond. Enter your address at checkout to confirm you are inside our delivery zone before paying.',
      },
      {
        question: 'How long does delivery take in St. Paul?',
        answer:
          'Plan on about 60–90 minutes from order to door, every day of the week. We deliver from late morning into the evening, and you can track your order in real time from confirmation through out-for-delivery.',
      },
      {
        question: 'Is there an order minimum in St. Paul?',
        answer:
          'Yes, the minimum order is $30. Delivery is a flat $5 and becomes free once your subtotal reaches $75. Pay with cash or debit when the driver arrives, and have a valid 21+ ID ready.',
      },
    ],
  },
  {
    slug: 'bloomington',
    name: 'Bloomington',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Bloomington, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Bloomington, MN — near Mall of America and MSP. Lab-tested flower, edibles & vapes in 60–90 minutes. Cash or debit. 21+.',
    heroSubtitle:
      'Discreet, same-day cannabis delivery across Bloomington — from the South Loop to West Bloomington in about 60–90 minutes.',
    intro: [
      'Bloomington is big, and DankDeals covers it — the South Loop hotels and Mall of America district, the established neighborhoods off Old Shakopee Road, and the quiet streets of West Bloomington near Hyland. Order from home, the office or a hotel room and a discreet driver brings lab-tested cannabis straight to you.',
      'Living next to MSP and the country’s largest mall means a lot of comings and goings, and our delivery fits right in: unmarked, sealed and on your schedule. From Penn-American to East Bloomington along the river, you skip the traffic on 494 entirely and let us handle the last mile.',
    ],
    neighborhoods: [
      'South Loop',
      'East Bloomington',
      'West Bloomington',
      'Penn-American District',
      'Old Cedar',
      'Normandale',
      'Mall of America area',
    ],
    highlights: [
      'Covers the South Loop, Normandale and West Bloomington',
      'Convenient for hotels near MSP and Mall of America',
      'No drive on 494 — we bring it to your door',
    ],
    faqs: [
      {
        question: 'Do you deliver near Mall of America and MSP?',
        answer:
          'Yes. We deliver throughout Bloomington, including the South Loop and hotel district around Mall of America and the airport. Add your address — or hotel address — at checkout to confirm coverage before you pay.',
      },
      {
        question: 'How fast is cannabis delivery in Bloomington?',
        answer:
          'Most Bloomington orders arrive within 60–90 minutes, seven days a week. You will receive a text as your driver approaches and can follow the order from confirmed through out for delivery.',
      },
      {
        question: 'What payment do you take in Bloomington?',
        answer:
          'Cash or debit card paid to the driver on arrival. Delivery is a flat $5, free over $75, with a $30 minimum. A valid 21+ ID is required at the door for every order.',
      },
    ],
  },
  {
    slug: 'edina',
    name: 'Edina',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Edina, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Edina, MN — 50th & France to Southdale. Lab-tested products to your door in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Premium, lab-tested cannabis delivered across Edina — from 50th & France to Southdale — usually in 60–90 minutes.',
    intro: [
      'DankDeals delivers throughout Edina, from the boutiques of 50th & France and the shops around Southdale to the tree-lined streets of the Country Club district and Morningside. Browse a curated, lab-tested menu and have it brought to your door discreetly — no errand, no line, no fuss.',
      'Edina expects a certain standard, and our service is built for it: carefully sourced products, clean sealed packaging and a courteous, on-time driver. Whether you are near Grandview, Pentagon Park or Edinborough, you order online and we handle the rest, with a quick 21+ ID check when we arrive.',
    ],
    neighborhoods: [
      '50th & France',
      'Southdale',
      'Country Club District',
      'Morningside',
      'Grandview',
      'Pentagon Park',
      'Edinborough',
    ],
    highlights: [
      'Curated, premium menu suited to Edina',
      'Coverage from Morningside to Southdale and Cahill',
      'Courteous, discreet, on-time delivery',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis throughout Edina?',
        answer:
          'Yes — we cover Edina from 50th & France and Morningside to Southdale, the Country Club district, Grandview and Cahill. Confirm your specific address at checkout to make sure you are inside our delivery zone.',
      },
      {
        question: 'How long is delivery in Edina?',
        answer:
          'Most Edina orders arrive in about 60–90 minutes, seven days a week. You will get a heads-up text when the driver is close, and live tracking shows each step from confirmed to delivered.',
      },
      {
        question: 'How does payment work in Edina?',
        answer:
          'You pay the driver directly with cash or debit on arrival. Delivery is a flat $5, free on orders of $75 or more, with a $30 minimum. Please have a valid 21+ ID ready when we reach your door.',
      },
    ],
  },
  {
    slug: 'richfield',
    name: 'Richfield',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Richfield, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Richfield, MN. Lab-tested flower, edibles & vapes to your door in 60–90 minutes, 7 days a week. Cash or debit on arrival. 21+.',
    heroSubtitle:
      'Same-day cannabis delivery across Richfield — Minnesota’s urban hometown — typically in 60–90 minutes.',
    intro: [
      'Tucked between Minneapolis, the airport and the Crosstown, Richfield is one of the easiest cities for us to reach quickly. DankDeals delivers lab-tested flower, edibles and vapes to homes and apartments from Wood Lake to the Penn and Lyndale corridors — order online and a discreet driver is on the way.',
      'Richfield’s walkable, close-knit neighborhoods are made for fast, no-hassle delivery. Skip the drive up Cedar or over to a dispensary; we bring your order to you, sealed and smell-proof, with a quick ID check at the door so everything stays 21+ and compliant.',
    ],
    neighborhoods: [
      'Wood Lake',
      'Cedar Avenue corridor',
      'Penn Avenue',
      'Lyndale',
      'East Richfield',
      'Nicollet Commons',
    ],
    highlights: [
      'Quick reach between Minneapolis, MSP and the Crosstown',
      'Coverage along Cedar, Penn and Lyndale',
      'Sealed, discreet delivery to homes and apartments',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis in Richfield?',
        answer:
          'Yes, we deliver throughout Richfield — Wood Lake, the Cedar and Penn corridors, Lyndale and east toward the river. Enter your address at checkout to confirm you are inside our delivery zone before paying.',
      },
      {
        question: 'How fast can I get a delivery in Richfield?',
        answer:
          'Richfield sits close to our routes, so orders typically arrive within 60–90 minutes, seven days a week. You can track the order live and will get a text when your driver is nearly there.',
      },
      {
        question: 'What are the delivery fees and minimum in Richfield?',
        answer:
          'Delivery is a flat $5 and free once your order reaches $75; the minimum order is $30. Pay with cash or debit on arrival and have a valid 21+ ID ready at the door.',
      },
    ],
  },
  {
    slug: 'st-louis-park',
    name: 'St. Louis Park',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in St. Louis Park, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in St. Louis Park, MN — The West End to Excelsior & Grand. Lab-tested products in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Discreet, same-day cannabis delivery throughout St. Louis Park — from The West End to Texa-Tonka — in about 60–90 minutes.',
    intro: [
      'DankDeals delivers across St. Louis Park, from the restaurants and theaters of The West End to the walkable blocks of Excelsior & Grand and the quiet streets around Texa-Tonka and Bronx Park. Order online and a discreet driver brings lab-tested cannabis right to your apartment or front step.',
      'Hugging the western edge of Minneapolis, St. Louis Park is a quick hop for our drivers, whether you are near Knollwood, Elmwood or the Wooddale corridor. Everything arrives sealed and smell-proof, with a fast 21+ ID check at the door — no trip down Highway 100 required.',
    ],
    neighborhoods: [
      'The West End',
      'Excelsior & Grand',
      'Texa-Tonka',
      'Bronx Park',
      'Elmwood',
      'Knollwood',
      'Wooddale',
    ],
    highlights: [
      'Coverage from The West End to Knollwood',
      'Fast hop from Minneapolis along the Highway 100 corridor',
      'Discreet delivery to apartments, townhomes and houses',
    ],
    faqs: [
      {
        question: 'Do you deliver to all of St. Louis Park?',
        answer:
          'Yes — we cover St. Louis Park from The West End and Excelsior & Grand to Texa-Tonka, Elmwood and Knollwood. Confirm your address at checkout to make sure it falls inside our delivery zone.',
      },
      {
        question: 'How quickly does delivery arrive in St. Louis Park?',
        answer:
          'Because we border the city, most St. Louis Park orders arrive within 60–90 minutes, seven days a week. You will get a text as the driver approaches and can track the order from start to finish.',
      },
      {
        question: 'How do I pay in St. Louis Park?',
        answer:
          'Pay the driver with cash or debit on arrival. Delivery is a flat $5, free over $75, with a $30 order minimum. A valid 21+ ID is required at the door for every delivery.',
      },
    ],
  },
  {
    slug: 'roseville',
    name: 'Roseville',
    county: 'Ramsey County',
    metaTitle: 'Cannabis Delivery in Roseville, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Roseville, MN — near Rosedale and Har Mar. Lab-tested flower, edibles & vapes in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Same-day cannabis delivery across Roseville — right between the two cities — usually in about 60–90 minutes.',
    intro: [
      'Sitting squarely between Minneapolis and St. Paul, Roseville is central to everything we do — and easy for our drivers to reach. DankDeals delivers lab-tested flower, edibles and vapes from the Rosedale and Har Mar shopping areas to the homes around Lake McCarrons and Central Park.',
      'Whether you are off Snelling, near County Road B or tucked into a quiet cul-de-sac on the north end, you order online and we bring it to you discreetly. Each delivery is sealed and smell-proof, with a quick ID check at the door so every order stays 21+ and fully compliant.',
    ],
    neighborhoods: [
      'Rosedale',
      'Har Mar',
      'Lake McCarrons',
      'Central Park',
      'Snelling Avenue corridor',
      'County Road B',
    ],
    highlights: [
      'Central location between Minneapolis and St. Paul',
      'Coverage near Rosedale, Har Mar and Lake McCarrons',
      'Sealed, discreet, on-time delivery',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis in Roseville?',
        answer:
          'Yes. We serve Roseville citywide, from the Rosedale and Har Mar areas to Lake McCarrons, Central Park and the Snelling corridor. Enter your address at checkout to confirm coverage before you pay.',
      },
      {
        question: 'How long does Roseville delivery take?',
        answer:
          'Roseville’s central spot between the two downtowns keeps it close to our routes, so orders usually arrive within 60–90 minutes, seven days a week, with live tracking the whole way.',
      },
      {
        question: 'What is the delivery fee and minimum in Roseville?',
        answer:
          'Delivery is a flat $5 and free once you reach $75; the order minimum is $30. Pay with cash or debit on arrival and have a valid 21+ ID ready for the driver.',
      },
    ],
  },
  {
    slug: 'maplewood',
    name: 'Maplewood',
    county: 'Ramsey County',
    metaTitle: 'Cannabis Delivery in Maplewood, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Maplewood, MN — near Maplewood Mall. Lab-tested products to your door in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Discreet, same-day cannabis delivery throughout Maplewood — from the Mall area to Battle Creek — in about 60–90 minutes.',
    intro: [
      'DankDeals delivers across Maplewood, from the shopping district around Maplewood Mall on the north end to the lakes and parks of Battle Creek and Beaver Lake to the south. Order lab-tested cannabis online and a discreet driver routes to your home or apartment — no trip across town required.',
      'Wrapping along the east side of St. Paul, Maplewood is an easy reach for our drivers via White Bear Avenue and the surrounding corridors. Everything arrives sealed and smell-proof, and we check a valid 21+ ID at the door so each delivery stays simple, private and compliant.',
    ],
    neighborhoods: [
      'Maplewood Mall area',
      'Battle Creek',
      'Beaver Lake',
      'Gladstone',
      'White Bear Avenue corridor',
      'Hillside',
    ],
    highlights: [
      'Coverage from Maplewood Mall to Battle Creek',
      'Easy routing along White Bear Avenue',
      'Discreet, sealed delivery to your door',
    ],
    faqs: [
      {
        question: 'Do you deliver to Maplewood?',
        answer:
          'Yes — we cover Maplewood from the Maplewood Mall area and Gladstone to Battle Creek and Beaver Lake. Add your address at checkout to confirm you are inside our delivery zone before paying.',
      },
      {
        question: 'How fast is delivery in Maplewood?',
        answer:
          'Most Maplewood orders arrive within 60–90 minutes, seven days a week. You will receive a text when your driver is close and can follow the order live from confirmed to delivered.',
      },
      {
        question: 'How do I pay for delivery in Maplewood?',
        answer:
          'Pay the driver with cash or debit on arrival. Delivery is a flat $5, free over $75, with a $30 minimum order. A valid 21+ ID is required at the door for every delivery.',
      },
    ],
  },
  {
    slug: 'eagan',
    name: 'Eagan',
    county: 'Dakota County',
    metaTitle: 'Cannabis Delivery in Eagan, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Eagan, MN — Cedar Grove to Lebanon Hills. Lab-tested flower, edibles & vapes in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Same-day cannabis delivery across Eagan — from Cedar Grove to Lebanon Hills — typically in 60–90 minutes.',
    intro: [
      'Just south of the river, Eagan is a hub of parks, offices and quiet neighborhoods — and DankDeals delivers to all of them. From the shops of Cedar Grove and Central Park Commons to the wooded streets near Lebanon Hills, order lab-tested cannabis online and a discreet driver brings it to your door.',
      'Eagan’s tidy grid off Pilot Knob, Yankee Doodle and Diffley makes for quick, predictable routes. Whether you are working from a Thomson Reuters-area office or relaxing at home near Blackhawk Lake, your sealed, smell-proof order arrives on your schedule with a fast 21+ ID check at the door.',
    ],
    neighborhoods: [
      'Cedar Grove',
      'Central Park Commons',
      'Lebanon Hills',
      'Pilot Knob',
      'Diffley',
      'Blackhawk',
    ],
    highlights: [
      'Coverage from Cedar Grove to Lebanon Hills',
      'Predictable routing off Pilot Knob and Yankee Doodle',
      'Discreet, sealed, on-time delivery',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis in Eagan?',
        answer:
          'Yes, we deliver throughout Eagan — Cedar Grove, Central Park Commons, the Pilot Knob and Diffley corridors, and the neighborhoods near Lebanon Hills. Confirm your address at checkout before you pay.',
      },
      {
        question: 'How long does delivery take in Eagan?',
        answer:
          'Most Eagan orders arrive within 60–90 minutes, seven days a week. You will get a text as your driver approaches, plus live tracking from order confirmation through out for delivery.',
      },
      {
        question: 'What is the order minimum in Eagan?',
        answer:
          'The minimum order is $30. Delivery is a flat $5 and free on orders of $75 or more. Pay with cash or debit on arrival and have a valid 21+ ID ready at the door.',
      },
    ],
  },
  {
    slug: 'plymouth',
    name: 'Plymouth',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Plymouth, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Plymouth, MN — Medicine Lake to City Center. Lab-tested products to your door in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Discreet, same-day cannabis delivery across Plymouth — from Medicine Lake to City Center — in about 60–90 minutes.',
    intro: [
      'One of the largest cities in the metro, Plymouth spreads from Medicine Lake and Bass Lake out to the rolling neighborhoods near Hampton Hills and Greenwood. DankDeals covers the whole footprint, delivering lab-tested flower, edibles and vapes from Plymouth City Center to quiet streets off County Road 6 and Vicksburg.',
      'With so much ground between the lakes and the parks, having delivery come to you saves a real trip. Order online and a discreet driver routes to your home, sealed and smell-proof, with a quick 21+ ID check at the door — no need to drive into Minneapolis or hunt down a dispensary.',
    ],
    neighborhoods: [
      'Plymouth City Center',
      'Medicine Lake',
      'Bass Lake',
      'Parkers Lake',
      'Greenwood',
      'Hampton Hills',
    ],
    highlights: [
      'Full coverage of one of the metro’s largest cities',
      'Delivery from City Center to the lake neighborhoods',
      'Saves the drive into Minneapolis',
    ],
    faqs: [
      {
        question: 'Do you deliver across all of Plymouth?',
        answer:
          'Yes. Plymouth is large, and we cover it from City Center and Parkers Lake to Medicine Lake, Bass Lake and the Hampton Hills area. Enter your address at checkout to confirm it is inside our zone.',
      },
      {
        question: 'How fast is cannabis delivery in Plymouth?',
        answer:
          'Most Plymouth orders arrive within 60–90 minutes, seven days a week. You can track your order in real time and will receive a text when the driver is getting close to your door.',
      },
      {
        question: 'What payment methods work in Plymouth?',
        answer:
          'Cash or debit paid to the driver on arrival. Delivery is a flat $5, free over $75, with a $30 minimum order. Please have a valid 21+ ID ready when the driver reaches you.',
      },
    ],
  },
  {
    slug: 'minnetonka',
    name: 'Minnetonka',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Minnetonka, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Minnetonka, MN — Ridgedale to Glen Lake. Lab-tested flower, edibles & vapes in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Same-day cannabis delivery throughout Minnetonka — from Ridgedale to Glen Lake — usually in 60–90 minutes.',
    intro: [
      'Green, wooded and spread along the eastern shore of its namesake lake, Minnetonka is built for delivery — and DankDeals reaches all of it. From the shops around Ridgedale to the neighborhoods of Glen Lake, Opus and Minnetonka Mills, order lab-tested cannabis online and a discreet driver brings it to your door.',
      'Winding roads and big lots can make errands a chore here, so we take the trip off your plate. Whether you are near Greenbrier, off Minnetonka Boulevard or tucked into the trees by Purgatory Creek, your sealed, smell-proof order arrives on schedule with a fast 21+ ID check at the door.',
    ],
    neighborhoods: [
      'Ridgedale',
      'Glen Lake',
      'Opus',
      'Minnetonka Mills',
      'Greenbrier',
      'Minnetonka Boulevard corridor',
    ],
    highlights: [
      'Coverage from Ridgedale to Glen Lake and Opus',
      'Delivery to wooded, spread-out neighborhoods',
      'Takes the errand off your plate',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis in Minnetonka?',
        answer:
          'Yes — we cover Minnetonka from Ridgedale and Minnetonka Mills to Glen Lake, Opus and Greenbrier. Confirm your specific address at checkout to make sure you are inside our delivery zone before paying.',
      },
      {
        question: 'How long does delivery take in Minnetonka?',
        answer:
          'Most Minnetonka orders arrive within 60–90 minutes, seven days a week. You will get a text as the driver approaches, with live tracking from confirmation through out for delivery.',
      },
      {
        question: 'What are the fees and minimum in Minnetonka?',
        answer:
          'Delivery is a flat $5 and free on orders of $75 or more, with a $30 minimum. Pay the driver with cash or debit on arrival, and have a valid 21+ ID ready at the door.',
      },
    ],
  },
  {
    slug: 'brooklyn-park',
    name: 'Brooklyn Park',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Brooklyn Park, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Brooklyn Park, MN. Lab-tested flower, edibles & vapes to your door in 60–90 minutes, 7 days a week. Cash or debit on arrival. 21+.',
    heroSubtitle:
      'Discreet, same-day cannabis delivery across Brooklyn Park — from Edinburgh to Oak Grove — in about 60–90 minutes.',
    intro: [
      'Up in the northwest metro, Brooklyn Park stretches from the Edinburgh USA area down toward the river and out along the Zane and West Broadway corridors. DankDeals delivers to all of it, bringing lab-tested flower, edibles and vapes to homes and apartments without the drive south into the city.',
      'One of the region’s largest and most diverse cities, Brooklyn Park is easy for our drivers to navigate via Highway 252 and 610. Order online from Oak Grove, the Village Creek area or anywhere in between, and your sealed, smell-proof delivery arrives on time with a quick 21+ ID check at the door.',
    ],
    neighborhoods: [
      'Edinburgh',
      'Oak Grove',
      'Village Creek',
      'Zane Avenue corridor',
      'West Broadway',
      'Brookdale area',
    ],
    highlights: [
      'Northwest-metro coverage from Edinburgh to the river',
      'Quick routing via Highway 252 and 610',
      'No drive south into the city',
    ],
    faqs: [
      {
        question: 'Do you deliver to Brooklyn Park?',
        answer:
          'Yes, we deliver throughout Brooklyn Park — the Edinburgh area, Oak Grove, Village Creek and the Zane and West Broadway corridors. Enter your address at checkout to confirm coverage before paying.',
      },
      {
        question: 'How fast is delivery in Brooklyn Park?',
        answer:
          'Most Brooklyn Park orders arrive within 60–90 minutes, seven days a week. You will get a text when the driver is close and can track the order live from confirmed through out for delivery.',
      },
      {
        question: 'How do I pay in Brooklyn Park?',
        answer:
          'Pay the driver with cash or debit on arrival. Delivery is a flat $5, free over $75, with a $30 minimum order. A valid 21+ ID is required at the door for every delivery.',
      },
    ],
  },
  {
    slug: 'eden-prairie',
    name: 'Eden Prairie',
    county: 'Hennepin County',
    metaTitle: 'Cannabis Delivery in Eden Prairie, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Eden Prairie, MN — Eden Prairie Center to Purgatory Creek. Lab-tested products in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Same-day cannabis delivery across Eden Prairie — from the Major Center to Round Lake — usually in 60–90 minutes.',
    intro: [
      'Out at the southwest edge of Hennepin County, Eden Prairie blends busy retail with parks, lakes and trails. DankDeals delivers across all of it — from the Eden Prairie Center and Major Center area to the neighborhoods around Round Lake, Purgatory Creek and the Flying Cloud corridor — bringing lab-tested cannabis right to your door.',
      'With so much green space between destinations, delivery just makes sense here. Order online and a discreet driver routes to your home along Prairie Center Drive or off Mitchell Road, sealed and smell-proof, with a fast 21+ ID check at the door — no trip into the city required.',
    ],
    neighborhoods: [
      'Eden Prairie Center',
      'Major Center',
      'Round Lake',
      'Purgatory Creek',
      'Flying Cloud',
      'Prairie Center Drive corridor',
    ],
    highlights: [
      'Southwest-metro coverage from the Major Center to Round Lake',
      'Routing along Prairie Center Drive and Mitchell Road',
      'Discreet, sealed delivery to your door',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis in Eden Prairie?',
        answer:
          'Yes — we cover Eden Prairie from the Eden Prairie Center and Major Center to Round Lake, Purgatory Creek and the Flying Cloud corridor. Confirm your address at checkout to ensure it is inside our zone.',
      },
      {
        question: 'How long does delivery take in Eden Prairie?',
        answer:
          'Most Eden Prairie orders arrive within 60–90 minutes, seven days a week. You will receive a text as the driver gets close and can follow the order live from confirmed to delivered.',
      },
      {
        question: 'What is the delivery fee and minimum in Eden Prairie?',
        answer:
          'Delivery is a flat $5 and free once you reach $75; the minimum order is $30. Pay with cash or debit on arrival, and have a valid 21+ ID ready when the driver arrives.',
      },
    ],
  },
  {
    slug: 'burnsville',
    name: 'Burnsville',
    county: 'Dakota County',
    metaTitle: 'Cannabis Delivery in Burnsville, MN | DankDeals',
    metaDescription:
      'Licensed cannabis delivery in Burnsville, MN — Heart of the City to Burnsville Center. Lab-tested products in 60–90 minutes, 7 days a week. Cash or debit. 21+.',
    heroSubtitle:
      'Discreet, same-day cannabis delivery across Burnsville — from the Heart of the City to Buck Hill — in about 60–90 minutes.',
    intro: [
      'Just across the Minnesota River, Burnsville anchors the south metro with the Heart of the City district, the Burnsville Center shopping area and the slopes of Buck Hill. DankDeals delivers throughout the city, bringing lab-tested flower, edibles and vapes to homes and apartments along the Nicollet and County Road 42 corridors.',
      'Burnsville is an easy, quick run for our drivers coming down 35W and 35E. Whether you are near the river valley, off Cliff Road or close to Crystal Lake, you order online and we bring it to you — sealed, smell-proof and on schedule, with a fast 21+ ID check at the door.',
    ],
    neighborhoods: [
      'Heart of the City',
      'Burnsville Center',
      'Buck Hill',
      'Nicollet Avenue corridor',
      'County Road 42',
      'Crystal Lake',
    ],
    highlights: [
      'South-metro coverage from the river valley to Crystal Lake',
      'Quick run down 35W and 35E',
      'Discreet, sealed, on-time delivery',
    ],
    faqs: [
      {
        question: 'Do you deliver cannabis in Burnsville?',
        answer:
          'Yes, we deliver throughout Burnsville — the Heart of the City, the Burnsville Center area, and the Nicollet and County Road 42 corridors. Enter your address at checkout to confirm you are inside our delivery zone.',
      },
      {
        question: 'How fast is delivery in Burnsville?',
        answer:
          'Most Burnsville orders arrive within 60–90 minutes, seven days a week. You will get a text as your driver approaches and can track the order live from confirmation through out for delivery.',
      },
      {
        question: 'How does payment work in Burnsville?',
        answer:
          'Pay the driver with cash or debit on arrival. Delivery is a flat $5, free on orders of $75 or more, with a $30 minimum. A valid 21+ ID is required at the door for every order.',
      },
    ],
  },
];

const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));
const SLUG_BY_NAME = new Map(CITIES.map((c) => [c.name.toLowerCase(), c.slug]));

export function getCity(slug: string): City | undefined {
  return CITY_BY_SLUG.get(slug);
}

/** Resolve a StoreConfig zone name (e.g. "St. Paul") to a city-page slug, if one exists. */
export function slugForCityName(name: string): string | undefined {
  return SLUG_BY_NAME.get(name.toLowerCase());
}

export const CITY_SLUGS: string[] = CITIES.map((c) => c.slug);

/** Names of every served city, for areaServed / structured-data lists. */
export const CITY_NAMES: string[] = CITIES.map((c) => c.name);

export function cityPath(slug: string): string {
  return `/delivery/${slug}`;
}

/** Sibling cities for internal linking, excluding the current one. */
export function otherCities(slug: string): City[] {
  return CITIES.filter((c) => c.slug !== slug);
}
