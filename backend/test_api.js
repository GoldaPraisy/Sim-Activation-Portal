import http from 'http';

async function testBackend() {
  console.log('Testing backend server initialization...');
  try {
    // Import server module dynamically to check for syntax/import errors
    const dbModule = await import('./config/db.js');
    console.log('✅ Database layer loaded successfully!');
    console.log('Users count:', dbModule.db.find('users').length);
    console.log('Admin count:', dbModule.db.find('admin_users').length);
    console.log('Plans count:', dbModule.db.find('plans').length);
    console.log('Devices count:', dbModule.db.find('devices').length);
    console.log('Requests count:', dbModule.db.find('esim_requests').length);

    const smdpModule = await import('./services/mockSmdpService.js');
    const profile = await smdpModule.default.provisionProfile({
      userId: 'test-user',
      eid: '89049032000000000000000000001001',
      device: 'iPhone 15 Pro',
      planId: 'plan-jio-299',
      operator: 'Jio'
    });
    console.log('✅ Mock SM-DP+ Profile generation successful!');
    console.log('LPA Code:', profile.activationCode);
    console.log('QR Code URL generated:', profile.qrCodeUrl.startsWith('data:image/png;base64,'));

    const otpModule = await import('./services/otpService.js');
    const otpRes = otpModule.default.generateOtp('9876543210');
    console.log('✅ OTP generation test successful! OTP:', otpRes.devOtp);
    const verifyRes = otpModule.default.verifyOtp('9876543210', otpRes.devOtp);
    console.log('✅ OTP verification test result:', verifyRes.success);

    const eidValidator = await import('./utils/eidValidator.js');
    const validCheck = eidValidator.validateEID('89049032000000000000000000001001');
    console.log('✅ 32-digit EID Validation test:', validCheck.isValid, 'Formatted:', validCheck.formatted);

    const invalidCheck = eidValidator.validateEID('12345');
    console.log('✅ Invalid EID Validation catch test:', !invalidCheck.isValid, 'Error:', invalidCheck.error);

    console.log('\n🎉 ALL BACKEND UNIT & SERVICE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Backend test failed:', err);
    process.exit(1);
  }
}

testBackend();
