insert into public.categories (slug, name, description) values
  ('groceries', 'Groceries', 'Food, pantry staples, produce, and prepared meals'),
  ('housing', 'Housing', 'Rent, deposits, repairs, and short-term housing help'),
  ('utilities', 'Utilities', 'Electric, water, gas, and home energy costs'),
  ('transportation', 'Transportation', 'Bus fares, rides, fuel, bicycles, and car costs'),
  ('healthcare', 'Healthcare', 'Clinics, prescriptions, dental care, and screenings'),
  ('childcare', 'Childcare', 'Daycare, after-school care, and early learning'),
  ('clothing', 'Clothing', 'Everyday clothing, workwear, uniforms, and shoes'),
  ('internet-phone', 'Internet and phone', 'Home internet, mobile service, and connected devices')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.locations (id, address, city, state, zip, latitude, longitude) values
  ('loc-01', '1202 N Franklin St', 'Tampa', 'FL', '33602', 27.9631, -82.4591),
  ('loc-02', '2506 W Columbus Dr', 'Tampa', 'FL', '33607', 27.9669, -82.4869),
  ('loc-03', '3408 E Lake Ave', 'Tampa', 'FL', '33610', 27.9783, -82.4218),
  ('loc-04', '4702 S MacDill Ave', 'Tampa', 'FL', '33611', 27.8997, -82.4938),
  ('loc-05', '11250 N 56th St', 'Temple Terrace', 'FL', '33617', 28.0504, -82.3934),
  ('loc-06', '2108 E Fowler Ave', 'Tampa', 'FL', '33612', 28.0547, -82.4347),
  ('loc-07', '510 W Brandon Blvd', 'Brandon', 'FL', '33511', 27.9376, -82.2927),
  ('loc-08', '7601 Paula Dr', 'Tampa', 'FL', '33615', 28.0092, -82.5707),
  ('loc-09', '1901 N 13th St', 'Tampa', 'FL', '33605', 27.9601, -82.4441),
  ('loc-10', '11604 N Dale Mabry Hwy', 'Tampa', 'FL', '33618', 28.0513, -82.5046),
  ('loc-11', '10509 Riverview Dr', 'Riverview', 'FL', '33578', 27.8676, -82.3265),
  ('loc-12', '6111 N Central Ave', 'Tampa', 'FL', '33604', 28.0045, -82.4557)
on conflict (id) do update set address = excluded.address, city = excluded.city, state = excluded.state, zip = excluded.zip, latitude = excluded.latitude, longitude = excluded.longitude;

