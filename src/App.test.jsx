// Configure React 18 act environment and Node TextEncoder polyfill for jspdf
global.IS_REACT_ACT_ENVIRONMENT = true;
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('react-markdown', () => function MockMarkdown(props) {
  return <div>{props.children}</div>;
});

jest.mock('jspdf', () => ({
  jsPDF: jest.fn(() => ({
    text: jest.fn(),
    save: jest.fn(),
    addPage: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn()
  }))
}));

jest.mock('jspdf-autotable', () => jest.fn());

jest.mock('./firebase', () => ({
  auth: { currentUser: null },
  db: {},
  storage: {},
  googleProvider: {},
  facebookProvider: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: jest.fn(() => Promise.resolve({}))
}));

jest.mock('firebase/auth', () => {
  const actual = jest.requireActual('firebase/auth');
  return {
    ...actual,
    signInWithEmailAndPassword: jest.fn().mockRejectedValue(new Error('Firebase Auth offline / simulated network error')),
    createUserWithEmailAndPassword: jest.fn().mockRejectedValue(new Error('Firebase Auth offline / simulated network error')),
    signInWithPopup: jest.fn().mockRejectedValue(new Error('Firebase Auth offline'))
  };
});

jest.mock('./utils/firebaseSync', () => ({
  initFirebaseSync: jest.fn()
}));

jest.mock('./utils/storage', () => {
  const actual = jest.requireActual('./utils/storage');
  return {
    ...actual,
    seedAdminAccounts: jest.fn().mockResolvedValue()
  };
});

import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import BrushUpLogo from './components/BrushUpLogo';
import DemoShowcase from './components/DemoShowcase';
import CustomerDashboard from './components/CustomerDashboard';
import ReviewModal from './components/ReviewModal';
import AuthPage from './components/AuthPage';
import { SALON_DATA } from './constants/salonData';
import { getBookings, setBookings, DEFAULT_ADMINS, findAdminAccount } from './utils/storage';

