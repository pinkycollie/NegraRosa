// Simple script to test WHY submission methods
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test data
const TEST_USER_ID = 1; // This should be a valid user ID in your system

async function runTests() {
  console.log('Testing WHY submission system...');
  
  try {
    // Test 1: Create a basic WHY submission
    console.log('\n--- Test 1: Create basic WHY submission ---');
    const basicSubmission = await axios.post(`${API_URL}/users/${TEST_USER_ID}/why-submissions`, {
      triggerType: 'GENERAL',
      submissionMethod: 'FORM',
      content: 'This is a test WHY submission explaining my circumstances',
    });
    console.log(`Status: ${basicSubmission.status}`);
    console.log(`Submission ID: ${basicSubmission.data.submission.id}`);
    console.log(`Notification ID: ${basicSubmission.data.notification.id}`);
    
    const submissionId = basicSubmission.data.submission.id;
    
    // Test 2: Text submission (quick method)
    console.log('\n--- Test 2: Text submission ---');
    const textSubmission = await axios.post(`${API_URL}/users/${TEST_USER_ID}/why-submissions/text`, {
      triggerType: 'EMPLOYMENT_VERIFICATION',
      content: 'This is a quick text explanation for my employment gap',
    });
    console.log(`Status: ${textSubmission.status}`);
    console.log(`Submission ID: ${textSubmission.data.submission.id}`);
    
    // Test 2b: SMS submission
    console.log('\n--- Test 2b: SMS submission ---');
    const smsSubmission = await axios.post(`${API_URL}/why-submissions/sms`, {
      phoneNumber: '+15551234567',
      content: 'This is an SMS WHY explanation sent from my phone'
    });
    console.log(`Status: ${smsSubmission.status}`);
    console.log(`Submission ID: ${smsSubmission.data.submission.id}`);
    
    // Test 3: Get all user WHY submissions
    console.log('\n--- Test 3: Get all WHY submissions ---');
    const allSubmissions = await axios.get(`${API_URL}/users/${TEST_USER_ID}/why-submissions`);
    console.log(`Status: ${allSubmissions.status}`);
    console.log(`Number of submissions: ${allSubmissions.data.length}`);
    allSubmissions.data.forEach(submission => {
      console.log(`- ID: ${submission.id}, Method: ${submission.submissionMethod}, Status: ${submission.status}`);
    });
    
    // Test 4: Update submission status
    console.log('\n--- Test 4: Update WHY submission status ---');
    const updateSubmission = await axios.patch(`${API_URL}/why-submissions/${submissionId}`, {
      status: 'REVIEWING',
      reviewerId: 2,
    });
    console.log(`Status: ${updateSubmission.status}`);
    console.log(`Updated status: ${updateSubmission.data.status}`);
    
    // Test 5: Resolve a WHY submission
    console.log('\n--- Test 5: Resolve WHY submission ---');
    const resolveSubmission = await axios.patch(`${API_URL}/why-submissions/${submissionId}`, {
      status: 'RESOLVED',
      resolution: 'Explanation accepted and verification updated',
    });
    console.log(`Status: ${resolveSubmission.status}`);
    console.log(`Final status: ${resolveSubmission.data.status}`);
    console.log(`Resolution: ${resolveSubmission.data.resolution}`);
    
    // Test 6: Get WHY notifications
    console.log('\n--- Test 6: Get WHY notifications ---');
    const notifications = await axios.get(`${API_URL}/users/${TEST_USER_ID}/why-notifications`);
    console.log(`Status: ${notifications.status}`);
    console.log(`Number of notifications: ${notifications.data.length}`);
    notifications.data.forEach(notification => {
      console.log(`- ID: ${notification.id}, Type: ${notification.notificationType}, Content: ${notification.content}`);
    });
    
    // Test 7: Update a notification status (mark as read)
    if (notifications.data.length > 0) {
      console.log('\n--- Test 7: Mark notification as read ---');
      const notificationId = notifications.data[0].id;
      const updateNotification = await axios.patch(`${API_URL}/why-notifications/${notificationId}`, {
        status: 'READ',
      });
      console.log(`Status: ${updateNotification.status}`);
      console.log(`Updated notification status: ${updateNotification.data.status}`);
      console.log(`Read at: ${updateNotification.data.readAt}`);
    }
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the tests
runTests();