with resource_seed(id, category_slug, location_id, organization_name, description, phone, website, service_name, eligibility, is_free, is_discounted, online_available) as (
  values
    ('resource-01', 'groceries', 'loc-01', 'Harbor Table Food Market', 'Sample choice-style food pantry with produce and staple groceries.', '(813) 555-0101', 'https://example.org/harbor-table', 'Choice pantry', 'Sample service-area and supply guidelines may apply.', true, false, false),
    ('resource-02', 'groceries', 'loc-02', 'Westside Community Fridge Network', 'Sample outdoor community refrigerators stocked by neighbors.', '(813) 555-0102', 'https://example.org/westside-fridge', 'Community refrigerator', 'Sample listing is open while supplies last.', true, false, false),
    ('resource-03', 'groceries', 'loc-03', 'Family Harvest Mobile Pantry', 'Sample mobile pantry with rotating neighborhood stops.', '(813) 555-0103', 'https://example.org/family-harvest', 'Mobile food distribution', 'Sample service-area rules may apply.', true, false, true),
    ('resource-04', 'housing', 'loc-04', 'Bridgeway Rent Support', 'Sample short-term rent and move-in assistance.', '(813) 555-0201', 'https://example.org/bridgeway-rent', 'Rent assistance', 'Funding, income, and lease requirements may apply.', true, false, true),
    ('resource-05', 'housing', 'loc-05', 'Safe Roof Repair Collaborative', 'Sample minor home safety repair program.', '(813) 555-0202', 'https://example.org/safe-roof', 'Home repair', 'Homeownership and income rules may apply.', false, true, true),
    ('resource-06', 'housing', 'loc-06', 'New Day Housing Hotline', 'Sample shelter and rapid-rehousing navigation line.', '(813) 555-0203', 'https://example.org/new-day-housing', 'Housing hotline', 'Programs have separate requirements and space is not guaranteed.', true, false, true),
    ('resource-07', 'utilities', 'loc-07', 'Sunline Energy Relief', 'Sample electric bill assistance application support.', '(813) 555-0301', 'https://example.org/sunline-energy', 'Electric bill assistance', 'Income, household, account, and funding rules may apply.', true, false, true),
    ('resource-08', 'utilities', 'loc-08', 'Clearwater Water Help Desk', 'Sample water payment plans and limited bill credits.', '(813) 555-0302', 'https://example.org/water-help', 'Water bill help', 'An eligible residential account may be required.', false, true, true),
    ('resource-09', 'utilities', 'loc-03', 'Comfort First Weatherization', 'Sample home energy assessment and efficiency improvements.', '(813) 555-0303', 'https://example.org/comfort-first', 'Weatherization', 'Income and housing-type requirements may apply.', true, false, true),
    ('resource-10', 'transportation', 'loc-09', 'Move Tampa Fare Access', 'Sample reduced-fare bus pass and travel training desk.', '(813) 555-0401', 'https://example.org/fare-access', 'Reduced bus fare', 'Fare-specific eligibility documentation may be required.', false, true, true),
    ('resource-11', 'transportation', 'loc-12', 'Wheels to Work Cooperative', 'Sample donated bicycles and repair classes.', '(813) 555-0402', 'https://example.org/wheels-work', 'Bicycle matching', 'Priority guidelines and supply limits may apply.', true, false, false),
    ('resource-12', 'transportation', 'loc-10', 'NeighborRide Essential Trips', 'Sample scheduled rides for essential errands.', '(813) 555-0403', 'https://example.org/neighbor-ride', 'Essential rides', 'Trip purpose and service-area rules may apply.', false, true, true),
    ('resource-13', 'healthcare', 'loc-01', 'Common Ground Free Clinic', 'Sample primary care and prescription navigation clinic.', '(813) 555-0501', 'https://example.org/common-ground-clinic', 'Primary care', 'Clinical and income screening may apply.', true, false, true),
    ('resource-14', 'healthcare', 'loc-06', 'Bright Smile Community Dental', 'Sample sliding-scale dental exams and treatment.', '(813) 555-0502', 'https://example.org/bright-smile', 'Dental care', 'Fees and treatment depend on intake and exam.', false, true, true),
    ('resource-15', 'healthcare', 'loc-11', 'Open Door Wellness Van', 'Sample mobile screenings and vaccine events.', '(813) 555-0503', 'https://example.org/wellness-van', 'Mobile screening', 'Services vary by event and supply.', true, false, true),
    ('resource-16', 'childcare', 'loc-07', 'Growing Steps Childcare Scholarship', 'Sample childcare subsidy application support.', '(813) 555-0601', 'https://example.org/growing-steps', 'Childcare subsidy', 'Work, school, income, age, and residency rules may apply.', false, true, true),
    ('resource-17', 'childcare', 'loc-03', 'After Three Learning Club', 'Sample weekday after-school care and homework help.', '(813) 555-0602', 'https://example.org/after-three', 'After-school care', 'School partnership and space limits may apply.', false, true, false),
    ('resource-18', 'childcare', 'loc-05', 'Family Circle Respite Exchange', 'Sample volunteer respite and caregiver groups.', '(813) 555-0603', 'https://example.org/respite-exchange', 'Respite care', 'Intake, safety planning, and volunteer availability apply.', true, false, true),
    ('resource-19', 'clothing', 'loc-02', 'First Thread Clothing Room', 'Sample private-appointment clothing room.', '(813) 555-0701', 'https://example.org/first-thread', 'Family clothing', 'Item limits depend on donations.', true, false, true),
    ('resource-20', 'clothing', 'loc-09', 'Ready for Work Wardrobe', 'Sample interview and first-week work clothing.', '(813) 555-0702', 'https://example.org/work-wardrobe', 'Work clothing', 'Interview, job, or referral details may be requested.', true, false, true),
    ('resource-21', 'clothing', 'loc-11', 'School Closet Partnership', 'Sample uniforms and backpacks through schools.', '(813) 555-0703', 'https://example.org/school-closet', 'School uniforms', 'Participation and supply rules may apply.', true, false, false),
    ('resource-22', 'internet-phone', 'loc-08', 'Connected Home Navigator', 'Sample low-cost internet plan application support.', '(813) 555-0801', 'https://example.org/connected-home', 'Internet enrollment help', 'Provider discount rules may apply.', true, true, true),
    ('resource-23', 'internet-phone', 'loc-01', 'Call & Connect Lifeline Desk', 'Sample federal discount enrollment support.', '(813) 555-0802', 'https://example.org/call-connect', 'Lifeline application help', 'The program makes all eligibility decisions.', false, true, true),
    ('resource-24', 'internet-phone', 'loc-12', 'Library Hotspot Lending Lab', 'Sample hotspot loans and public computers.', '(813) 555-0803', 'https://example.org/hotspot-lab', 'Hotspot loans', 'Library card and device availability rules may apply.', true, false, true)
)
insert into public.assistance_resources (
  id, category_slug, location_id, organization_name, description, phone, website,
  hours, services, eligibility, required_documents, languages, application_instructions,
  last_verified, verification_status, is_sample, is_free, is_discounted,
  transit_accessible, online_available, is_published, tags
)
select
  id, category_slug, location_id, organization_name, description, phone, website,
  array['Monday–Friday, call for current hours'], array[service_name], eligibility,
  array['Photo ID if available', 'Proof of address', 'Call to confirm other documents'],
  array['English', 'Spanish'],
  'Call before visiting to confirm hours, availability, eligibility guidelines, and documents. This sample listing does not determine eligibility.',
  date '2026-06-15', 'sample', true, is_free, is_discounted, true, online_available, true,
  regexp_split_to_array(lower(service_name), '\s+')
