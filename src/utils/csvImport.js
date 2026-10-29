/**
 * Project 500 — Campus Growth Tracker
 * CSV Import parser and validator for bulk registrations.
 */

import { generateId } from './idGenerator.js';
import { isValidReferralCode } from './referralCodes.js';

export function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentField = '';

  const cleanText = text.replace(/^\uFEFF/, ''); // strip BOM if present

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentField.trim());
      if (row.length > 0 && row.some(f => f.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || row.length > 0) {
    row.push(currentField.trim());
    if (row.some(f => f.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

export function validateAndProcessImport(csvText, existingRegistrations, ambassadors) {
  const parsed = parseCSV(csvText);

  if (parsed.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.');
  }

  const rawHeaders = parsed[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Find column indexes
  const nameIdx = rawHeaders.findIndex(h => h.includes('name'));
  const emailIdx = rawHeaders.findIndex(h => h.includes('email'));
  const collegeIdx = rawHeaders.findIndex(h => h.includes('college') || h.includes('campus'));
  const channelIdx = rawHeaders.findIndex(h => h.includes('channel') || h.includes('source') || h.includes('discovery'));
  const codeIdx = rawHeaders.findIndex(h => h.includes('referral') || h.includes('code') || h.includes('ref'));

  if (nameIdx === -1 || emailIdx === -1 || collegeIdx === -1) {
    throw new Error('CSV must contain "Name", "Email", and "College" columns.');
  }

  const existingEmails = new Set(
    existingRegistrations
      .map(r => r.email?.toLowerCase().trim())
      .filter(Boolean)
  );

  const seenInFileEmails = new Set();
  const valid = [];
  const duplicates = [];
  const invalid = [];

  const dataRows = parsed.slice(1);

  dataRows.forEach((row, index) => {
    const rowNum = index + 2;
    const name = (row[nameIdx] || '').trim();
    const rawEmail = (row[emailIdx] || '').trim();
    const college = (row[collegeIdx] || '').trim();
    const rawChannel = channelIdx !== -1 ? (row[channelIdx] || '').trim().toLowerCase() : '';
    const rawCode = codeIdx !== -1 ? (row[codeIdx] || '').trim().toUpperCase() : '';

    if (!name || !rawEmail || !college) {
      invalid.push({
        row: rowNum,
        reason: 'Missing required field (Name, Email, or College).',
        data: row
      });
      return;
    }

    const email = rawEmail.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      invalid.push({
        row: rowNum,
        reason: `Invalid email format: "${rawEmail}".`,
        data: row
      });
      return;
    }

    if (existingEmails.has(email) || seenInFileEmails.has(email)) {
      duplicates.push({
        row: rowNum,
        email,
        name,
        reason: existingEmails.has(email) ? 'Already registered in system' : 'Duplicate within import file'
      });
      return;
    }

    seenInFileEmails.add(email);

    // Channel mapping
    let discoveryChannel = 'college-club';
    if (rawChannel.includes('whats') || rawChannel.includes('wa')) {
      discoveryChannel = 'whatsapp';
    } else if (rawChannel.includes('link') || rawChannel.includes('li')) {
      discoveryChannel = 'linkedin';
    } else if (rawChannel.includes('other') || rawChannel.includes('direct')) {
      discoveryChannel = 'other';
    } else if (rawChannel.includes('club') || rawChannel.includes('ambass') || rawChannel.includes('campus')) {
      discoveryChannel = 'college-club';
    }

    // Referral code attribution
    let referralCode = '';
    let ambassadorId = '';
    if (rawCode) {
      const matched = isValidReferralCode(rawCode, ambassadors);
      if (matched) {
        referralCode = rawCode;
        ambassadorId = matched.id;
      }
    }

    valid.push({
      id: generateId(),
      name,
      email,
      college,
      discoveryChannel,
      referralCode,
      ambassadorId,
      registeredAt: new Date().toISOString(),
      status: 'confirmed'
    });
  });

  return {
    valid,
    duplicates,
    invalid,
    totalRows: dataRows.length
  };
}
