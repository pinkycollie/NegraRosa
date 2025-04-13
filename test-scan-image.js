// Simple script to test WHY scan and image submission methods
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test data
const TEST_USER_ID = 1; // This should be a valid user ID in your system
const TEST_SCAN_CODE = "XYZ123"; // Sample scan code

async function runTests() {
  console.log('Testing WHY scan and image submission methods...');
  
  try {
    // Test 1: Create a WHY submission using scan code
    console.log('\n--- Test 1: Scan code WHY submission ---');
    const scanSubmission = await axios.post(`${API_URL}/why-submissions/scan`, {
      scanCode: TEST_SCAN_CODE,
      content: "Additional explanation for scan context"
    });
    console.log(`Status: ${scanSubmission.status}`);
    console.log(`Submission ID: ${scanSubmission.data.submission.id}`);
    console.log(`Submission content: ${scanSubmission.data.submission.content}`);
    
    // Test 2: Image submission with base64 data
    console.log('\n--- Test 2: Image WHY submission ---');
    const mockImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."; // Shortened for brevity
    const imageSubmission = await axios.post(`${API_URL}/users/${TEST_USER_ID}/why-submissions/image`, {
      imageData: mockImageData,
      caption: "Screenshot of error message for verification",
      triggerType: "IDENTITY_VERIFICATION"
    });
    console.log(`Status: ${imageSubmission.status}`);
    console.log(`Submission ID: ${imageSubmission.data.submission.id}`);
    console.log(`Media URL contains data: ${Boolean(imageSubmission.data.submission.mediaUrl)}`);
    
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