from resource_seed
on conflict (id) do update set
  organization_name = excluded.organization_name,
  description = excluded.description,
  verification_status = 'sample',
  is_sample = true,
  is_published = true;

with alternative_seed(id, category_slug, location_id, title, provider, price, quantity, unit, comparison_label, comparison_price, comparison_quantity, monthly_uses, is_free, is_discounted, online_available) as (
  values
    ('alternative-01', 'groceries', 'loc-02', 'Store-brand old-fashioned oats', 'Neighborhood Value Market', 3.98, 42, 'oz', 'Name-brand oats', 5.99, 42, 1, false, true, false),
    ('alternative-02', 'groceries', 'loc-01', 'Dry beans instead of canned beans', 'Bulk aisle', 1.49, 42, 'cooked oz', 'Four cans of beans', 4.76, 60, 1, false, false, true),
    ('alternative-03', 'groceries', 'loc-03', 'Seasonal produce box', 'Tampa Co-op Pickup', 18, 12, 'items', 'Similar produce bought separately', 27, 12, 4, false, true, true),
    ('alternative-04', 'housing', null, 'Roommate-matching through a nonprofit', 'Shared Home Network', 825, 1, 'month', 'Typical one-bedroom rent', 1450, 1, 1, false, true, true),
    ('alternative-05', 'housing', 'loc-07', 'Free home energy and safety check', 'County Housing Workshop', 0, 1, 'visit', 'Basic private home inspection consult', 125, 1, 0.25, true, false, true),
    ('alternative-06', 'housing', null, 'Tenant repair-letter toolkit', 'Community Legal Library', 0, 1, 'toolkit', 'One hour of general document help', 75, 1, 0.25, true, false, true),
    ('alternative-07', 'utilities', 'loc-01', 'Library energy-use meter loan', 'City Library of Things', 0, 1, 'loan', 'Retail energy-use meter', 29.99, 1, 0.17, true, false, true),
    ('alternative-08', 'utilities', 'loc-04', 'High-efficiency LED four-pack', 'Neighborhood Hardware Co-op', 7.49, 4, 'bulbs', 'Four incandescent bulbs plus energy use', 15.20, 4, 0.25, false, true, true),
    ('alternative-09', 'utilities', null, 'Level billing plan', 'Utility account option', 138, 1, 'month', 'Typical peak-season bill', 205, 1, 1, false, false, true),
    ('alternative-10', 'transportation', 'loc-01', '31-day local bus pass', 'Regional Transit Demo', 65, 31, 'days', 'Two daily single fares', 130, 31, 1, false, true, true),
    ('alternative-11', 'transportation', 'loc-02', 'Refurbished commuter bicycle', 'Community Bike Shop', 115, 1, 'bike', 'Entry-level new commuter bicycle', 320, 1, 0.08, false, true, false),
    ('alternative-12', 'transportation', null, 'Public carpool matching', 'Commute Together', 0, 20, 'trips', 'Twenty solo rideshare trips', 360, 20, 1, true, false, true),
    ('alternative-13', 'healthcare', 'loc-10', 'Generic 90-day prescription', 'Participating pharmacy sample', 18, 90, 'tablets', 'Three 30-day brand fills', 96, 90, 0.33, false, true, true),
    ('alternative-14', 'healthcare', 'loc-03', 'Community health center visit', 'Sliding-scale clinic sample', 35, 1, 'visit', 'Typical self-pay urgent care visit', 165, 1, 0.5, false, true, true),
    ('alternative-15', 'healthcare', 'loc-01', 'Public-library telehealth room', 'Library Connect Room', 0, 1, 'session', 'Basic mobile data and private room rental', 24, 1, 1, true, false, true),
    ('alternative-16', 'childcare', 'loc-04', 'Parks department after-school program', 'City Recreation Center', 145, 20, 'days', 'Private after-school care', 360, 20, 1, false, true, true),
    ('alternative-17', 'childcare', 'loc-02', 'Parent co-op care exchange', 'Neighborhood Family Exchange', 10, 8, 'hours', 'Eight hours of babysitting', 144, 8, 2, false, true, true),
    ('alternative-18', 'childcare', 'loc-07', 'Free library early-learning sessions', 'County Library', 0, 8, 'sessions', 'Eight private enrichment sessions', 160, 8, 1, true, false, true),
    ('alternative-19', 'clothing', 'loc-02', 'Quality resale work shirts', 'Second Season Resale', 18, 3, 'shirts', 'Three new basic work shirts', 60, 3, 0.33, false, true, false),
    ('alternative-20', 'clothing', 'loc-03', 'Community clothing swap', 'Swap Saturday', 0, 5, 'items', 'Five low-cost new basics', 55, 5, 0.25, true, false, false),
    ('alternative-21', 'clothing', 'loc-01', 'Repair kit and mending workshop', 'Fix-It Commons', 8, 10, 'repairs', 'Ten replacement basic garments', 120, 10, 0.2, false, true, true),
    ('alternative-22', 'internet-phone', null, 'Low-cost prepaid mobile plan', 'Community Wireless Sample', 25, 1, 'month', 'Typical single-line postpaid plan', 65, 1, 1, false, true, true),
    ('alternative-23', 'internet-phone', 'loc-01', 'Library Wi-Fi and computer access', 'County Library', 0, 20, 'sessions', 'One month of basic home internet', 55, 20, 1, true, false, false),
    ('alternative-24', 'internet-phone', 'loc-10', 'Refurbished unlocked smartphone', 'Device Reuse Cooperative', 129, 1, 'phone', 'New midrange smartphone', 399, 1, 0.04, false, true, true)
)
insert into public.alternatives (
  id, category_slug, location_id, title, provider, description, price, quantity, unit,
  comparison_label, comparison_price, comparison_quantity, monthly_uses, tradeoffs,
  is_free, is_discounted, transit_accessible, online_available, is_sample, is_published, tags
)
select
  id, category_slug, location_id, title, provider,
  'Sample lower-cost option for local development. Confirm real prices and availability.',
  price, quantity, unit, comparison_label, comparison_price, comparison_quantity, monthly_uses,
  'This is a sample comparison. Convenience, quality, timing, accessibility, and final cost may differ.',
  is_free, is_discounted, location_id is not null, online_available, true, true,
  regexp_split_to_array(lower(title), '\s+')
from alternative_seed
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  comparison_price = excluded.comparison_price,
  is_sample = true,
  is_published = true;
