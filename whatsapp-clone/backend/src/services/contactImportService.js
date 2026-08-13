const prisma = require('../config/prismaClient');
const { parse: parseCsv } = require('csv-parse/sync');
const XLSX = require('xlsx');
const { isValidEmail } = require('../utils/validation');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_ROW_COUNT = 10000;

/**
 * Normalize phone number: strip spaces, dashes, parentheses.
 */
function normalizePhone(rawPhone) {
  if (rawPhone === undefined || rawPhone === null) return '';
  const str = String(rawPhone).trim();
  // Remove whitespace, dashes, parens, dots
  return str.replace(/[\s\-\(\)\.]/g, '');
}

/**
 * Validate phone number format (basic usable phone format check)
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Must be 7 to 16 characters, allowing optional leading '+' followed by digits
  const re = /^\+?\d{7,16}$/;
  return re.test(phone);
}

/**
 * Find header key case-insensitively
 */
function findHeaderKey(headers, targetNames) {
  const normalizedHeaders = headers.map(h => String(h || '').trim().toLowerCase().replace(/[\ufeff_]/g, ''));
  for (const name of targetNames) {
    const idx = normalizedHeaders.findIndex(h => h === name.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

/**
 * Parse file buffer into JSON rows and identify headers
 */
function parseFileBuffer(buffer, originalname, mimetype) {
  const ext = (originalname || '').split('.').pop().toLowerCase();
  
  if (ext === 'csv' || mimetype === 'text/csv' || mimetype === 'application/csv') {
    // Parse CSV
    let content = buffer.toString('utf8');
    // Remove UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    const records = parseCsv(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
    return records;
  } else if (ext === 'xlsx' || mimetype.includes('spreadsheetml') || mimetype.includes('excel')) {
    // Parse XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel workbook contains no sheets.');
    }
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    // Convert sheet to JSON using raw: false to format numeric phones as strings
    const records = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
    return records;
  } else {
    const err = new Error('Only CSV (.csv) and XLSX (.xlsx) files are supported.');
    err.status = 400;
    throw err;
  }
}

/**
 * Step 1: Preview contact import from uploaded file buffer
 */
async function previewImport({ buffer, originalname, mimetype, workspaceId }) {
  if (!buffer || buffer.length === 0) {
    const err = new Error('File buffer is empty.');
    err.status = 400;
    throw err;
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    const err = new Error('Maximum file size is 10 MB.');
    err.status = 400;
    throw err;
  }

  const rawRows = parseFileBuffer(buffer, originalname, mimetype);

  // Filter completely empty rows
  const rows = rawRows.filter(row => {
    if (!row || typeof row !== 'object') return false;
    return Object.values(row).some(v => String(v || '').trim().length > 0);
  });

  if (rows.length === 0) {
    const err = new Error('The uploaded file contains no data rows.');
    err.status = 400;
    throw err;
  }

  if (rows.length > MAX_ROW_COUNT) {
    const err = new Error(`Please import a maximum of 10,000 contacts at a time.`);
    err.status = 400;
    throw err;
  }

  // Header Validation
  const sampleRow = rows[0];
  const headers = Object.keys(sampleRow);

  const nameKey = findHeaderKey(headers, ['name', 'full name', 'fullname', 'contact name']);
  const emailKey = findHeaderKey(headers, ['email', 'email address', 'e-mail']);
  const phoneKey = findHeaderKey(headers, ['phone', 'phone number', 'mobile', 'mobile number', 'telephone']);

  if (!nameKey) {
    const err = new Error("Required column 'name' is missing.");
    err.status = 400;
    throw err;
  }
  if (!emailKey) {
    const err = new Error("Required column 'email' is missing.");
    err.status = 400;
    throw err;
  }
  if (!phoneKey) {
    const err = new Error("Required column 'phone' is missing.");
    err.status = 400;
    throw err;
  }

  // Fetch existing contacts for THIS workspace only
  const existingContacts = await prisma.contact.findMany({
    where: { workspaceId },
    select: { phone: true },
  });
  const existingPhonesSet = new Set(existingContacts.map(c => c.phone));
  const seenInFilePhonesSet = new Set();

  let validCount = 0;
  let invalidCount = 0;
  let duplicateInFileCount = 0;
  let alreadyExistsCount = 0;

  const processedRows = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rawName = String(r[nameKey] || '').trim();
    const rawEmail = String(r[emailKey] || '').trim();
    const rawPhone = String(r[phoneKey] || '').trim();
    const normalizedPhoneVal = normalizePhone(rawPhone);

    let status = 'VALID';
    let message = 'Valid';

    // 1. Name validation
    if (!rawName) {
      status = 'INVALID';
      message = 'Name is required';
      invalidCount++;
    }
    // 2. Email validation (if provided)
    else if (rawEmail && !isValidEmail(rawEmail)) {
      status = 'INVALID';
      message = 'Invalid email address';
      invalidCount++;
    }
    // 3. Phone validation
    else if (!rawPhone || !isValidPhone(normalizedPhoneVal)) {
      status = 'INVALID';
      message = 'Invalid phone number';
      invalidCount++;
    }
    // 4. Duplicate in file
    else if (seenInFilePhonesSet.has(normalizedPhoneVal)) {
      status = 'DUPLICATE_FILE';
      message = 'Duplicate phone number in uploaded file';
      duplicateInFileCount++;
    }
    // 5. Existing in current workspace
    else if (existingPhonesSet.has(normalizedPhoneVal)) {
      status = 'ALREADY_EXISTS';
      message = 'Contact already exists in this workspace';
      alreadyExistsCount++;
      seenInFilePhonesSet.add(normalizedPhoneVal);
    }
    else {
      status = 'VALID';
      message = 'Valid';
      validCount++;
      seenInFilePhonesSet.add(normalizedPhoneVal);
    }

    processedRows.push({
      rowNumber: i + 1,
      name: rawName,
      email: rawEmail || null,
      phone: normalizedPhoneVal || rawPhone,
      status,
      message,
    });
  }

  return {
    summary: {
      total: rows.length,
      valid: validCount,
      invalid: invalidCount,
      duplicateInFile: duplicateInFileCount,
      alreadyExists: alreadyExistsCount,
    },
    rows: processedRows,
  };
}

/**
 * Step 2: Final import execution with server-side revalidation
 */
async function executeImport({ contacts = [], workspaceId }) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    const err = new Error('No contacts provided for import.');
    err.status = 400;
    throw err;
  }

  if (contacts.length > MAX_ROW_COUNT) {
    const err = new Error(`Please import a maximum of 10,000 contacts at a time.`);
    err.status = 400;
    throw err;
  }

  // Fetch existing contacts in THIS workspace again
  const existingContacts = await prisma.contact.findMany({
    where: { workspaceId },
    select: { phone: true },
  });
  const existingPhonesSet = new Set(existingContacts.map(c => c.phone));
  const seenInFilePhonesSet = new Set();

  const validDataToInsert = [];
  let invalidCount = 0;
  let duplicateCount = 0;

  for (const item of contacts) {
    const name = String(item.name || '').trim();
    const email = String(item.email || '').trim();
    const rawPhone = String(item.phone || '').trim();
    const phone = normalizePhone(rawPhone);

    if (!name || !phone || !isValidPhone(phone)) {
      invalidCount++;
      continue;
    }
    if (email && !isValidEmail(email)) {
      invalidCount++;
      continue;
    }
    if (seenInFilePhonesSet.has(phone) || existingPhonesSet.has(phone)) {
      duplicateCount++;
      continue;
    }

    seenInFilePhonesSet.add(phone);
    validDataToInsert.push({
      workspaceId,
      name,
      email: email || null,
      phone,
    });
  }

  let importedCount = 0;
  if (validDataToInsert.length > 0) {
    const result = await prisma.contact.createMany({
      data: validDataToInsert,
      skipDuplicates: true,
    });
    importedCount = result.count;
  }

  return {
    total: contacts.length,
    imported: importedCount,
    duplicates: duplicateCount,
    invalid: invalidCount,
  };
}

module.exports = {
  previewImport,
  executeImport,
};
