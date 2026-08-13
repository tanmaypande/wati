const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== MULTI-TENANT SAAS & TENANT ISOLATION VERIFICATION ===\n');

  try {
    // 1. Super Admin Login
    console.log('1. Logging in as Platform Super Admin...');
    const saLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@platform.com',
      password: 'SuperAdmin123!',
    });
    const saToken = saLogin.data.data.accessToken;
    console.log('✅ Super Admin login successful! Role:', saLogin.data.data.user.role, '| WorkspaceId:', saLogin.data.data.user.workspaceId);

    // 2. Fetch Super Admin Dashboard Stats
    console.log('\n2. Testing Super Admin Platform Stats endpoint...');
    const statsRes = await axios.get(`${BASE_URL}/super-admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${saToken}` },
    });
    console.log('✅ Platform Stats received:', {
      companies: statsRes.data.data.totalCompanies,
      active: statsRes.data.data.activeCompanies,
      suspended: statsRes.data.data.suspendedCompanies,
      users: statsRes.data.data.totalUsers,
    });

    // 3. Super Admin creates Workspace A and Admin A
    console.log('\n3. Creating Workspace A (Acme Corp) via Super Admin API...');
    const compA = await axios.post(`${BASE_URL}/super-admin/workspaces`, {
      name: 'Acme Corp',
      adminName: 'Alice Admin',
      adminEmail: `alice_${Date.now()}@acme.com`,
      adminPassword: 'Pass123!',
    }, {
      headers: { Authorization: `Bearer ${saToken}` },
    });
    const workspaceA = compA.data.data.workspace;
    const adminAInfo = compA.data.data.admin;
    console.log('✅ Workspace A created:', workspaceA.id, '| Admin A:', adminAInfo.email);

    // 4. Super Admin creates Workspace B and Admin B
    console.log('\n4. Creating Workspace B (Beta Corp) via Super Admin API...');
    const compB = await axios.post(`${BASE_URL}/super-admin/workspaces`, {
      name: 'Beta Corp',
      adminName: 'Bob Admin',
      adminEmail: `bob_${Date.now()}@beta.com`,
      adminPassword: 'Pass123!',
    }, {
      headers: { Authorization: `Bearer ${saToken}` },
    });
    const workspaceB = compB.data.data.workspace;
    const adminBInfo = compB.data.data.admin;
    console.log('✅ Workspace B created:', workspaceB.id, '| Admin B:', adminBInfo.email);

    // 5. Admin A Login
    console.log('\n5. Logging in as Admin A...');
    const loginA = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminAInfo.email,
      password: 'Pass123!',
    });
    const tokenA = loginA.data.data.accessToken;

    // 6. Admin B Login
    console.log('   Logging in as Admin B...');
    const loginB = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminBInfo.email,
      password: 'Pass123!',
    });
    const tokenB = loginB.data.data.accessToken;

    // 7. Admin A creates Contact A in Workspace A
    console.log('\n7. Admin A creates Contact A in Workspace A...');
    const contactARes = await axios.post(`${BASE_URL}/contacts`, {
      name: 'Customer A',
      phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: 'customera@gmail.com',
    }, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const contactA = contactARes.data.data;
    console.log('✅ Contact A created:', contactA.id, '| Workspace:', contactA.workspaceId);

    // 8. Admin B creates Contact B in Workspace B
    console.log('\n8. Admin B creates Contact B in Workspace B...');
    const contactBRes = await axios.post(`${BASE_URL}/contacts`, {
      name: 'Customer B',
      phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: 'customerb@gmail.com',
    }, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const contactB = contactBRes.data.data;
    console.log('✅ Contact B created:', contactB.id, '| Workspace:', contactB.workspaceId);

    // 9. SECURITY ISOLATION TEST 1: Admin A attempts to fetch Contact B (from Workspace B)
    console.log('\n9. 🔒 TESTING CROSS-TENANT DATA ACCESS PREVENTED...');
    console.log('   Admin A requesting GET /api/contacts/' + contactB.id + ' (belonging to Workspace B)...');
    try {
      await axios.get(`${BASE_URL}/contacts/${contactB.id}`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      console.error('❌ SECURITY FAILURE: Admin A was able to access Contact B!');
      process.exit(1);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        console.log('✅ SECURITY PASSED: Access denied with HTTP', err.response.status, ':', err.response.data.message);
      } else {
        throw err;
      }
    }

    // 10. SECURITY ISOLATION TEST 2: Admin A lists contacts
    console.log('\n10. Testing Admin A contacts list scoping...');
    const listA = await axios.get(`${BASE_URL}/contacts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const itemsA = listA.data.data.items || listA.data.data;
    const containsBInListA = itemsA.some((c) => c.id === contactB.id);
    if (containsBInListA) {
      console.error('❌ SECURITY FAILURE: Admin A contacts list contains Contact B from Workspace B!');
      process.exit(1);
    } else {
      console.log('✅ SECURITY PASSED: Admin A contacts list contains ONLY Workspace A data!');
    }

    // 11. Company Suspension Test
    console.log('\n11. 🔒 TESTING COMPANY SUSPENSION ENFORCEMENT...');
    console.log('   Super Admin suspending Workspace A...');
    await axios.patch(`${BASE_URL}/super-admin/workspaces/${workspaceA.id}/status`, {
      status: 'SUSPENDED',
    }, {
      headers: { Authorization: `Bearer ${saToken}` },
    });

    console.log('   Admin A attempting API access while workspace is suspended...');
    try {
      await axios.get(`${BASE_URL}/contacts`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      console.error('❌ SUSPENSION FAILURE: Admin A was allowed API access while suspended!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ SUSPENSION ENFORCED: HTTP 403 Forbidden -', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Reactivate Workspace A
    console.log('   Super Admin reactivating Workspace A...');
    await axios.patch(`${BASE_URL}/super-admin/workspaces/${workspaceA.id}/status`, {
      status: 'ACTIVE',
    }, {
      headers: { Authorization: `Bearer ${saToken}` },
    });

    const activeA = await axios.get(`${BASE_URL}/contacts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    console.log('✅ REACTIVATION SUCCESS: Admin A can access API again normally.');

    // 12. Audit Logs Check
    console.log('\n12. Fetching Platform Audit Logs via Super Admin API...');
    const auditLogsRes = await axios.get(`${BASE_URL}/super-admin/audit-logs`, {
      headers: { Authorization: `Bearer ${saToken}` },
    });
    console.log('✅ Audit logs retrieved:', auditLogsRes.data.data.items.length, 'records.');
    auditLogsRes.data.data.items.slice(0, 3).forEach((log) => {
      console.log(`   - [${log.action}] by ${log.actorUser?.name || 'System'} on ${log.targetType} (${log.workspace?.name || 'Global'})`);
    });

    console.log('\n==================================================');
    console.log('🎉 ALL MULTI-TENANT SAAS SECURITY TESTS PASSED 100%!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('Test execution failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

// Execute tests if server is running or spawn server for test
runTests();
