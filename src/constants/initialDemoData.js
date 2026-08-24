/**
 * Rich Initial Demo Data Generator for Brush Up Salon
 * Generates realistic, fully populated seed data across all 7 partner salons:
 * - Authentic customer reviews with 4 & 5-star ratings and detailed comments
 * - Structured bookings (Today's, Upcoming, Pending Approval, GCash verification, Historical completed)
 * - Curated announcements and customer accounts
 */

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
};

export const INITIAL_CUSTOMERS = [
  { uid: 'rogie123', name: 'Rogie P. Bacanto', user: 'rogie123', role: 'customer', email: 'rogiebacanto2002@gmail.com', phone: '0912-345-6789' },
  { uid: 'samantham', name: 'Samantha Miller', user: 'samantham', role: 'customer', email: 'samantha.m@gmail.com', phone: '0928-112-3456' },
  { uid: 'chloew', name: 'Chloe Watson', user: 'chloew', role: 'customer', email: 'chloe.watson@gmail.com', phone: '0917-889-2234' },
  { uid: 'beasantos', name: 'Bea Santos', user: 'beasantos', role: 'customer', email: 'bea.santos@gmail.com', phone: '0939-556-7812' },
  { uid: 'kristiner', name: 'Kristine Ramos', user: 'kristiner', role: 'customer', email: 'kristine.r@gmail.com', phone: '0995-443-1290' },
  { uid: 'markanthony', name: 'Mark Anthony Cruz', user: 'markanthony', role: 'customer', email: 'mark.cruz@gmail.com', phone: '0919-672-8819' },
  { uid: 'angelicac', name: 'Angelica Nicole Reyes', user: 'angelicac', role: 'customer', email: 'angelica.reyes@gmail.com', phone: '0945-881-9920' },
  { uid: 'jasmineg', name: 'Jasmine Gomez', user: 'jasmineg', role: 'customer', email: 'jasmine.gomez@gmail.com', phone: '0977-334-1188' }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: '✨ Welcome to the Brush Up Luxury Salon Network',
    content: 'All 7 branches in Midsayap are now linked with real-time booking, instant scheduling, and direct GCash payment confirmation.',
    type: 'info',
    createdAt: getRelativeDate(-5)
  },
  {
    id: 2,
    title: '💳 GCash QR Digital Payment Verification Live',
    content: 'Salons can now upload their official branch GCash QR codes in Settings. Customers enjoy 0% transfer fee direct bookings.',
    type: 'promo',
    createdAt: getRelativeDate(-3)
  },
  {
    id: 3,
    title: '🕒 Extended Weekend Operating Hours',
    content: 'Selected partner branches are extending their weekend hours until 9:00 PM to accommodate evening bookings and spa sessions.',
    type: 'info',
    createdAt: getRelativeDate(-1)
  }
];

