-- Tam adres (GPS koordinatından çözümlenir, admin haritada gösterilir)
ALTER TABLE location_sessions ADD COLUMN last_address TEXT;
