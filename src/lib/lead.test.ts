import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLead } from './lead';

const ok = { businessName: 'Test Barber Shop', businessType: 'Barbershop', phone: '(512) 555-0134', email: 'Owner@Example.com', link: '', language: 'en' };

test('accepts a valid lead and normalizes it', () => {
  const r = validateLead(ok);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.lead.phone, '5125550134');
    assert.equal(r.lead.email, 'owner@example.com');
    assert.equal(r.lead.link, null);
  }
});

test('accepts +1 phone numbers, @handles, and bare domains', () => {
  for (const link of ['@mybarber', 'instagram.com/mybarber', 'https://maps.app.goo.gl/abc']) {
    const r = validateLead({ ...ok, phone: '+1 512 555 0134', link });
    assert.ok(r.ok, link);
  }
});

test('rejects each bad field with its own error', () => {
  const r = validateLead({ businessName: 'x', businessType: 'Dentist', phone: '555', email: 'nope', link: 'not a link', language: 'fr' });
  assert.ok(!r.ok);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ['businessName', 'businessType', 'email', 'language', 'link', 'phone']);
});
