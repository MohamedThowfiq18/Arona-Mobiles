import { getSupabaseAdminClient, isSupabaseConfigured } from '../lib/supabase/server';

async function testRepairFlow() {
  console.log('========================================================');
  console.log('🔧 TESTING REPAIR BOOKING DATABASE & FLOW');
  console.log('========================================================\n');

  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase is not configured locally or is in mock mode.');
    return;
  }

  const supabase = getSupabaseAdminClient();

  const testPayload = {
    customer_name: 'Mohamed Thowfiq',
    customer_phone: '9876543210',
    phone_brand: 'Apple',
    phone_model: 'iPhone 13 Pro',
    issue_description: 'Front screen cracked, display working normally',
    service_type: 'Screen Replacement',
    service_price: 1499,
    preferred_date_time: new Date(Date.now() + 86400000).toISOString(),
    status: 'pending',
    device_info: {
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      issue: 'Front screen cracked, display working normally',
      customer_name: 'Mohamed Thowfiq',
      customer_phone: '9876543210',
    },
    scheduled_slot: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log('1. Inserting new test repair booking...');
  const { data: inserted, error: insertErr } = await supabase
    .from('repair_bookings')
    .insert(testPayload)
    .select('*')
    .single();

  if (insertErr) {
    console.error('❌ Insert failed:', insertErr.message);
    throw insertErr;
  }

  console.log('   ✓ Booking inserted successfully. ID:', inserted.id);

  console.log('\n2. Fetching booking from database...');
  const { data: fetched, error: fetchErr } = await supabase
    .from('repair_bookings')
    .select('*')
    .eq('id', inserted.id)
    .single();

  if (fetchErr || !fetched) {
    console.error('❌ Fetch failed:', fetchErr?.message);
    throw fetchErr;
  }

  console.log('   ✓ Fetched booking:', {
    id: fetched.id,
    customer: fetched.customer_name || fetched.device_info?.customer_name,
    phone: fetched.customer_phone || fetched.device_info?.customer_phone,
    device: `${fetched.phone_brand || fetched.device_info?.brand} ${fetched.phone_model || fetched.device_info?.model}`,
    service: fetched.service_type,
    status: fetched.status,
  });

  console.log('\n3. Testing owner status update (pending -> confirmed)...');
  const { data: updated, error: updateErr } = await supabase
    .from('repair_bookings')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', inserted.id)
    .select('*')
    .single();

  if (updateErr || !updated || updated.status !== 'confirmed') {
    console.error('❌ Status update failed:', updateErr?.message);
    throw updateErr;
  }

  console.log('   ✓ Status updated to:', updated.status);

  console.log('\n4. Cleaning up test record...');
  const { error: deleteErr } = await supabase
    .from('repair_bookings')
    .delete()
    .eq('id', inserted.id);

  if (deleteErr) {
    console.warn('⚠️ Cleanup delete error:', deleteErr.message);
  } else {
    console.log('   ✓ Test record cleaned up.');
  }

  console.log('\n========================================================');
  console.log('🎉 REPAIR BOOKING DATABASE LIFECYCLE VERIFIED!');
  console.log('========================================================\n');
}

testRepairFlow().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
