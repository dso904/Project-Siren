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

const os = require('os');

// SAFETY CHECK: Verify current IP matches configuration
const interfaces = os.networkInterfaces();
let ipFound = false;

Object.keys(interfaces).forEach((iface) => {
  interfaces[iface].forEach((details) => {
    if (details.address === LAPTOP_IP) {
      ipFound = true;
    }
  });
});

if (!ipFound) {
  console.error('\n\n!!! CRITICAL CONFIGURATION ERROR !!!');
  console.error(`Your machine does NOT have the IP ${LAPTOP_IP}.`);
  console.error('The captive portal will NOT work.');
  console.error('Please set your Static IP in Windows Settings first.\n');
  // We don't exit process so you can see the error, but we warn loudly.
}

const server = dns2.createServer({
  udp: true,
  handle: (request, send) => {
    const response = Packet.createResponseFromRequest(request);
    const [question] = request.questions;

    const type = question.type;

    // Handle A records (Standard IPv4) -> Redirect to our Laptop
    if (type === Packet.TYPE.A) {
      response.answers.push({
        name: question.name,
        type: Packet.TYPE.A,
        class: Packet.CLASS.IN,
        ttl: 60,
        address: LAPTOP_IP
      });
    }

    // Handle AAAA records (IPv6) -> Respond with empty to force IPv4
    // This prevents modern phones from hanging while waiting for IPv6 timeout
    else if (type === Packet.TYPE.AAAA) {
      // leaving answers empty tells the client "No IPv6 address", forcing them to use the A record
    }
    // Handle other types if necessary or just let them resolve to empty

    // Log the redirect (for A records only, to keep logs clean)
    if (type === Packet.TYPE.A) {
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