export const generateInitialBookings = () => {
  const today = getRelativeDate(0);
  const yesterday = getRelativeDate(-1);
  const twoDaysAgo = getRelativeDate(-2);
  const threeDaysAgo = getRelativeDate(-3);
  const fourDaysAgo = getRelativeDate(-4);
  const fiveDaysAgo = getRelativeDate(-5);
  const oneWeekAgo = getRelativeDate(-7);
  const twoWeeksAgo = getRelativeDate(-14);
  const threeWeeksAgo = getRelativeDate(-21);
  const tomorrow = getRelativeDate(1);
  const inTwoDays = getRelativeDate(2);

  let idCounter = 1780000000000;

  return [
    // ══════════════════════════════════════════════════════
    // 1. ELEGANT SALON (id: 'elegant')
    // ══════════════════════════════════════════════════════
    // Historical Completed with Reviews
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'rogie123',
      customer: 'Rogie P. Bacanto',
      contact: '0912-345-6789',
      service: 'Loreal X-Tenso',
      servicePrice: 4500,
      servicePriceLabel: 'PHP 4,500',
      paidAmount: 4500,
      staff: 'Maria',
      date: twoDaysAgo,
      time: '10:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-9928172018',
      review: 5,
      reviewComment: 'Outstanding service! Maria took her time with the Loreal X-Tenso rebonding. My hair is incredibly sleek and shiny without any damage.'
    },
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'samantham',
      customer: 'Samantha Miller',
      contact: '0928-112-3456',
      service: 'Keratin Treatment',
      servicePrice: 2500,
      servicePriceLabel: 'PHP 2,500',
      paidAmount: 2500,
      staff: 'Joy',
      date: fiveDaysAgo,
      time: '14:30',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Joy is a miracle worker! The keratin treatment revived my bleached hair completely. Very relaxing ambiance and friendly staff.'
    },
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'chloew',
      customer: 'Chloe Watson',
      contact: '0917-889-2234',
      service: 'Foot Spa',
      servicePrice: 400,
      servicePriceLabel: 'PHP 400',
      paidAmount: 400,
      staff: 'Anna',
      date: oneWeekAgo,
      time: '13:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-8819203912',
      review: 5,
      reviewComment: 'Super calming foot spa with Anna. Very clean equipment and sterile tools. Will definitely book again next week!'
    },
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'beasantos',
      customer: 'Bea Santos',
      contact: '0939-556-7812',
      service: 'Highlights (Women)',
      servicePrice: 1500,
      servicePriceLabel: 'PHP 1,500',
      paidAmount: 1500,
      staff: 'Joy',
      date: twoWeeksAgo,
      time: '11:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 4,
      reviewComment: 'Loved the honey blonde highlights! Subtle and elegant just the way I requested.'
    },
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'kristiner',
      customer: 'Kristine Ramos',
      contact: '0995-443-1290',
      service: 'Matrix Opti-Straight',
      servicePrice: 3000,
      servicePriceLabel: 'PHP 3,000',
      paidAmount: 3000,
      staff: 'Maria',
      date: threeWeeksAgo,
      time: '15:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-7712398410',
      review: 5,
      reviewComment: 'Best salon experience in Midsayap. Very professional consultation before starting the treatment.'
    },
    // Today's Bookings for Elegant Salon
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'angelicac',
      customer: 'Angelica Nicole Reyes',
      contact: '0945-881-9920',
      service: 'Brazilian Treatment',
      servicePrice: 1500,
      servicePriceLabel: 'PHP 1,500',
      paidAmount: 0,
      staff: 'Maria',
      date: today,
      time: '10:30',
      status: 'Approved',
      paymentMethod: 'GCash',
      gcashRef: 'GC-1192837465'
    },
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'jasmineg',
      customer: 'Jasmine Gomez',
      contact: '0977-334-1188',
      service: 'Hair Cut',
      servicePrice: 150,
      servicePriceLabel: 'PHP 150',
      paidAmount: 0,
      staff: 'Joy',
      date: today,
      time: '14:00',
      status: 'Pending',
      paymentMethod: 'Cash'
    },
    // Upcoming Bookings for Elegant Salon
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'samantham',
      customer: 'Samantha Miller',
      contact: '0928-112-3456',
      service: 'Nail Gel (Hand)',
      servicePrice: 500,
      servicePriceLabel: 'PHP 500',
      paidAmount: 0,
      staff: 'Anna',
      date: tomorrow,
      time: '11:00',
      status: 'Approved',
      paymentMethod: 'Cash'
    },
    {
      id: ++idCounter,
      salonId: 'elegant',
      userId: 'rogie123',
      customer: 'Rogie P. Bacanto',
      contact: '0912-345-6789',
      service: 'Hair Blow-Dry',
      servicePrice: 100,
      servicePriceLabel: 'PHP 100',
      paidAmount: 0,
      staff: 'Maria',
      date: inTwoDays,
      time: '16:00',
      status: 'Pending',
      paymentMethod: 'Cash'
    },

    // ══════════════════════════════════════════════════════
    // 2. KAREN GREEN (id: 'karen-green')
    // ══════════════════════════════════════════════════════
    // Historical Completed with Reviews
    {
      id: ++idCounter,
      salonId: 'karen-green',
      userId: 'samantham',
      customer: 'Samantha Miller',
      contact: '0928-112-3456',
      service: 'Organic Footspa',
      servicePrice: 350,
      servicePriceLabel: 'PHP 350',
      paidAmount: 350,
      staff: 'Liza',
      date: yesterday,
      time: '15:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'The organic scrub and massage from Liza was absolute bliss. Felt so rejuvenated after a long work week!'
    },
    {
      id: ++idCounter,
      salonId: 'karen-green',
      userId: 'kristiner',
      customer: 'Kristine Ramos',
      contact: '0995-443-1290',
      service: 'Eyelash Extensions',
      servicePrice: 1200,
      servicePriceLabel: 'PHP 1,200',
      paidAmount: 1200,
      staff: 'Beth',
      date: threeDaysAgo,
      time: '13:30',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-5544332211',
      review: 5,
      reviewComment: 'Natural looking and very light on the eyes. Beth has gentle hands and great attention to detail.'
    },
    {
      id: ++idCounter,
      salonId: 'karen-green',
      userId: 'chloew',
      customer: 'Chloe Watson',
      contact: '0917-889-2234',
      service: 'Haircut Women w/ Shampoo & Conditioner',
      servicePrice: 280,
      servicePriceLabel: 'PHP 280',
      paidAmount: 280,
      staff: 'Karen',
      date: oneWeekAgo,
      time: '11:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Karen gave me the perfect face-framing layers! Super happy with the volume and texture.'
    },
    {
      id: ++idCounter,
      salonId: 'karen-green',
      userId: 'markanthony',
      customer: 'Mark Anthony Cruz',
      contact: '0919-672-8819',
      service: 'Whole Body Massage',
      servicePrice: 350,
      servicePriceLabel: 'PHP 350',
      paidAmount: 350,
      staff: 'Liza',
      date: twoWeeksAgo,
      time: '16:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-3322114455',
      review: 4,
      reviewComment: 'Great pressure and very therapeutic massage. Clean and serene room setup.'
    },
    // Today & Upcoming for Karen Green
    {
      id: ++idCounter,
      salonId: 'karen-green',
      userId: 'beasantos',
      customer: 'Bea Santos',
      contact: '0939-556-7812',
      service: 'Nail Gel Polish',
      servicePrice: 1500,
      servicePriceLabel: 'PHP 1,500',
      paidAmount: 0,
      staff: 'Beth',
      date: today,
      time: '11:30',
      status: 'Approved',
      paymentMethod: 'GCash',
      gcashRef: 'GC-4455667788'
    },
    {
      id: ++idCounter,
      salonId: 'karen-green',
      userId: 'angelicac',
      customer: 'Angelica Nicole Reyes',
      contact: '0945-881-9920',
      service: 'Full Leg Wax',
      servicePrice: 600,
      servicePriceLabel: 'PHP 600',
      paidAmount: 0,
      staff: 'Liza',
      date: tomorrow,
      time: '14:00',
      status: 'Pending',
      paymentMethod: 'Cash'
    },

    // ══════════════════════════════════════════════════════
    // 3. PRETTY ASPECTS (id: 'pretty-aspects')
    // ══════════════════════════════════════════════════════
    // Historical Completed with Reviews
    {
      id: ++idCounter,
      salonId: 'pretty-aspects',
      userId: 'angelicac',
      customer: 'Angelica Nicole Reyes',
      contact: '0945-881-9920',
      service: 'Brazilian Botox',
      servicePrice: 1999,
      servicePriceLabel: 'PHP 1,999',
      paidAmount: 1999,
      staff: 'Arlene',
      date: yesterday,
      time: '11:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-6677889900',
      review: 5,
      reviewComment: 'My frizzy hair is completely tamed! The Brazilian Botox at Pretty Aspects is super worth the price.'
    },
    {
      id: ++idCounter,
      salonId: 'pretty-aspects',
      userId: 'jasmineg',
      customer: 'Jasmine Gomez',
      contact: '0977-334-1188',
      service: 'Milk Rebond',
      servicePrice: 1499,
      servicePriceLabel: 'PHP 1,499',
      paidAmount: 1499,
      staff: 'Pretty',
      date: fourDaysAgo,
      time: '10:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Hands down the best rebonding in Poblacion. Pretty is so gentle and polite.'
    },
    {
      id: ++idCounter,
      salonId: 'pretty-aspects',
      userId: 'beasantos',
      customer: 'Bea Santos',
      contact: '0939-556-7812',
      service: 'Balayage',
      servicePrice: 2499,
      servicePriceLabel: 'PHP 2,499',
      paidAmount: 2499,
      staff: 'Mae',
      date: oneWeekAgo,
      time: '14:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-1234567890',
      review: 5,
      reviewComment: 'Flawless color blending! Mae did an ash brown balayage that looks like a high-end salon in Manila.'
    },
    // Today & Upcoming for Pretty Aspects
    {
      id: ++idCounter,
      salonId: 'pretty-aspects',
      userId: 'rogie123',
      customer: 'Rogie P. Bacanto',
      contact: '0912-345-6789',
      service: 'Haircut - Men',
      servicePrice: 100,
      servicePriceLabel: 'PHP 100',
      paidAmount: 0,
      staff: 'Pretty',
      date: today,
      time: '15:30',
      status: 'Pending',
      paymentMethod: 'Cash'
    },
    {
      id: ++idCounter,
      salonId: 'pretty-aspects',
      userId: 'kristiner',
      customer: 'Kristine Ramos',
      contact: '0995-443-1290',
      service: 'Kerabond',
      servicePrice: 1499,
      servicePriceLabel: 'PHP 1,499',
      paidAmount: 0,
      staff: 'Arlene',
      date: inTwoDays,
      time: '10:00',
      status: 'Approved',
      paymentMethod: 'GCash',
      gcashRef: 'GC-9988776655'
    },

    // ══════════════════════════════════════════════════════
    // 4. SIR JAMES SALON (id: 'sir-james')
    // ══════════════════════════════════════════════════════
    {
      id: ++idCounter,
      salonId: 'sir-james',
      userId: 'markanthony',
      customer: 'Mark Anthony Cruz',
      contact: '0919-672-8819',
      service: 'Hot Towel Shave',
      servicePrice: 350,
      servicePriceLabel: 'PHP 350',
      paidAmount: 350,
      staff: 'James',
      date: twoDaysAgo,
      time: '17:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Classic gentlemen grooming experience. Hot towel and straight razor shave was precise and refreshing.'
    },
    {
      id: ++idCounter,
      salonId: 'sir-james',
      userId: 'rogie123',
      customer: 'Rogie P. Bacanto',
      contact: '0912-345-6789',
      service: "Men's Haircut",
      servicePrice: 200,
      servicePriceLabel: 'PHP 200',
      paidAmount: 200,
      staff: 'Mark',
      date: fiveDaysAgo,
      time: '16:30',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-1122334455',
      review: 5,
      reviewComment: 'Clean skin fade and beard trim by Mark. Best men barber shop in Midsayap without a doubt.'
    },
    {
      id: ++idCounter,
      salonId: 'sir-james',
      userId: 'markanthony',
      customer: 'Mark Anthony Cruz',
      contact: '0919-672-8819',
      service: 'Hair Color',
      servicePrice: 1200,
      servicePriceLabel: 'PHP 1,200',
      paidAmount: 1200,
      staff: 'Rico',
      date: twoWeeksAgo,
      time: '14:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 4,
      reviewComment: 'Great gray coverage and styling. Highly skilled team.'
    },
    // Today & Upcoming for Sir James
    {
      id: ++idCounter,
      salonId: 'sir-james',
      userId: 'rogie123',
      customer: 'Rogie P. Bacanto',
      contact: '0912-345-6789',
      service: 'Beard Trim',
      servicePrice: 150,
      servicePriceLabel: 'PHP 150',
      paidAmount: 0,
      staff: 'James',
      date: today,
      time: '16:00',
      status: 'Approved',
      paymentMethod: 'Cash'
    },

    // ══════════════════════════════════════════════════════
    // 5. PALMA BEAUTY SALON (id: 'palma')
    // ══════════════════════════════════════════════════════
    {
      id: ++idCounter,
      salonId: 'palma',
      userId: 'chloew',
      customer: 'Chloe Watson',
      contact: '0917-889-2234',
      service: 'Rebond with Brazilian',
      servicePrice: 1300,
      servicePriceLabel: 'PHP 1,300',
      paidAmount: 1300,
      staff: 'Palma',
      date: threeDaysAgo,
      time: '10:30',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-9900112233',
      review: 5,
      reviewComment: 'Unbeatable value! Rebond with Brazilian package left my hair soft and bouncy. Palma is very accommodating.'
    },
    {
      id: ++idCounter,
      salonId: 'palma',
      userId: 'jasmineg',
      customer: 'Jasmine Gomez',
      contact: '0977-334-1188',
      service: 'Foot Spa with Pedicure',
      servicePrice: 400,
      servicePriceLabel: 'PHP 400',
      paidAmount: 400,
      staff: 'Grace',
      date: oneWeekAgo,
      time: '13:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Grace did a thorough and gentle foot spa. Clean nail polish application with no smudges.'
    },
    {
      id: ++idCounter,
      salonId: 'palma',
      userId: 'samantham',
      customer: 'Samantha Miller',
      contact: '0928-112-3456',
      service: 'Hair Cellophane',
      servicePrice: 399,
      servicePriceLabel: 'PHP 399',
      paidAmount: 399,
      staff: 'Lyn',
      date: twoWeeksAgo,
      time: '15:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 4,
      reviewComment: 'Glossy finish that lasted weeks. Will recommend to friends!'
    },
    // Today & Upcoming for Palma
    {
      id: ++idCounter,
      salonId: 'palma',
      userId: 'beasantos',
      customer: 'Bea Santos',
      contact: '0939-556-7812',
      service: 'Short Hair Color',
      servicePrice: 300,
      servicePriceLabel: 'PHP 300',
      paidAmount: 0,
      staff: 'Palma',
      date: today,
      time: '13:00',
      status: 'Pending',
      paymentMethod: 'Cash'
    },

    // ══════════════════════════════════════════════════════
    // 6. BABIE & CO SALON AND SPA (id: 'babie-co')
    // ══════════════════════════════════════════════════════
    {
      id: ++idCounter,
      salonId: 'babie-co',
      userId: 'kristiner',
      customer: 'Kristine Ramos',
      contact: '0995-443-1290',
      service: 'Footspa + Mani + Pedi + Massage Package',
      servicePrice: 600,
      servicePriceLabel: 'PHP 600',
      paidAmount: 600,
      staff: 'Babie',
      date: yesterday,
      time: '14:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-7766554433',
      review: 5,
      reviewComment: 'The complete pampering package! Babie and Jen took care of everything from nails to back massage. 10/10!'
    },
    {
      id: ++idCounter,
      salonId: 'babie-co',
      userId: 'angelicac',
      customer: 'Angelica Nicole Reyes',
      contact: '0945-881-9920',
      service: 'Loreal Botox Treatment',
      servicePrice: 3000,
      servicePriceLabel: 'PHP 3,000',
      paidAmount: 3000,
      staff: 'Rose',
      date: fiveDaysAgo,
      time: '11:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-5566778899',
      review: 5,
      reviewComment: 'My dry hair is silky smooth again. High quality products and exceptional hospitality.'
    },
    {
      id: ++idCounter,
      salonId: 'babie-co',
      userId: 'samantham',
      customer: 'Samantha Miller',
      contact: '0928-112-3456',
      service: 'Gel',
      servicePrice: 500,
      servicePriceLabel: 'PHP 500',
      paidAmount: 500,
      staff: 'Jen',
      date: twoWeeksAgo,
      time: '16:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Jen is so talented with nail art! Gel nails lasted over 3 weeks without chipping.'
    },
    // Today for Babie & Co
    {
      id: ++idCounter,
      salonId: 'babie-co',
      userId: 'chloew',
      customer: 'Chloe Watson',
      contact: '0917-889-2234',
      service: 'Pedicure',
      servicePrice: 150,
      servicePriceLabel: 'PHP 150',
      paidAmount: 0,
      staff: 'Jen',
      date: today,
      time: '15:00',
      status: 'Approved',
      paymentMethod: 'Cash'
    },

    // ══════════════════════════════════════════════════════
    // 7. CUT & CURL BEAUTY BAR (id: 'cut-curl')
    // ══════════════════════════════════════════════════════
    {
      id: ++idCounter,
      salonId: 'cut-curl',
      userId: 'beasantos',
      customer: 'Bea Santos',
      contact: '0939-556-7812',
      service: 'Digital Perm',
      servicePrice: 2500,
      servicePriceLabel: 'PHP 2,500',
      paidAmount: 2500,
      staff: 'Curl',
      date: twoDaysAgo,
      time: '10:00',
      status: 'Completed',
      paymentMethod: 'GCash',
      gcashRef: 'GC-3344556677',
      review: 5,
      reviewComment: 'Obsessed with my beach wave curls! Curl really understands how to style without causing dryness.'
    },
    {
      id: ++idCounter,
      salonId: 'cut-curl',
      userId: 'kristiner',
      customer: 'Kristine Ramos',
      contact: '0995-443-1290',
      service: 'Brazilian Blowout',
      servicePrice: 3000,
      servicePriceLabel: 'PHP 3,000',
      paidAmount: 3000,
      staff: 'Diane',
      date: fourDaysAgo,
      time: '13:30',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Diane did a wonderful job. My hair smells amazing and feels so soft. 100% recommended!'
    },
    {
      id: ++idCounter,
      salonId: 'cut-curl',
      userId: 'jasmineg',
      customer: 'Jasmine Gomez',
      contact: '0977-334-1188',
      service: 'Haircut (Women)',
      servicePrice: 250,
      servicePriceLabel: 'PHP 250',
      paidAmount: 250,
      staff: 'Tina',
      date: oneWeekAgo,
      time: '16:00',
      status: 'Completed',
      paymentMethod: 'Cash',
      review: 5,
      reviewComment: 'Tina listened carefully to what length I wanted and delivered exactly that.'
    },
    // Today & Upcoming for Cut & Curl
    {
      id: ++idCounter,
      salonId: 'cut-curl',
      userId: 'markanthony',
      customer: 'Mark Anthony Cruz',
      contact: '0919-672-8819',
      service: 'Haircut (Men)',
      servicePrice: 180,
      servicePriceLabel: 'PHP 180',
      paidAmount: 0,
      staff: 'Curl',
      date: today,
      time: '11:00',
      status: 'Approved',
      paymentMethod: 'Cash'
    },
    {
      id: ++idCounter,
      salonId: 'cut-curl',
      userId: 'samantham',
      customer: 'Samantha Miller',
      contact: '0928-112-3456',
      service: 'Keratin Treatment',
      servicePrice: 2200,
      servicePriceLabel: 'PHP 2,200',
      paidAmount: 0,
      staff: 'Diane',
      date: tomorrow,
      time: '14:30',
      status: 'Pending',
      paymentMethod: 'GCash',
      gcashRef: 'GC-2233445566'
    }
  ];
};
