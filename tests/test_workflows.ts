/**
 * Automated Test Suite for RoomsForUse Full-Stack Application
 * Tests: Auth, Role-based Access, Room Availability, Booking Flow, Payment Verification, Cancellation, and Admin Controls.
 */

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('🧪 Starting RoomsForUse Automated System Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthData.status === 'healthy', 'Health check endpoint returns status healthy');

    // 2. Public Rooms listing
    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    assert(roomsData.success && roomsData.rooms.length > 0, `Fetch all rooms (${roomsData.rooms.length} found)`);

    // 3. Customer Authentication
    const customerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sid@gmail.com', password: 'customer123' })
    });
    const customerLoginData = await customerLoginRes.json();
    assert(customerLoginData.success && customerLoginData.user.role === 'customer', 'Customer login returns valid token & customer role');
    const customerToken = customerLoginData.token;

    // 4. Admin Authentication
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 's@gmail.com', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.success && adminLoginData.user.role === 'admin', 'Admin login returns valid token & admin role');
    const adminToken = adminLoginData.token;

    // 5. Customer cannot access Admin endpoints (RBAC test)
    const unauthorizedRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(unauthorizedRes.status === 403, 'Customer is blocked with 403 Forbidden from admin endpoints');

    // 6. Admin can access Admin endpoints
    const adminUsersRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminUsersData = await adminUsersRes.json();
    assert(adminUsersData.success && adminUsersData.users.length > 0, `Admin successfully retrieves all registered users (${adminUsersData.users.length} users)`);

    // 7. Check room availability
    const testRoom = roomsData.rooms[0];
    const availRes = await fetch(`${BASE_URL}/rooms/availability?roomId=${testRoom._id}&checkIn=2026-11-10&checkOut=2026-11-12`);
    const availData = await availRes.json();
    assert(availData.success && availData.numberOfNights === 2, 'Date difference correctly calculates 2 nights and checks availability');

    // 8. Create a booking
    const createBookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: '2026-11-10',
        checkOut: '2026-11-12',
        guestCount: 1,
        userPhone: '9704927807'
      })
    });
    const createBookingData = await createBookingRes.json();
    assert(createBookingData.success && createBookingData.booking._id, 'Booking created successfully with unique ID');
    const newBookingId = createBookingData.booking._id;

    // 9. Prevent overlapping booking for same room on same dates
    const overlapRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: '2026-11-10',
        checkOut: '2026-11-12',
        guestCount: 1
      })
    });
    assert(overlapRes.status === 409, 'Server prevents double booking with 409 Conflict status');

    // 10. Test payment order creation & verification
    const orderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        bookingId: newBookingId,
        amount: createBookingData.booking.totalAmount
      })
    });
    const orderData = await orderRes.json();
    assert(orderData.success && orderData.order.orderId, 'Payment order created with simulated gateway reference');

    const verifyPayRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        bookingId: newBookingId,
        paymentMethod: 'UPI (GPay Test)',
        transactionId: 'pay_test_suite_verified'
      })
    });
    const verifyPayData = await verifyPayRes.json();
    assert(verifyPayData.success && verifyPayData.booking.bookingStatus === 'Booked', 'Payment verified and booking status confirmed as Booked');

    // 11. Customer can view their booking in My Bookings
    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const myBookingsData = await myBookingsRes.json();
    const hasNewBooking = myBookingsData.bookings.some((b: any) => b._id === newBookingId);
    assert(hasNewBooking, 'New booking appears in customer My Bookings list');

    // 12. Cancel booking
    const cancelRes = await fetch(`${BASE_URL}/bookings/${newBookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ reason: 'Automated test suite cancellation' })
    });
    const cancelData = await cancelRes.json();
    assert(cancelData.success && cancelData.booking.bookingStatus === 'Cancelled', 'Booking successfully cancelled and marked as Cancelled');

    // 13. Cancelled booking releases room availability
    const freedAvailRes = await fetch(`${BASE_URL}/rooms/availability?roomId=${testRoom._id}&checkIn=2026-11-10&checkOut=2026-11-12`);
    const freedAvailData = await freedAvailRes.json();
    assert(freedAvailData.isAvailable === true, 'Cancelled booking releases room so dates become available again');

    // 14. Admin stats
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsData.success && statsData.stats.totalRooms > 0, 'Admin stats return computed revenue, rooms, and bookings');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
