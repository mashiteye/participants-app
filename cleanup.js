// METSS LBG — Test Data Cleanup Script
// Run this in browser console on: metsslbg-stack.github.io/participants-app/admin.html
// Or open browser console on any app page that has the Supabase client loaded

(async function cleanup() {
  console.log('=== METSS LBG Test Data Cleanup ===\n');

  // Step 1: List all events
  const { data: events } = await db.from('events').select('id, name, event_date').order('created_at');
  console.log('EVENTS FOUND:');
  events.forEach((e, i) => console.log(`  [${i}] ${e.id.slice(0,8)}... | "${e.name}" | ${e.event_date || 'no date'}`));

  // Step 2: Identify test events by name patterns
  const testPatterns = ['test', 'Test', 'TEST', 'kkkdk', 'dummy', 'sample', 'demo'];
  const testEvents = events.filter(e => testPatterns.some(p => e.name.toLowerCase().includes(p.toLowerCase())));

  if (!testEvents.length) {
    console.log('\n✓ No test events found by name pattern.');
    console.log('  Review the list above and delete manually if needed.');
    return;
  }

  console.log('\nTEST EVENTS TO DELETE:');
  testEvents.forEach(e => console.log(`  ✗ "${e.name}" (${e.id.slice(0,8)}...)`));

  // Step 3: Confirm before deleting
  const confirmed = confirm(
    `Delete ${testEvents.length} test event(s) and all their participants?\n\n` +
    testEvents.map(e => `• ${e.name}`).join('\n') +
    '\n\nThis cannot be undone.'
  );
  if (!confirmed) { console.log('\nCancelled.'); return; }

  // Step 4: Delete test events (cascades to participants + attendance via DB)
  for (const e of testEvents) {
    // Delete attendance
    await db.from('attendance').delete().eq('event_id', e.id);
    // Delete participants
    await db.from('participants').delete().eq('event_id', e.id);
    // Delete event
    const { error } = await db.from('events').delete().eq('id', e.id);
    if (error) console.log(`  ✗ Failed to delete "${e.name}": ${error.message}`);
    else console.log(`  ✓ Deleted "${e.name}"`);
  }

  // Step 5: Clean orphan test participants (name patterns)
  const { data: parts } = await db.from('participants').select('id, name, event_id');
  const testNamePatterns = ['kkkdk', 'fight', 'walkingman', 'test', 'dummy', 'asdf', 'aaaa', 'xxxx', 'qqqq'];
  const testParts = parts.filter(p => testNamePatterns.some(pat => p.name.toLowerCase().includes(pat)));

  if (testParts.length) {
    console.log(`\nORPHAN TEST PARTICIPANTS (${testParts.length}):`);
    testParts.forEach(p => console.log(`  ✗ "${p.name}"`));
    const conf2 = confirm(`Also delete ${testParts.length} test participant(s)?`);
    if (conf2) {
      for (const p of testParts) {
        await db.from('attendance').delete().eq('participant_id', p.id);
        await db.from('participants').delete().eq('id', p.id);
        console.log(`  ✓ Deleted participant "${p.name}"`);
      }
    }
  }

  console.log('\n=== Cleanup complete. Refresh the page. ===');
})();