describe('Brush Up Salon — Haute Pink Redesign & Demo Showcase', () => {
  let container;
  let root;

  beforeEach(() => {
    window.scrollTo = jest.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
    localStorage.setItem('luxurySeedVersion', 'v17_rich_seed_data_reviews_and_bookings');
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  test('renders DemoShowcase with Haute Pink branding and 7 studios', () => {
    act(() => {
      root.render(<DemoShowcase salons={SALON_DATA} />);
    });

    // Check Brand & Hero Title
    expect(container.textContent).toContain('Haute Beauty in');
    expect(container.textContent).toContain('Full Bloom');
    expect(container.textContent).toContain('Haute Salon Collective');

    // Check Featured Sweet Deals
    expect(container.textContent).toContain('Sweet Deals & Promotions');
    expect(container.textContent).toContain('Loreal X-Tenso Silk Rebond');

    // Check Sagitarius Weekly Beauty Planner
    expect(container.textContent).toContain('Weekly Beauty & Glow Planner');
    expect(container.textContent).toContain('Sagitarius Cycle Concept');

    // Check Studios
    expect(container.textContent).toContain('Our 7 Flagship Branches');
    expect(container.textContent).toContain('Elegant Salon');
    expect(container.textContent).toContain('Karen Green');
    expect(container.textContent).toContain('Pretty Aspects');
    expect(container.textContent).toContain('Sir James Salon');
    expect(container.textContent).toContain('Cut & Curl Beauty Bar');
    expect(container.textContent).toContain('Babie & Co Salon And Spa');
    expect(container.textContent).toContain('Palma Beauty Salon');

    // Check Interactive Booking Simulator
    expect(container.textContent).toContain('Test Drive Our Smart Booking Engine');
    expect(container.textContent).toContain('Confirm & Submit Demo Booking');
  });

  test('theme toggle switches theme between Blossom Light and BlossomX Cyber', () => {
    const handleToggle = jest.fn();
    act(() => {
      root.render(<DemoShowcase salons={SALON_DATA} theme="blossom-light" onToggleTheme={handleToggle} />);
    });

    const themeBtn = container.querySelector('.demo-theme-toggle-btn');
    expect(themeBtn).not.toBeNull();
    act(() => {
      themeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  test('submitting simulator form invokes direct booking callback and displays confirmation card', () => {
    const handleDirectBooking = jest.fn();
    act(() => {
      root.render(
        <DemoShowcase 
          salons={SALON_DATA} 
          onSubmitDirectBooking={handleDirectBooking} 
        />
      );
    });

    const submitBtn = container.querySelector('.sim-submit-btn');
    expect(submitBtn).not.toBeNull();
    act(() => {
      submitBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleDirectBooking).toHaveBeenCalledTimes(1);

    // Confirmation card should now be rendered inside the simulator
    expect(container.textContent).toContain('Demo Appointment Successfully Scheduled!');
    expect(container.textContent).toContain('Pending Salon Approval');
    expect(container.textContent).toContain('View Live in VIP Customer Portal');
    expect(container.textContent).toContain('Approve in Salon Admin Portal');
  });

  test('filters deals when clicking category filter pills', () => {
    act(() => {
      root.render(<DemoShowcase salons={SALON_DATA} />);
    });

    const rebondPill = Array.from(container.querySelectorAll('.deals-filter-pill'))
      .find(btn => btn.textContent.includes('Hair Rebonding'));
    expect(rebondPill).not.toBeNull();
    act(() => {
      rebondPill.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).toContain('Loreal X-Tenso Silk Rebond');
  });

  test('filters studios when clicking studio filter pills', () => {
    act(() => {
      root.render(<DemoShowcase salons={SALON_DATA} />);
    });

    const spaPill = Array.from(container.querySelectorAll('.deals-filter-pill'))
      .find(btn => btn.textContent.includes('Spa & Nails'));
    expect(spaPill).not.toBeNull();
    act(() => {
      spaPill.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).toContain('Karen Green');
  });

  test('interacts with Sagitarius weekly cycle planner days', () => {
    act(() => {
      root.render(<DemoShowcase salons={SALON_DATA} />);
    });

    const fridayPill = Array.from(container.querySelectorAll('.cycle-day-pill'))
      .find(btn => btn.textContent.includes('Fri'));
    expect(fridayPill).not.toBeNull();

    act(() => {
      fridayPill.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Friday Focus');
    expect(container.textContent).toContain('Cut & Curl Beauty Bar');
    expect(container.textContent).toContain('PHP 2,800');
  });

  test('clicking Quick Book on a deal preselects the treatment in the simulator', () => {
    act(() => {
      root.render(<DemoShowcase salons={SALON_DATA} />);
    });

    const quickBookBtn = container.querySelectorAll('.deal-book-btn')[0];
    expect(quickBookBtn).not.toBeNull();

    act(() => {
      quickBookBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const treatmentSelect = container.querySelector('.sim-field select[value="Loreal X-Tenso Silk Rebond"]') ||
      Array.from(container.querySelectorAll('.sim-field select')).find(s => s.value === 'Loreal X-Tenso Silk Rebond');
    expect(treatmentSelect).not.toBeNull();
  });

  test('demo bookings created with userId samantham are accessible in CustomerDashboard', () => {
    // Seed a booking like simulator does
    const bookings = getBookings();
    bookings.push({
      id: 99999999999,
      salonId: 'elegant',
      userId: 'samantham',
      customer: 'Samantha Miller',
      contact: '0928-112-3456',
      service: 'Loreal X-Tenso Silk Rebond',
      servicePrice: 4500,
      servicePriceLabel: 'PHP 4,500',
      staff: 'Maria',
      date: '2026-10-15',
      time: '14:00',
      status: 'Pending',
      paymentMethod: 'GCash'
    });
    setBookings(bookings);

    const demoCustomer = {
      uid: 'samantham',
      name: 'Samantha Miller',
      user: 'samantham',
      role: 'customer',
      email: 'samantha.m@gmail.com',
      phone: '0928-112-3456'
    };

    act(() => {
      root.render(
        <CustomerDashboard 
          currentUser={demoCustomer} 
          salons={SALON_DATA} 
        />
      );
    });

    // Check that Samantha Miller's dashboard loaded
    expect(container.textContent).toContain('Miller');
    
    // Switch to bookings tab
    const myBookingsTab = Array.from(container.querySelectorAll('.tab-btn'))
      .find(btn => btn.textContent.includes('My Bookings'));
    expect(myBookingsTab).not.toBeNull();

    act(() => {
      myBookingsTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Loreal X-Tenso Silk Rebond');
  });

  test('BrushUpLogo strictly renders "Brush Up" and "SALON & BEAUTY"', () => {
    act(() => {
      root.render(<BrushUpLogo size="default" />);
    });

    expect(container.textContent).toContain('Brush Up');
    expect(container.textContent).toContain('SALON & BEAUTY');
    expect(container.textContent).not.toContain('HAUTE SALON');
  });

  test('CustomerDashboard preserves all exact capstone hero text, Book Now, 4 stats, and section headings', () => {
    act(() => {
      root.render(
        <CustomerDashboard 
          salons={SALON_DATA} 
          onBackToDemo={jest.fn()} 
        />
      );
    });

    // 1. Hero headline with Perfect emphasized
    expect(container.textContent).toContain('Discover Your Perfect Salon Experience');
    
    // 2. Hero subtitle
    expect(container.textContent).toContain('Book Now');

    // 3. 4 Hero Stats (7 Salons, 147 Services, 4.8★ Rating, 0m Wait Time)
    expect(container.textContent).toContain('7');
    expect(container.textContent).toContain('Salons');
    expect(container.textContent).toContain('147');
    expect(container.textContent).toContain('Services');
    expect(container.textContent).toContain('4.8★');
    expect(container.textContent).toContain('Rating');
    expect(container.textContent).toContain('0m');
    expect(container.textContent).toContain('Wait Time');

    // 4. Section headings
    expect(container.textContent).toContain('Featured Salons');
    expect(container.textContent).toContain('All Partner Salons');

    // 5. Unobtrusive preview demo pill in navbar
    expect(container.textContent).toContain('🌸 Preview Demo Showcase');

    // 6. Search placeholder
    const searchInput = container.querySelector('.search-inner-input');
    expect(searchInput).not.toBeNull();
    expect(searchInput.getAttribute('placeholder')).toBe('Search salons, services...');
  });

  test('CustomerDashboard renders Customer Stats Bar (Total Bookings, Completed, Pending, Total Spent)', () => {
    const bookings = getBookings();
    bookings.push({
      id: 111,
      salonId: 'elegant',
      userId: 'testcustomer',
      customer: 'Test User',
      service: 'Silk Straight Rebond',
      servicePrice: 2500,
      status: 'Completed',
      date: '2026-10-01',
      time: '10:00'
    });
    bookings.push({
      id: 222,
      salonId: 'karen-green',
      userId: 'testcustomer',
      customer: 'Test User',
      service: 'Rose Foot Spa',
      servicePrice: 650,
      status: 'Pending',
      date: '2026-10-20',
      time: '13:00'
    });
    setBookings(bookings);

    const testUser = {
      uid: 'testcustomer',
      user: 'testcustomer',
      name: 'Elena Gilbert',
      role: 'customer'
    };

    act(() => {
      root.render(
        <CustomerDashboard 
          currentUser={testUser} 
          salons={SALON_DATA} 
        />
      );
    });

    // Switch to bookings tab
    const myBookingsTab = Array.from(container.querySelectorAll('.tab-btn'))
      .find(btn => btn.textContent.includes('My Bookings'));
    expect(myBookingsTab).not.toBeNull();

    act(() => {
      myBookingsTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Check customer stats bar labels and values
    expect(container.textContent).toContain('Total Bookings');
    expect(container.textContent).toContain('Completed');
    expect(container.textContent).toContain('Pending');
    expect(container.textContent).toContain('Total Spent');
    expect(container.textContent).toContain('₱2,500');
    expect(container.textContent).toContain('Favorite Salon');
    expect(container.textContent).toContain('Availed Services');
  });

  test('CustomerDashboard toggles between Grid View and Map View correctly', () => {
    act(() => {
      root.render(<CustomerDashboard salons={SALON_DATA} />);
    });

    const mapBtn = Array.from(container.querySelectorAll('.view-mode-btn'))
      .find(btn => btn.textContent.includes('Map View'));
    expect(mapBtn).not.toBeNull();

    act(() => {
      mapBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Salons in Midsayap, Cotabato');

    const gridBtn = Array.from(container.querySelectorAll('.view-mode-btn'))
      .find(btn => btn.textContent.includes('Grid'));
    expect(gridBtn).not.toBeNull();

    act(() => {
      gridBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Featured Salons');
  });

  test('App renders CustomerDashboard by default as primary entry point', async () => {
    await act(async () => {
      root.render(<App />);
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Default unauthenticated view must be CustomerDashboard with capstone headline
    expect(container.textContent).toContain('Discover Your Perfect Salon Experience');
    expect(container.textContent).toContain('Book Now');
    expect(container.textContent).toContain('Featured Salons');
    expect(container.textContent).toContain('All Partner Salons');

    // Click Preview Demo Showcase pill in navbar to switch to Demo
    const demoPillBtn = container.querySelector('.demo-return-pill-btn');
    expect(demoPillBtn).not.toBeNull();

    act(() => {
      demoPillBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Now in DemoShowcase
    expect(container.textContent).toContain('Haute Beauty in');
    expect(container.textContent).toContain('Sweet Deals & Promotions');

    // Click Live Dashboard button in DemoShowcase to return
    const returnBtn = Array.from(container.querySelectorAll('.demo-pill-btn'))
      .find(btn => btn.textContent.includes('Live Dashboard'));
    expect(returnBtn).not.toBeNull();

    act(() => {
      returnBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Back in CustomerDashboard
    expect(container.textContent).toContain('Discover Your Perfect Salon Experience');
  });

  test('CustomerDashboard opens GCashPaymentModal with payment details and upload area', () => {
    const bookings = getBookings();
    bookings.push({
      id: 777,
      salonId: 'elegant',
      userId: 'testcustomer',
      customer: 'Elena Gilbert',
      service: 'Silk Straight Rebond',
      servicePrice: 2500,
      status: 'Approved',
      paymentMethod: 'GCash',
      approvedAt: new Date().toISOString(),
      date: '2026-10-25',
      time: '14:00'
    });
    setBookings(bookings);

    const testUser = {
      uid: 'testcustomer',
      user: 'testcustomer',
      name: 'Elena Gilbert',
      role: 'customer'
    };

    act(() => {
      root.render(
        <CustomerDashboard 
          currentUser={testUser} 
          salons={SALON_DATA} 
        />
      );
    });

    // Go to My Bookings tab
    const myBookingsTab = Array.from(container.querySelectorAll('.tab-btn'))
      .find(btn => btn.textContent.includes('My Bookings'));
    expect(myBookingsTab).not.toBeNull();

    act(() => {
      myBookingsTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Find and click "Pay via GCash" button
    const payBtn = Array.from(container.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('Pay via GCash'));
    expect(payBtn).not.toBeNull();

    act(() => {
      payBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // GCash payment modal should be rendered
    expect(container.textContent).toContain('Payment Details');
    expect(container.textContent).toContain('GCash');
    expect(container.textContent).toContain('Total Amount to Pay');
    expect(container.textContent).toContain('₱2,500');
    expect(container.textContent).toContain('Drag & Drop Receipt');
  });

  test('ReviewModal renders rating stars, comment textarea, and submit button', () => {
    const mockSubmit = jest.fn();
    const mockClose = jest.fn();

    act(() => {
      root.render(
        <ReviewModal
          booking={{ id: 999, service: 'Silk Straight Rebond' }}
          salonName="Elegant Salon"
          onClose={mockClose}
          onSubmit={mockSubmit}
        />
      );
    });

    expect(container.textContent).toContain('Rate Your Experience');
    expect(container.textContent).toContain('Elegant Salon');
    expect(container.textContent).toContain('Silk Straight Rebond');
    expect(container.textContent).toContain('Optional Comment');
    expect(container.textContent).toContain('Submit Review');

    // Click star 5
    const starButtons = container.querySelectorAll('form button[type="button"]');
    expect(starButtons.length).toBe(5);

    act(() => {
      starButtons[4].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Submit form
    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).not.toBeNull();
    act(() => {
      submitBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockSubmit).toHaveBeenCalledWith(999, 5, '');
  });

  test('AuthPage renders Admin quick-fill demo pills and clicking auto-fills elegantadmin / admin123', () => {
    const mockAdminLogin = jest.fn().mockResolvedValue(true);
    act(() => {
      root.render(
        <AuthPage 
          salons={SALON_DATA} 
          onAdminLogin={mockAdminLogin} 
        />
      );
    });

    // Switch to Admin role
    const adminToggleBtn = Array.from(container.querySelectorAll('.role-btn'))
      .find(btn => btn.textContent.includes('Admin'));
    expect(adminToggleBtn).not.toBeNull();
    act(() => {
      adminToggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Check clean admin access form
    expect(container.textContent).toContain('Admin Access');
    expect(container.textContent).toContain('Manage your salon bookings');

    // Fill credentials in clean inputs
    const userInput = container.querySelector('input[placeholder="Username"]');
    const passInput = container.querySelector('input[placeholder="Enter password"]');
    
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(userInput, 'elegantadmin');
      userInput.dispatchEvent(new Event('input', { bubbles: true }));
      setter.call(passInput, 'admin123');
      passInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Submit form
    const form = container.querySelector('form');
    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockAdminLogin).toHaveBeenCalledWith('elegantadmin', 'admin123');
  });

  test('AuthPage renders expanded continuous auto-sliding carousel with no navigation arrows, 7 partner salon cards, and high-contrast text', () => {
    act(() => {
      root.render(
        <AuthPage 
          salons={SALON_DATA} 
        />
      );
    });

    // Check Netflix row header and badges
    expect(container.textContent).toContain('HAUTE PARTNER NETWORK');
    expect(container.textContent).toContain('Explore Our Partner Salons');

    // Check carousel wrapper and track
    const carouselContainer = container.querySelector('.netflix-carousel-container');
    expect(carouselContainer).not.toBeNull();

    // Arrows are completely removed
    const prevArrow = container.querySelector('.netflix-nav-prev');
    const nextArrow = container.querySelector('.netflix-nav-next');
    expect(prevArrow).toBeNull();
    expect(nextArrow).toBeNull();

    const track = container.querySelector('.netflix-carousel-track');
    expect(track).not.toBeNull();

    // Check all partner salon cards rendered in the continuous slider
    const salonCards = container.querySelectorAll('.netflix-salon-card');
    expect(salonCards.length).toBeGreaterThanOrEqual(7);

    // Verify .public-salon-name exists and has readable high-contrast studio titles
    const salonNames = Array.from(container.querySelectorAll('.public-salon-name')).map(el => el.textContent);
    expect(salonNames).toContain('Elegant Salon');
    expect(salonNames).toContain('Karen Green');
    expect(salonNames).toContain('Sir James Salon');

    // Click on "View Studio Details" button on the first card
    const firstViewBtn = container.querySelector('.netflix-view-btn');
    expect(firstViewBtn).not.toBeNull();
    expect(firstViewBtn.textContent).toContain('View Studio Details');
    act(() => {
      firstViewBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // In-page modal opens with the selected salon
    expect(container.querySelector('.netflix-modal-backdrop')).not.toBeNull();
    expect(container.textContent).toContain('Elegant Salon');

    // Close in-page modal
    const closeBtn = container.querySelector('.netflix-modal-close');
    act(() => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.querySelector('.netflix-modal-backdrop')).toBeNull();

    // Clicking anywhere on the card directly also strictly opens the in-page modal
    const secondCard = salonCards[1];
    expect(secondCard).not.toBeNull();
    act(() => {
      secondCard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.querySelector('.netflix-modal-backdrop')).not.toBeNull();
    expect(container.textContent).toContain('Karen Green');
  });

  test('AuthPage continuous carousel pauses auto-slide on hover and resumes on mouse leave', () => {
    act(() => {
      root.render(<AuthPage salons={SALON_DATA} />);
    });

    const carouselContainer = container.querySelector('.netflix-carousel-container');
    const track = container.querySelector('.netflix-carousel-track');
    expect(carouselContainer).not.toBeNull();
    expect(track).not.toBeNull();

    // Hover container pauses continuous auto-slide
    act(() => {
      carouselContainer.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      carouselContainer.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });
    expect(track.style.animationPlayState).toBe('paused');

    // Leave container resumes continuous auto-slide
    act(() => {
      carouselContainer.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      carouselContainer.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    });
    expect(track.style.animationPlayState).toBe('running');
  });

  test('AuthPage Quick Info button opens Quick Salon Details Modal with locked authentication CTA', () => {
    act(() => {
      root.render(
        <AuthPage 
          salons={SALON_DATA} 
        />
      );
    });

    // Modal is initially not rendered
    expect(container.querySelector('.netflix-modal-backdrop')).toBeNull();

    // Click Quick Info button on first salon card
    const quickBtn = container.querySelector('.netflix-quick-btn');
    expect(quickBtn).not.toBeNull();

    act(() => {
      quickBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Modal should now be open
    const modalBackdrop = container.querySelector('.netflix-modal-backdrop');
    expect(modalBackdrop).not.toBeNull();
    expect(container.textContent).toContain('★ 4.9 Rated Studio');
    expect(container.textContent).toContain('Elegant Salon');
    expect(container.textContent).toContain('Services & Pricing Menu');

    // "View Full Salon Page & Map" is completely removed
    expect(container.textContent).not.toContain('View Full Salon Page & Map');

    // Locked call-to-action button is present
    const lockedCtaBtn = Array.from(container.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('Sign In / Register to Book an Appointment'));
    expect(lockedCtaBtn).not.toBeNull();
    expect(lockedCtaBtn.textContent).toContain('🔒 Sign In / Register to Book an Appointment');

    // Clicking locked CTA closes modal and smoothly returns to login form
    act(() => {
      lockedCtaBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('.netflix-modal-backdrop')).toBeNull();
  });

  test('App seamlessly logs in Elegant Admin via fallback when Firebase Auth is unavailable', async () => {
    await act(async () => {
      root.render(<App />);
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Find and click Sign In button in navbar
    const signInBtn = Array.from(container.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Sign In');
    expect(signInBtn).not.toBeNull();

    act(() => {
      signInBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Now on AuthPage
    expect(container.textContent).toContain('Welcome Back');

    // Switch to Admin tab
    const adminTab = Array.from(container.querySelectorAll('.role-btn'))
      .find(btn => btn.textContent.includes('Admin'));
    expect(adminTab).not.toBeNull();

    act(() => {
      adminTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Admin Access');

    // Fill clean inputs with Elegant Admin credentials
    const userInput = container.querySelector('input[placeholder="Username"]');
    const passInput = container.querySelector('input[placeholder="Enter password"]');

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(userInput, 'elegantadmin');
      userInput.dispatchEvent(new Event('input', { bubbles: true }));
      setter.call(passInput, 'admin123');
      passInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Submit form
    const form = container.querySelector('form');
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should now be on Admin view
    expect(container.textContent).toContain('Admin');
  });

  test('AuthPage admin tab renders clean form without clutter quick pills', () => {
    act(() => {
      root.render(
        <AuthPage 
          salons={SALON_DATA} 
        />
      );
    });

    // Switch to Admin
    const adminToggleBtn = Array.from(container.querySelectorAll('.role-btn'))
      .find(btn => btn.textContent.includes('Admin'));
    act(() => {
      adminToggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Admin Access');
    expect(container.textContent).toContain('Manage your salon bookings');
    expect(container.querySelector('.admin-quick-pills-box')).toBeNull();
    expect(container.querySelector('input[placeholder="Username"]')).not.toBeNull();
    expect(container.querySelector('input[placeholder="Enter password"]')).not.toBeNull();
  });

  test('AuthPage renders interactive unlock button when locked and clicking unlocks account', () => {
    const mockResetLockout = jest.fn();
    act(() => {
      root.render(
        <AuthPage 
          salons={SALON_DATA} 
          isLocked={true} 
          lockCountdown={20}
          onResetLockout={mockResetLockout}
        />
      );
    });

    // Switch to Admin
    const adminToggleBtn = Array.from(container.querySelectorAll('.role-btn'))
      .find(btn => btn.textContent.includes('Admin'));
    act(() => {
      adminToggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const unlockBtn = Array.from(container.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('Reset Lockout & Unlock'));
    expect(unlockBtn).not.toBeNull();

    act(() => {
      unlockBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockResetLockout).toHaveBeenCalledTimes(1);
  });

  test('findAdminAccount matches admin aliases and email domain seamlessly', () => {
    // 1. Direct match
    expect(findAdminAccount('elegantadmin', 'admin123')?.salonId).toBe('elegant');
    // 2. Email format
    expect(findAdminAccount('elegantadmin@brushup.com', 'admin123')?.salonId).toBe('elegant');
    // 3. Alias match for Karen Green (spelled karenadmin instead of kareenadmin)
    expect(findAdminAccount('karenadmin', 'admin123')?.salonId).toBe('karen-green');
    // 4. Alias match for Elegant Admin (admin_elegant)
    expect(findAdminAccount('admin_elegant', 'admin123')?.salonId).toBe('elegant');
    // 5. Alias match for Super Admin (admin)
    expect(findAdminAccount('admin', 'admin123')?.role).toBe('superadmin');
    // 6. Invalid password should return null
    expect(findAdminAccount('elegantadmin', 'wrongpass')).toBeNull();
  });

  test('Quick Salon Details Modal pauses carousel auto-slide and closes on Escape key press', () => {
    act(() => {
      root.render(<AuthPage salons={SALON_DATA} />);
    });

    // Open Quick Info modal
    const quickBtn = container.querySelector('.netflix-quick-btn');
    act(() => {
      quickBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('.netflix-modal-backdrop')).not.toBeNull();

    // Press Escape key
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    // Modal should now be closed
    expect(container.querySelector('.netflix-modal-backdrop')).toBeNull();
  });

  test('AuthPage continuous carousel pauses on focus and resumes on blur for keyboard accessibility', () => {
    act(() => {
      root.render(<AuthPage salons={SALON_DATA} />);
    });

    const carouselContainer = container.querySelector('.netflix-carousel-container');
    const track = container.querySelector('.netflix-carousel-track');
    expect(carouselContainer).not.toBeNull();
    expect(track).not.toBeNull();

    // Focusing into carousel track/card pauses auto-slide
    act(() => {
      carouselContainer.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    expect(track.style.animationPlayState).toBe('paused');

    // Blurring outside carousel resumes auto-slide
    act(() => {
      carouselContainer.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });
    expect(track.style.animationPlayState).toBe('running');
  });

  test('Quick Salon Details Modal includes ARIA accessibility attributes and accessible title', () => {
    act(() => {
      root.render(<AuthPage salons={SALON_DATA} />);
    });

    const quickBtn = container.querySelector('.netflix-quick-btn');
    act(() => {
      quickBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const modalDialog = container.querySelector('.netflix-modal-card');
    expect(modalDialog).not.toBeNull();
    expect(modalDialog.getAttribute('role')).toBe('dialog');
    expect(modalDialog.getAttribute('aria-modal')).toBe('true');
    expect(modalDialog.getAttribute('aria-labelledby')).toBe('netflix-modal-title');

    const modalTitle = container.querySelector('#netflix-modal-title');
    expect(modalTitle).not.toBeNull();
    expect(modalTitle.textContent).toContain('Elegant Salon');
  });

  test('AuthPage handles edge cases with empty salons and low salon counts without crashing', () => {
    // 1. Empty salons array
    act(() => {
      root.render(<AuthPage salons={[]} />);
    });
    expect(container.querySelector('.netflix-carousel-container')).not.toBeNull();
    expect(container.textContent).toContain('Explore Our Partner Salons');

    // 2. Low salon count (e.g. 2 salons) duplicates cleanly to fill the continuous track
    const twoSalons = SALON_DATA.slice(0, 2);
    act(() => {
      root.render(<AuthPage salons={twoSalons} />);
    });
    const cards = container.querySelectorAll('.netflix-salon-card');
    // 2 salons repeated (3x each in primary group + 3x each in clone group = 12 cards total)
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });

  test('Unauthenticated users on AuthPage are strictly gated from accessing homepage, salon detail, or booking pages when clicking partner salons', async () => {
    await act(async () => {
      root.render(<App />);
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Navigate to AuthPage from CustomerDashboard
    const signInBtn = Array.from(container.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Sign In');
    expect(signInBtn).not.toBeNull();

    act(() => {
      signInBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Now on AuthPage
    expect(container.textContent).toContain('Welcome Back');
    expect(container.textContent).toContain('HAUTE PARTNER NETWORK');

    // 1. Verify AuthPage is strictly self-contained and has NO return-to-salons escape hatch
    expect(container.querySelector('.demo-return-pill-btn')).toBeNull();
    expect(container.textContent).not.toContain('Return to Salons');

    // 2. Click "View Studio Details" on the first salon card
    const viewStudioBtn = container.querySelector('.netflix-view-btn');
    expect(viewStudioBtn).not.toBeNull();
    expect(viewStudioBtn.textContent).toContain('View Studio Details');

    act(() => {
      viewStudioBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // The in-page modal is open right on AuthPage
    expect(container.querySelector('.netflix-modal-backdrop')).not.toBeNull();
    expect(container.textContent).toContain('Services & Pricing Menu');

    // Gated boundary assertions: Unauthenticated users CANNOT enter homepage or salon detail page or booking modal
    expect(container.querySelector('.salon-detail-page')).toBeNull();
    expect(container.querySelector('.booking-modal')).toBeNull();
    // Action to view full salon page without an account does NOT exist
    expect(container.textContent).not.toContain('View Full Salon Page & Map');

    // Locked call-to-action is present
    const lockedBtn = Array.from(container.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('Sign In / Register to Book an Appointment'));
    expect(lockedBtn).not.toBeNull();

    // Clicking locked CTA closes modal, calls window.scrollTo, focuses login input, and keeps the unauthenticated user on AuthPage
    act(() => {
      lockedBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('.netflix-modal-backdrop')).toBeNull();
    expect(container.textContent).toContain('Welcome Back');
    expect(container.querySelector('.salon-detail-page')).toBeNull();
    expect(container.querySelector('.booking-modal')).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    // Verify username input is focused
    const usernameInput = container.querySelector('input[placeholder="Username"]');
    expect(document.activeElement).toBe(usernameInput);

    // 3. Verify clicking the second salon card article directly also strictly opens in-page modal without navigation
    const salonCards = container.querySelectorAll('.netflix-salon-card');
    expect(salonCards.length).toBeGreaterThan(1);
    act(() => {
      salonCards[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.querySelector('.netflix-modal-backdrop')).not.toBeNull();
    expect(container.querySelector('.salon-detail-page')).toBeNull();
    expect(container.querySelector('.booking-modal')).toBeNull();

    // Close in-page modal via Close button
    const closeBtn = container.querySelector('.netflix-modal-close');
    act(() => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.querySelector('.netflix-modal-backdrop')).toBeNull();

    // 4. Verify pressing Enter on card via keyboard opens in-page modal without navigation
    act(() => {
      salonCards[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(container.querySelector('.netflix-modal-backdrop')).not.toBeNull();
    expect(container.querySelector('.salon-detail-page')).toBeNull();
    expect(container.querySelector('.booking-modal')).toBeNull();
  });

  test('AuthPage strictly ignores any onSelectSalon prop and only opens in-page modal', () => {
    const mockSelectSalon = jest.fn();
    act(() => {
      root.render(
        <AuthPage 
          salons={SALON_DATA} 
          onSelectSalon={mockSelectSalon} 
        />
      );
    });

    const viewStudioBtn = container.querySelector('.netflix-view-btn');
    act(() => {
      viewStudioBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockSelectSalon).not.toHaveBeenCalled();
    expect(container.querySelector('.netflix-modal-backdrop')).not.toBeNull();
  });
});

