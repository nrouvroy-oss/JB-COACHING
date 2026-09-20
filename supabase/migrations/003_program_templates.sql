-- Rendre client_id optionnel pour permettre les programmes templates (sans client)
ALTER TABLE programs ALTER COLUMN client_id DROP NOT NULL;
