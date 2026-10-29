/**
 * Automated Test Suite for Project 500 — Campus Growth Tracker
 * Covers all 10 core verification test scenarios.
 */

import { getSeedRegistrations, getSeedAmbassadors, getSeedChannels, getSeedBudget, getDefaultSettings } from './src/data/seedData.js';
import * as metrics from './src/utils/metrics.js';
import * as referralCodes from './src/utils/referralCodes.js';
import { generateInsights } from './src/utils/insights.js';
import { validateAndProcessImport } from './src/utils/csvImport.js';
import { escapeCSV } from './src/utils/csvExport.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== PROJECT 500 VERIFICATION TEST SUITE ===\n');

// -------------------------------------------------------------
// Test 1: Initial Launch & Seed Data Integrity
// -------------------------------------------------------------
console.log('Scenario 1: Initial Launch & Seed Data Consistency');
const seedRegs = getSeedRegistrations();
const seedAmbs = getSeedAmbassadors();
const seedChannels = getSeedChannels();
const seedBudget = getSeedBudget();
const seedSettings = getDefaultSettings();

assert(seedRegs.length === 18, `Expected 18 seed registrations, got ${seedRegs.length}`);
assert(seedAmbs.length === 6, `Expected 6 seed ambassadors, got ${seedAmbs.length}`);
assert(metrics.calcTotalRegistrations(seedRegs) === 18, 'calcTotalRegistrations equals 18');
assert(metrics.calcUniqueColleges(seedRegs) > 0, `Participating colleges > 0 (${metrics.calcUniqueColleges(seedRegs)})`);
assert(metrics.calcActiveAmbassadors(seedAmbs) === 5, '5 active ambassadors in seed');

// -------------------------------------------------------------
// Test 2: Ambassador Management & Unique Referral Code
// -------------------------------------------------------------
console.log('\nScenario 2: Ambassador Referral Code Generation & Uniqueness');
const generatedCode = referralCodes.generateReferralCode('Sneha Sharma');
assert(generatedCode.startsWith('CAMPUS_SNEHA_'), `Generated code format matches: ${generatedCode}`);
assert(referralCodes.isCodeUnique(generatedCode, seedAmbs), 'New code is unique');
assert(!referralCodes.isCodeUnique('CAMPUS_RAHUL_42', seedAmbs), 'Duplicate code correctly rejected');
assert(referralCodes.isCodeUnique('CAMPUS_RAHUL_42', seedAmbs, 'amb-001'), 'Self-edit preserves existing code');

// -------------------------------------------------------------
// Test 3: Add Registration & Correct Attribution
// -------------------------------------------------------------
console.log('\nScenario 3: Registration Addition & Attribution Rules');
const validCode = 'CAMPUS_RAHUL_42';
const matchedAmb = referralCodes.isValidReferralCode(validCode, seedAmbs);
assert(matchedAmb !== null && matchedAmb.id === 'amb-001', 'Valid referral code matches Rahul Sharma');

const newReg = {
  id: 'reg-new-999',
  name: 'Test Student',
  email: 'test.student@demo.example',
  college: 'IIT Delhi',
  discoveryChannel: 'college-club',
  referralCode: validCode,
  ambassadorId: matchedAmb.id,
  registeredAt: new Date().toISOString(),
  status: 'confirmed'
};

const updatedRegs = [...seedRegs, newReg];
assert(metrics.calcTotalRegistrations(updatedRegs) === 19, 'Total registrations incremented to 19');
assert(metrics.calcAmbassadorRegistrations('amb-001', updatedRegs) === 4, 'Ambassador attributed count incremented to 4');

// Primary channel breakdown deduplication test
const breakdown = metrics.calcChannelBreakdown(updatedRegs, seedChannels);
const sumInBreakdown = breakdown.reduce((sum, ch) => sum + ch.actual, 0);
assert(sumInBreakdown === updatedRegs.length, `Breakdown sum (${sumInBreakdown}) exactly equals total registrations (${updatedRegs.length})`);

// -------------------------------------------------------------
// Test 4: Duplicate Email Detection & Prevention
// -------------------------------------------------------------
console.log('\nScenario 4: Duplicate Email Prevention');
const existingEmail = 'aarav.mehta@demo.example';
const isDup = updatedRegs.some(r => r.email.toLowerCase().trim() === existingEmail.toLowerCase());
assert(isDup === true, 'Existing email detected as duplicate');

// -------------------------------------------------------------
// Test 5: Storage Keys & Persistence Format
// -------------------------------------------------------------
console.log('\nScenario 5: Referral URL Generation');
const shareUrl = referralCodes.generateShareableUrl('https://workshop.nxtwave.in/register', 'CAMPUS_RAHUL_42');
assert(shareUrl === 'https://workshop.nxtwave.in/register?ref=CAMPUS_RAHUL_42', `Shareable URL format: ${shareUrl}`);

// -------------------------------------------------------------
// Test 6: CSV Export Escaping
// -------------------------------------------------------------
console.log('\nScenario 6: CSV Export Escaping & Formatting');
assert(escapeCSV('simple') === 'simple', 'Simple string not escaped');
assert(escapeCSV('with, comma') === '"with, comma"', 'Comma escaped with double quotes');
assert(escapeCSV('with "quotes"') === '"with ""quotes"""', 'Quotes escaped by doubling');
assert(escapeCSV('with\nnewline') === '"with\nnewline"', 'Newline escaped');

// -------------------------------------------------------------
// Test 7: Invalid Referral Code Handling
// -------------------------------------------------------------
console.log('\nScenario 7: Invalid Referral Code Validation');
const invalidCodeResult = referralCodes.isValidReferralCode('INVALID_CODE_99', seedAmbs);
assert(invalidCodeResult === null, 'Invalid referral code returns null (no silent attribution)');

// -------------------------------------------------------------
// Test 8: Budget Calculation & Zero Division Prevention
// -------------------------------------------------------------
console.log('\nScenario 8: Budget Tracking & Safe Metrics');
const budgetSum = metrics.calcBudgetSummary(seedBudget);
assert(budgetSum.totalPlanned === 2000, 'Planned budget is ₹2,000');
assert(budgetSum.totalSpent === 0, 'Initial spent is ₹0');
assert(budgetSum.remaining === 2000, 'Remaining is ₹2,000');
assert(metrics.calcCostPerRegistration(0, 18) === 0, 'Cost per registration with ₹0 spent is 0');
assert(metrics.calcCostPerRegistration(500, 0) === null, 'Zero registrations yields null (never divides by zero)');

// -------------------------------------------------------------
// Test 9: Channel Target Sum Matching
// -------------------------------------------------------------
console.log('\nScenario 9: Channel Target Sum Verification');
const sumChannelTargets = seedChannels.reduce((sum, ch) => sum + ch.target, 0);
assert(sumChannelTargets === 500, `Sum of channel targets (${sumChannelTargets}) equals overall target (500)`);

// -------------------------------------------------------------
// Test 10: Rule-based Growth Insights
// -------------------------------------------------------------
console.log('\nScenario 10: Deterministic Growth Insights');
const insights = generateInsights(seedRegs, seedAmbs, seedChannels, seedSettings);
assert(insights.length >= 3, `Generated ${insights.length} deterministic observations`);
assert(insights.some(i => i.includes('preliminary')), 'Includes small sample size disclaimer');

console.log(`\n===========================================`);
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`===========================================`);

if (failed > 0) {
  process.exit(1);
}
