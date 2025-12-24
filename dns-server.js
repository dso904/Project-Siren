/**
 * PROJECT SIREN - DNS Redirect Server
 * 
 * This server intercepts ALL DNS queries and returns the laptop's IP.
 * This is what makes the "captive portal" magic work.
 * 
 * MUST RUN AS ADMINISTRATOR on Windows.
 * 
 * Usage: node dns-server.js
 */

const dns2 = require('dns2');
const { Packet } = dns2;

// ============================================
// CONFIGURATION - CHANGE THIS TO YOUR IP
// ============================================
const LAPTOP_IP = '192.168.0.50';  // Your laptop's static IP (outside DHCP range 100-199)
const DNS_PORT = 53;
// ============================================

const server = dns2.createServer({
  udp: true,
  handle: (request, send) => {
    const response = Packet.createResponseFromRequest(request);
    const [question] = request.questions;

    if (question) {
      // Redirect ALL domains to our laptop
      response.answers.push({
        name: question.name,
        type: Packet.TYPE.A,
        class: Packet.CLASS.IN,
        ttl: 60,  // Short TTL so phones don't cache
        address: LAPTOP_IP
      });

      // Log the redirect (useful for debugging)
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] DNS: ${question.name} → ${LAPTOP_IP}`);
    }

    send(response);
  }
});

server.on('listening', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║          PROJECT SIREN - DNS REDIRECT SERVER              ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  Redirecting ALL domains to: ${LAPTOP_IP.padEnd(26)} ║`);
  console.log(`║  Listening on port: ${String(DNS_PORT).padEnd(36)} ║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  Make sure router DNS is set to this laptop\'s IP!        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.error('');
    console.error('╔═══════════════════════════════════════════════════════════╗');
    console.error('║  ERROR: Permission denied on port 53                      ║');
    console.error('║  You must run this as Administrator!                      ║');
    console.error('║                                                           ║');
    console.error('║  Right-click Command Prompt → Run as Administrator        ║');
    console.error('╚═══════════════════════════════════════════════════════════╝');
    console.error('');
  } else if (err.code === 'EADDRINUSE') {
    console.error('');
    console.error('╔═══════════════════════════════════════════════════════════╗');
    console.error('║  ERROR: Port 53 is already in use                         ║');
    console.error('║  Another DNS server might be running.                     ║');
    console.error('╚═══════════════════════════════════════════════════════════╝');
    console.error('');
  } else {
    console.error('DNS Server Error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[DNS] Shutting down...');
  process.exit(0);
});

// Start the server
server.listen({ udp: DNS_PORT });
