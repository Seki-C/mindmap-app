// Quick test script to verify the SDK build
const { createClient, VERSION } = require('./dist');

console.log('🚀 Claude Code SDK Quick Test');
console.log('Version:', VERSION);

try {
  // Test client creation
  const client = createClient({
    apiKey: 'test-key',
    debug: false,
  });
  
  console.log('✅ Client created successfully');
  
  // Test session creation
  const sessionId = client.createSession({ test: true }).then(id => {
    console.log('✅ Session created:', id);
    
    // Test session retrieval
    const session = client.getSession(id);
    console.log('✅ Session retrieved:', session ? 'yes' : 'no');
    
    // Test session listing
    const sessions = client.listSessions();
    console.log('✅ Sessions count:', sessions.length);
    
    console.log('\n🎉 All basic tests passed!');
  }).catch(err => {
    console.error('❌ Error:', err.message);
  });
  
} catch (error) {
  console.error('❌ Failed to create client:', error.message);
}