-- Ajoute des champs texte libre sur les séances pour les instructions et la récupération
-- Permet à JB de décrire ses séances en texte (circuits, Tabata, intervalles...)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS details TEXT DEFAULT '';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS recovery TEXT DEFAULT '';
