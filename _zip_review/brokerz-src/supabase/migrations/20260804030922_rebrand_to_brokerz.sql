/*
# Rebrand: Tickmill → BROKERZ

## Overview
Updates all site_settings and admin_users from "Tickmill" to "BROKERZ" branding.

## Changes
- site_settings: site_name → "BROKERZ", site_tagline updated, support_email updated
- admin_users: admin email updated to admin@brokerz.com
- traders: demo trader email updated
*/

UPDATE site_settings SET value = 'BROKERZ' WHERE key = 'site_name';
UPDATE site_settings SET value = 'Trade Smart. Trade BROKERZ.' WHERE key = 'site_tagline';
UPDATE site_settings SET value = 'support@brokerz.com' WHERE key = 'support_email';

UPDATE admin_users SET email = 'admin@brokerz.com' WHERE email = 'admin@tickmill.com';

UPDATE traders SET email = 'trader@brokerz.com' WHERE email = 'trader@demo.com';
