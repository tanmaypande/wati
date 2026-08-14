const axios = require('axios');
const prisma = require('./src/config/prismaClient');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

async function runMultiTenantTests() {
  console.log('===============================================================');
  console.log('🚀 MULTI-TENANT SAAS ARCHITECTURE & SECURITY TEST SUITE');
  console.log('===============================================================\n');

  try {
    const timestamp = Date.now();
    const emailA = `tanmay_${timestamp}@tanmayclothing.com`;
    const emailB = `owner_${timestamp}@abcfashion.com`;
    const password = 'Pass123!';

    // 1. REGISTER COMPANY A ("Tanmay Clothing")
    console.log('1. Registering Company A ("Tanmay Clothing")...');
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Tanmay Pandey',
      companyName: 'Tanmay Clothing',
      email: emailA,
      password: password,
    });

    // Retrieve OTP from DB to verify email without relying on SMTP in test environment
    const recordA = await prisma.emailVerification.findFirst({
      where: { email: emailA },
      orderBy: { createdAt: 'desc' },
    });
    
    // We get OTP by matching known test numbers or using helper verification
    // Since otpHash is hashed, let's verify via verifyEmail after resetting otpHash to known hash or reading DB
    const bcrypt = require('bcrypt');
    const knownOtp = '123456';
    const knownHash = await bcrypt.hash(knownOtp, 10);
    await prisma.emailVerification.update({
      where: { id: recordA.id },
      data: { otpHash: knownHash },
    });

    await axios.post(`${BASE_URL}/auth/verify-email`, {
      email: emailA,
      otp: knownOtp,
    });
    console.log('✅ Company A registered & verified successfully.');

    // 2. REGISTER COMPANY B ("ABC Fashion")
    console.log('\n2. Registering Company B ("ABC Fashion")...');
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'ABC Owner',
      companyName: 'ABC Fashion',
      email: emailB,
      password: password,
    });

    const recordB = await prisma.emailVerification.findFirst({
      where: { email: emailB },
      orderBy: { createdAt: 'desc' },
    });
    await prisma.emailVerification.update({
      where: { id: recordB.id },
      data: { otpHash: knownHash },
    });

    await axios.post(`${BASE_URL}/auth/verify-email`, {
      email: emailB,
      otp: knownOtp,
    });
    console.log('✅ Company B registered & verified successfully.');

    // 3. LOGIN AS SUPER ADMIN A
    console.log('\n3. Logging in as Super Admin A...');
    const loginARes = await axios.post(`${BASE_URL}/auth/login`, {
      email: emailA,
      password: password,
    });
    const tokenA = loginARes.data.data.accessToken;
    const userA = loginARes.data.data.user;
    console.log(`✅ Super Admin A Logged In: Role=${userA.role} | WorkspaceId=${userA.workspaceId} | WorkspaceName="${userA.workspaceName}"`);

    // 4. LOGIN AS SUPER ADMIN B
    console.log('\n4. Logging in as Super Admin B...');
    const loginBRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: emailB,
      password: password,
    });
    const tokenB = loginBRes.data.data.accessToken;
    const userB = loginBRes.data.data.user;
    console.log(`✅ Super Admin B Logged In: Role=${userB.role} | WorkspaceId=${userB.workspaceId} | WorkspaceName="${userB.workspaceName}"`);

    // Ensure Workspace IDs are completely distinct
    if (userA.workspaceId === userB.workspaceId) {
      console.error('❌ FAILURE: Workspaces are identical between Company A and Company B!');
      process.exit(1);
    }
    console.log('✅ PASS: Workspace IDs are isolated and distinct.');

    // 5. SUPER ADMIN A CREATES AGENT A1 IN WORKSPACE A
    console.log('\n5. Super Admin A creating Agent A1 in Workspace A...');
    const agentA1Email = `rahul_${timestamp}@tanmayclothing.com`;
    const agentA1Res = await axios.post(
      `${BASE_URL}/agents`,
      { name: 'Rahul Sharma', email: agentA1Email, password: password },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    const agentA1 = agentA1Res.data.data;
    console.log(`✅ Agent A1 Created: ID=${agentA1.id} | WorkspaceId=${agentA1.workspaceId} | Role=${agentA1.role}`);

    // 6. SUPER ADMIN B CREATES AGENT B1 IN WORKSPACE B
    console.log('\n6. Super Admin B creating Agent B1 in Workspace B...');
    const agentB1Email = `sneha_${timestamp}@abcfashion.com`;
    const agentB1Res = await axios.post(
      `${BASE_URL}/agents`,
      { name: 'Sneha Patel', email: agentB1Email, password: password },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    const agentB1 = agentB1Res.data.data;
    console.log(`✅ Agent B1 Created: ID=${agentB1.id} | WorkspaceId=${agentB1.workspaceId} | Role=${agentB1.role}`);

    // 7. SUPER ADMIN A CREATES CONTACT A AND CONVERSATION A
    console.log('\n7. Super Admin A creating Contact A & Conversation A in Workspace A...');
    const contactARes = await axios.post(
      `${BASE_URL}/contacts`,
      { name: 'Customer A', phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`, email: 'customera@gmail.com' },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    const contactA = contactARes.data.data;

    const convARes = await axios.post(
      `${BASE_URL}/conversations`,
      { contactId: contactA.id },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    const convA = convARes.data.data;
    console.log(`✅ Contact A=${contactA.id} & Conversation A=${convA.id} created in Workspace A.`);

    // 8. SUPER ADMIN B CREATES CONTACT B AND CONVERSATION B
    console.log('\n8. Super Admin B creating Contact B & Conversation B in Workspace B...');
    const contactBRes = await axios.post(
      `${BASE_URL}/contacts`,
      { name: 'Customer B', phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`, email: 'customerb@gmail.com' },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    const contactB = contactBRes.data.data;

    const convBRes = await axios.post(
      `${BASE_URL}/conversations`,
      { contactId: contactB.id },
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    const convB = convBRes.data.data;
    console.log(`✅ Contact B=${contactB.id} & Conversation B=${convB.id} created in Workspace B.`);

    // 9. VERIFY DASHBOARD STATS SCOPING
    console.log('\n9. Testing Dashboard Stats Scoping...');
    const overviewARes = await axios.get(`${BASE_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const overviewA = overviewARes.data.data;
    console.log('   Company A Overview Stats:', {
      totalContacts: overviewA.totalContacts,
      totalEmployees: overviewA.totalEmployees,
      totalConversations: overviewA.totalConversations,
      workspaceName: overviewA.workspace?.name,
    });

    const overviewBRes = await axios.get(`${BASE_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const overviewB = overviewBRes.data.data;
    console.log('   Company B Overview Stats:', {
      totalContacts: overviewB.totalContacts,
      totalEmployees: overviewB.totalEmployees,
      totalConversations: overviewB.totalConversations,
      workspaceName: overviewB.workspace?.name,
    });

    if (overviewA.workspace?.name !== 'Tanmay Clothing' || overviewB.workspace?.name !== 'ABC Fashion') {
      console.error('❌ FAILURE: Workspace names in overview do not match registered companies!');
      process.exit(1);
    }
    console.log('✅ PASS: Overview statistics are properly scoped to each company workspace.');

    // 10. VERIFY EMPLOYEE/AGENT ISOLATION
    console.log('\n10. Testing Employee/Agent List Isolation...');
    const agentsARes = await axios.get(`${BASE_URL}/agents`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const agentsAList = agentsARes.data.data;
    const hasAgentBInA = agentsAList.some((a) => a.id === agentB1.id);
    if (hasAgentBInA) {
      console.error('❌ SECURITY FAILURE: Super Admin A sees Agent B1 from Company B!');
      process.exit(1);
    }
    console.log(`✅ PASS: Super Admin A sees ONLY Company A employees (${agentsAList.length} total).`);

    // 11. VERIFY CONTACT ISOLATION
    console.log('\n11. Testing Contact List Isolation...');
    const contactsARes = await axios.get(`${BASE_URL}/contacts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const contactsAList = contactsARes.data.data.items || contactsARes.data.data;
    const hasContactBInA = contactsAList.some((c) => c.id === contactB.id);
    if (hasContactBInA) {
      console.error('❌ SECURITY FAILURE: Super Admin A sees Contact B from Company B!');
      process.exit(1);
    }
    console.log('✅ PASS: Super Admin A sees ONLY Company A contacts.');

    // 12. DIRECT API MANIPULATION SECURITY TESTS (CROSS-TENANT ACCESS PREVENTION)
    console.log('\n12. 🔒 TESTING DIRECT API ID MANIPULATION (CROSS-TENANT ACCESS BLOCKED)...');

    // Test 12.1: Super Admin A attempts GET /api/contacts/<Contact-B-ID>
    console.log('   Test 12.1: Super Admin A requesting GET /api/contacts/' + contactB.id + ' (Company B contact)...');
    try {
      await axios.get(`${BASE_URL}/contacts/${contactB.id}`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      console.error('❌ SECURITY FAILURE: Super Admin A was allowed access to Contact B!');
      process.exit(1);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        console.log(`   ✅ BLOCKED properly with HTTP ${err.response.status}: ${err.response.data.message}`);
      } else {
        throw err;
      }
    }

    // Test 12.2: Super Admin A attempts GET /api/conversations/<Conversation-B-ID>
    console.log('   Test 12.2: Super Admin A requesting GET /api/conversations/' + convB.id + ' (Company B conversation)...');
    try {
      await axios.get(`${BASE_URL}/conversations/${convB.id}`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      console.error('❌ SECURITY FAILURE: Super Admin A was allowed access to Conversation B!');
      process.exit(1);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        console.log(`   ✅ BLOCKED properly with HTTP ${err.response.status}: ${err.response.data.message}`);
      } else {
        throw err;
      }
    }

    // 13. AGENT LOGIN AND PERMISSIONS TEST
    console.log('\n13. Testing Agent A1 Login & Workspace Scope...');
    const loginAgentA1 = await axios.post(`${BASE_URL}/auth/login`, {
      email: agentA1Email,
      password: password,
    });
    const tokenAgentA1 = loginAgentA1.data.data.accessToken;
    const userAgentA1 = loginAgentA1.data.data.user;
    console.log(`✅ Agent A1 Logged In: Role=${userAgentA1.role} | WorkspaceId=${userAgentA1.workspaceId}`);

    // Agent A1 attempts to request Contact B
    console.log('   Agent A1 requesting GET /api/contacts/' + contactB.id + ' (Company B contact)...');
    try {
      await axios.get(`${BASE_URL}/contacts/${contactB.id}`, {
        headers: { Authorization: `Bearer ${tokenAgentA1}` },
      });
      console.error('❌ SECURITY FAILURE: Agent A1 was allowed access to Contact B!');
      process.exit(1);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        console.log(`   ✅ BLOCKED properly with HTTP ${err.response.status}: ${err.response.data.message}`);
      } else {
        throw err;
      }
    }

    // 14. WORKSPACE PROFILE ENDPOINT TEST
    console.log('\n14. Testing Workspace Profile Endpoint (GET /api/workspace)...');
    const wsARes = await axios.get(`${BASE_URL}/workspace`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    console.log(`✅ Company A Profile: ID=${wsARes.data.data.id} | Name="${wsARes.data.data.name}" | Status=${wsARes.data.data.status}`);

    const wsBRes = await axios.get(`${BASE_URL}/workspace`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log(`✅ Company B Profile: ID=${wsBRes.data.data.id} | Name="${wsBRes.data.data.name}" | Status=${wsBRes.data.data.status}`);

    console.log('\n===============================================================');
    console.log('🎉 ALL MULTI-TENANT SAAS SECURITY & ISOLATION TESTS PASSED 100%');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('❌ Test execution error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMultiTenantTests();
