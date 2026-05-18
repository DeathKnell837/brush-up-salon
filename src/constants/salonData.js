export const SALON_DATA = [
  {
    id: 'elegant',
    name: 'Elegant Salon',
    description: 'Timeless beauty and sophisticated styling.',
    image: '/images/elegant.png',
    address: 'Midsayap, Cotabato',
    contact: '0951-204-2xxx',
    hours: '9:00 AM - 8:00 PM',
    promotions: [],
    staff: [
      { id: 1779114386506, name: 'Maria', role: 'Stylist', services: [] },
      { id: 1779114387348, name: 'Joy', role: 'Stylist', services: [] },
      { id: 1779114386946, name: 'Anna', role: 'Stylist', services: [] }
    ],
    services: [
      // Hair Rebonding
      { name: 'Loreal X-Tenso', price: 'PHP 4,500', category: 'Hair Rebonding' },
      { name: 'Loreal X-Tenso w/ Cellophane', price: 'PHP 5,500', category: 'Hair Rebonding' },
      { name: 'Matrix Opti-Straight', price: 'PHP 3,000', category: 'Hair Rebonding' },
      { name: 'Matrix Opti-Straight w/ Cellophane', price: 'PHP 4,000', category: 'Hair Rebonding' },
      { name: 'Regular Rebond', price: 'PHP 1,500', category: 'Hair Rebonding' },
      { name: 'Regular Rebond w/ Cellophane', price: 'PHP 2,500', category: 'Hair Rebonding' },
      // Hair Color
      { name: 'Hair Color - Matrix (per tube)', price: 'PHP 1,500', category: 'Hair Color' },
      { name: 'Hair Color - Vivant/Bremode (Men)', price: 'PHP 500', category: 'Hair Color' },
      { name: 'Hair Color - OMG/Klick (Men)', price: 'PHP 800', category: 'Hair Color' },
      { name: 'Hair Color - Vivant/Bremode (Women)', price: 'PHP 700', category: 'Hair Color' },
      { name: 'Hair Color - OMG/Klick (Women)', price: 'PHP 1,500', category: 'Hair Color' },
      { name: 'Highlights (Women)', price: 'PHP 1,500', category: 'Hair Color' },
      // Hair Treatment / Cellophane
      { name: 'Brazilian Treatment', price: 'PHP 1,500', category: 'Hair Treatment' },
      { name: 'Keratin Treatment', price: 'PHP 2,500', category: 'Hair Treatment' },
      { name: 'Hair Cellophane', price: 'PHP 1,000', category: 'Hair Treatment' },
      { name: 'Semi Delino Power Dose (per vial)', price: 'PHP 1,500', category: 'Hair Treatment' },
      // Other Services
      { name: 'Hair Cut', price: 'PHP 150', category: 'Other Services' },
      { name: 'Hair Iron', price: 'PHP 200', category: 'Other Services' },
      { name: 'Hair Blow-Dry', price: 'PHP 100', category: 'Other Services' },
      { name: 'Manicure', price: 'PHP 130', category: 'Other Services' },
      { name: 'Pedicure', price: 'PHP 500', category: 'Other Services' },
      { name: 'Nail Gel (Hand)', price: 'PHP 500', category: 'Other Services' },
      { name: 'Foot Spa', price: 'PHP 400', category: 'Other Services' },
      { name: 'Eyebrow Threading', price: 'PHP 150', category: 'Other Services' },
      { name: 'Underarm Threading', price: 'PHP 150', category: 'Other Services' },
      { name: 'Permanent Perm (Whole)', price: 'PHP 1,500', category: 'Other Services' },
      { name: 'Permanent Perm (Half)', price: 'PHP 1,000', category: 'Other Services' },
      { name: 'Hair & Make-Up', price: 'PHP 500', category: 'Other Services' }
    ]
  },
  {
    id: 'karen-green',
    name: 'Karen Green',
    description: 'Full-service beauty salon for all occasions.',
    image: '/images/karen-green.png',
    address: 'Midsayap, Cotabato',
    contact: '+63 923 456 7890',
    hours: '8:00 AM - 8:00 PM',
    promotions: [],
    staff: [
      { id: 1779114387217, name: 'Karen', role: 'Stylist', services: [] },
      { id: 1779114386973, name: 'Liza', role: 'Stylist', services: [] },
      { id: 1779114386718, name: 'Beth', role: 'Stylist', services: [] }
    ],
    services: [
      // Regular Salon Services
      { name: 'Haircut Men w/ Shampoo & Conditioner', price: 'PHP 100', category: 'Regular Salon Services' },
      { name: 'Haircut Women w/ Shampoo & Conditioner', price: 'PHP 280', category: 'Regular Salon Services' },
      { name: 'Haircut Women w/ Blower', price: 'PHP 200', category: 'Regular Salon Services' },
      { name: 'Haircut Women w/ Blower & Conditioner', price: 'PHP 150', category: 'Regular Salon Services' },
      { name: 'Dry Set (Temporary Curls)', price: 'PHP 250', category: 'Regular Salon Services' },
      { name: 'Shampoo w/ Blow Dry', price: 'PHP 250', category: 'Regular Salon Services' },
      { name: 'Shampoo w/ Blow Dry + Iron', price: 'PHP 150', category: 'Regular Salon Services' },
      { name: 'Hair-Do', price: 'PHP 200', category: 'Regular Salon Services' },
      // Massage
      { name: 'Head Massage', price: 'PHP 150', category: 'Massage' },
      { name: 'Hand Massage', price: 'PHP 150', category: 'Massage' },
      { name: 'Back Massage', price: 'PHP 150', category: 'Massage' },
      { name: 'Leg Massage', price: 'PHP 150', category: 'Massage' },
      { name: 'Whole Body Massage', price: 'PHP 350', category: 'Massage' },
      // Waxing & Threading
      { name: 'Eyebrow Threading', price: 'PHP 150', category: 'Waxing & Threading' },
      { name: 'Under Wax', price: 'PHP 250', category: 'Waxing & Threading' },
      { name: 'Half Leg Wax', price: 'PHP 400', category: 'Waxing & Threading' },
      { name: 'Full Leg Wax', price: 'PHP 600', category: 'Waxing & Threading' },
      // Nails & Foot Care
      { name: 'Regular Footspa', price: 'PHP 300', category: 'Nails & Foot Care' },
      { name: 'Organic Footspa', price: 'PHP 350', category: 'Nails & Foot Care' },
      { name: 'Handspa', price: 'PHP 200', category: 'Nails & Foot Care' },
      { name: 'Manicure / Cleaning', price: 'PHP 100', category: 'Nails & Foot Care' },
      { name: 'Pedicure / Cleaning', price: 'PHP 120', category: 'Nails & Foot Care' },
      { name: 'Nail Gel Polish', price: 'PHP 1,500', category: 'Nails & Foot Care' },
      { name: 'Branded Nail Polish', price: 'PHP 400', category: 'Nails & Foot Care' },
      // Extensions
      { name: 'Nail Extensions', price: 'PHP 1,000', category: 'Extensions' },
      { name: 'Eyelash Extensions', price: 'PHP 1,200', category: 'Extensions' },
      { name: 'Hair Extension (Short)', price: 'PHP 4,000', category: 'Extensions' },
      { name: 'Hair Extension (Medium)', price: 'PHP 5,000', category: 'Extensions' },
      { name: 'Hair Extension (Long)', price: 'PHP 6,000', category: 'Extensions' },
      // Make-Up
      { name: 'Light Make-Up w/ Hair-Do', price: 'PHP 500', category: 'Make-Up' },
      { name: 'Heavy Make-Up w/ Hair-Do', price: 'PHP 700', category: 'Make-Up' },
      { name: 'Bridal Make-Up w/ Hair-Do', price: 'PHP 1,000', category: 'Make-Up' },
      { name: 'Make-Up for Children', price: 'PHP 400', category: 'Make-Up' },
      // Smoothness & Shine Treatment
      { name: 'Hot Oil', price: 'PHP 500', category: 'Smoothness & Shine Treatment', pricingTable: { short: 500, medium: 800 } },
      { name: 'Hair Spa', price: 'PHP 700', category: 'Smoothness & Shine Treatment', pricingTable: { short: 700, medium: 1700, long: 2000 } },
      { name: 'Detoxification', price: 'PHP 1,500', category: 'Smoothness & Shine Treatment', pricingTable: { short: 1500, medium: 1500, long: 1700 } },
      { name: 'Brazilian Blowout', price: 'PHP 1,500', category: 'Smoothness & Shine Treatment', pricingTable: { short: 1500, medium: 2000, long: 2200 } },
      { name: 'Keratin Blowout', price: 'PHP 1,800', category: 'Smoothness & Shine Treatment' },
      // Vials & Power Treatment
      { name: 'Alfa Fare', price: 'PHP 800', category: 'Vials & Power Treatment' },
      { name: 'Loreal Vial', price: 'PHP 1,200', category: 'Vials & Power Treatment' },
      { name: 'Hair Reborn', price: 'PHP 1,000', category: 'Vials & Power Treatment' },
      { name: 'Hair Gloss', price: 'PHP 1,000', category: 'Vials & Power Treatment' },
      // Permanent Color
      { name: 'Permanent Color - Men', price: 'PHP 400', category: 'Permanent Color' },
      { name: 'Permanent Color - Wash Out', price: 'PHP 1,000', category: 'Permanent Color', pricingTable: { short: 1000, medium: 2000 } },
      { name: 'Permanent Color - Basic', price: 'PHP 850', category: 'Permanent Color', pricingTable: { short: 850, medium: 1300 } },
      { name: 'Permanent Color - Hortazeza', price: 'PHP 1,000', category: 'Permanent Color', pricingTable: { short: 1000, medium: 1800 } },
      { name: 'Permanent Color - Organic', price: 'PHP 1,000', category: 'Permanent Color', pricingTable: { short: 1000, medium: 1200, long: 1800 } },
      { name: 'Permanent Color - Loreal', price: 'PHP 1,200', category: 'Permanent Color', pricingTable: { short: 1200, medium: 1500, long: 2500 } },
      // Hair Cellophane
      { name: 'Hair Cellophane - Basic', price: 'PHP 700', category: 'Hair Cellophane', pricingTable: { short: 700, medium: 1000, long: 1200 } },
      { name: 'Hair Cellophane - Hortazeza', price: 'PHP 1,000', category: 'Hair Cellophane', pricingTable: { short: 1000, medium: 1500, long: 1500 } },
      { name: 'Hair Cellophane - Shine Moist', price: 'PHP 1,000', category: 'Hair Cellophane', pricingTable: { short: 1000, medium: 1700 } }
    ]
  },
  {
    id: 'pretty-aspects',
    name: 'Pretty Aspects',
    description: 'Where every angle is your best angle.',
    image: '/images/pretty-aspects.png',
    address: 'Poblacion 8, Midsayap, Cotabato',
    contact: '0938-1199713 / 0938-7057764',
    hours: '9:00 AM - 9:00 PM',
    promotions: ['Free Haircut with all rebond services!'],
    staff: [
      { id: 1779114386643, name: 'Pretty', role: 'Stylist', services: [] },
      { id: 1779114387195, name: 'Arlene', role: 'Stylist', services: [] },
      { id: 1779114387352, name: 'Mae', role: 'Stylist', services: [] }
    ],
    services: [
      // Hair Rebond
      { name: 'Hair Rebond', price: 'PHP 1,499', category: 'Hair Rebond' },
      { name: 'Milk Rebond', price: 'PHP 1,499', category: 'Hair Rebond' },
      { name: 'Organic Rebond', price: 'PHP 1,499', category: 'Hair Rebond' },
      { name: 'Kerabond', price: 'PHP 1,499', category: 'Hair Rebond' },
      { name: 'Ahglow Rebond', price: 'PHP 2,499', category: 'Hair Rebond' },
      { name: 'Hortaleza Rebond', price: 'PHP 2,999', category: 'Hair Rebond' },
      { name: 'Matrix Rebond', price: 'PHP 3,499', category: 'Hair Rebond' },
      { name: 'Loreal Rebond', price: 'PHP 4,499', category: 'Hair Rebond' },
      // Hair Treatment
      { name: 'Brazilian Botox', price: 'PHP 1,999', category: 'Hair Treatment' },
      { name: 'Keratin Brazilian', price: 'PHP 1,499', category: 'Hair Treatment' },
      { name: 'Cellophane', price: 'PHP 699', category: 'Hair Treatment' },
      { name: 'Hot Oil', price: 'PHP 499', category: 'Hair Treatment' },
      // Hair Color
      { name: 'Hair Color - Men', price: 'PHP 499', category: 'Hair Color' },
      { name: 'Hair Color - Women', price: 'PHP 999', category: 'Hair Color' },
      { name: 'Balayage', price: 'PHP 2,499', category: 'Hair Color' },
      // Haircut
      { name: 'Haircut - Men', price: 'PHP 100', category: 'Haircut' },
      { name: 'Haircut - Women', price: 'PHP 150', category: 'Haircut' }
    ]
  },
  {
    id: 'sir-james',
    name: 'Sir James Salon',
    description: 'Premium grooming for the modern gentleman.',
    image: '/images/sir-james.png',
    address: 'Midsayap, Cotabato',
    contact: '+63 945 678 9012',
    hours: '8:00 AM - 10:00 PM',
    promotions: [],
    staff: [
      { id: 1779114386473, name: 'James', role: 'Stylist', services: [] },
      { id: 1779114386750, name: 'Mark', role: 'Stylist', services: [] },
      { id: 1779114386728, name: 'Rico', role: 'Stylist', services: [] }
    ],
    services: [
      { name: 'Men\'s Haircut', price: 'PHP 200', category: 'Haircut' },
      { name: 'Beard Trim', price: 'PHP 150', category: 'Grooming' },
      { name: 'Hot Towel Shave', price: 'PHP 350', category: 'Grooming' },
      { name: 'Hair Color', price: 'PHP 1,200', category: 'Hair Color' }
    ]
  },
  {
    id: 'palma',
    name: 'Palma Beauty Salon',
    description: 'For men and women — quality service at great prices.',
    image: '/images/palma.png',
    address: 'Midsayap, Cotabato',
    contact: '+63 956 789 0123',
    hours: '8:00 AM - 7:00 PM',
    promotions: [],
    staff: [
      { id: 1779114387056, name: 'Palma', role: 'Stylist', services: [] },
      { id: 1779114386456, name: 'Grace', role: 'Stylist', services: [] },
      { id: 1779114387295, name: 'Lyn', role: 'Stylist', services: [] }
    ],
    services: [
      // Rebonding
      { name: 'Rebond', price: 'PHP 800', category: 'Rebonding' },
      { name: 'Rebond with Hot Oil', price: 'PHP 999', category: 'Rebonding' },
      { name: 'Rebond with Brazilian', price: 'PHP 1,300', category: 'Rebonding' },
      { name: 'Rebond Color with Brazilian', price: 'PHP 1,800', category: 'Rebonding' },
      { name: 'Botox Brazilian', price: 'PHP 800', category: 'Rebonding' },
      { name: 'Rebond Matrix', price: 'PHP 1,500', category: 'Rebonding' },
      { name: 'Rebond L\'Oreal', price: 'PHP 1,800', category: 'Rebonding' },
      // Hair Services
      { name: 'Hair Cellophane', price: 'PHP 399', category: 'Hair Services' },
      { name: 'Long Hair Color', price: 'PHP 500', category: 'Hair Services' },
      { name: 'Short Hair Color', price: 'PHP 300', category: 'Hair Services' },
      { name: 'Curl with Hot Oil', price: 'PHP 800', category: 'Hair Services' },
      { name: 'Curl', price: 'PHP 500', category: 'Hair Services' },
      { name: 'Balayage', price: 'PHP 1,500', category: 'Hair Services' },
      { name: 'Hot Oil', price: 'PHP 300', category: 'Hair Services' },
      // Beauty Services
      { name: 'Make Up with Hair', price: 'PHP 500', category: 'Beauty Services' },
      { name: 'Make Up', price: 'PHP 300', category: 'Beauty Services' },
      { name: 'Gel', price: 'PHP 350', category: 'Beauty Services' },
      // Nail & Foot
      { name: 'Foot Spa with Pedicure', price: 'PHP 400', category: 'Nail & Foot Care' },
      { name: 'Manicure', price: 'PHP 120', category: 'Nail & Foot Care' },
      { name: 'Pedicure', price: 'PHP 120', category: 'Nail & Foot Care' },
      // Haircut
      { name: 'Hair Cut (Men & Women)', price: 'PHP 100', category: 'Haircut' }
    ]
  },
  {
    id: 'babie-co',
    name: 'Babie & Co Salon And Spa',
    description: 'Full-service beauty and relaxation retreat.',
    image: '/images/babie-co.png',
    address: 'Midsayap, Cotabato',
    contact: '+63 967 890 1234',
    hours: '9:00 AM - 9:00 PM',
    promotions: [],
    staff: [
      { id: 1779114386778, name: 'Babie', role: 'Stylist', services: [] },
      { id: 1779114387044, name: 'Jen', role: 'Stylist', services: [] },
      { id: 1779114386571, name: 'Rose', role: 'Stylist', services: [] }
    ],
    services: [
      // Nail Services
      { name: 'Pedicure', price: 'PHP 150', category: 'Nail Services' },
      { name: 'Manicure', price: 'PHP 150', category: 'Nail Services' },
      { name: 'Gel', price: 'PHP 500', category: 'Nail Services' },
      { name: 'Korean-Gel', price: 'PHP 250', category: 'Nail Services' },
      { name: 'Footspa + Mani + Pedi + Massage Package', price: 'PHP 600', category: 'Nail Services' },
      // Waxing
      { name: 'Legs Waxing', price: 'PHP 500', category: 'Waxing' },
      { name: 'Underarms Waxing', price: 'PHP 250', category: 'Waxing' },
      // Eyebrow
      { name: 'Eyebrow Shaping', price: 'PHP 100', category: 'Eyebrow' },
      { name: 'Threading', price: 'PHP 150', category: 'Eyebrow' },
      // Rebonding Package (variable pricing by hair length)
      { name: 'Regular Rebond', price: 'PHP 1,500', category: 'Rebonding Package', pricingTable: { neck: 1500, bra: 2000, waist: 2500 } },
      { name: 'Treatment', price: 'PHP 1,500', category: 'Rebonding Package', pricingTable: { neck: 1500, bra: 2000, waist: 2500 } },
      { name: 'Haircut (Rebond)', price: 'PHP 1,500', category: 'Rebonding Package', pricingTable: { neck: 1500, bra: 2000, waist: 2500 } },
      // Loreal Rebonding
      { name: 'Loreal Botox Treatment', price: 'PHP 3,000', category: 'Loreal Rebonding', pricingTable: { neck: 3000, bra: 3500, waist: 4000 } },
      { name: 'Loreal Keratin Treatment', price: 'PHP 3,000', category: 'Loreal Rebonding', pricingTable: { neck: 3000, bra: 3500, waist: 4000 } }
    ]
  },
  {
    id: 'cut-curl',
    name: 'Cut & Curl Beauty Bar',
    description: 'Expert cuts and perfect curls every time.',
    image: '/images/cut-curl.png',
    address: 'Midsayap, Cotabato',
    contact: '+63 978 901 2345',
    hours: '8:00 AM - 8:00 PM',
    promotions: [],
    staff: [
      { id: 1779114387210, name: 'Curl', role: 'Stylist', services: [] },
      { id: 1779114386795, name: 'Diane', role: 'Stylist', services: [] },
      { id: 1779114387239, name: 'Tina', role: 'Stylist', services: [] }
    ],
    services: [
      { name: 'Haircut (Women)', price: 'PHP 250', category: 'Haircut' },
      { name: 'Haircut (Men)', price: 'PHP 180', category: 'Haircut' },
      { name: 'Kids Haircut', price: 'PHP 120', category: 'Haircut' },
      { name: 'Perming', price: 'PHP 2,000', category: 'Styling' },
      { name: 'Digital Perm', price: 'PHP 2,500', category: 'Styling' },
      { name: 'Hair Rebond', price: 'PHP 1,800', category: 'Rebonding' },
      { name: 'Brazilian Blowout', price: 'PHP 3,000', category: 'Treatment' },
      { name: 'Blowout Styling', price: 'PHP 500', category: 'Styling' },
      { name: 'Hair Color', price: 'PHP 1,500', category: 'Hair Color' },
      { name: 'Balayage / Highlights', price: 'PHP 2,800', category: 'Hair Color' },
      { name: 'Keratin Treatment', price: 'PHP 2,200', category: 'Treatment' },
      { name: 'Updo / Event Styling', price: 'PHP 1,000', category: 'Styling' }
    ]
  }
];
