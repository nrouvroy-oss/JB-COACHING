-- Bibliothèque d'exercices standard accessible à tous les coachs
-- Les exercices standard ont coach_id = NULL

-- Rendre coach_id nullable pour permettre les exercices standard (sans propriétaire)
ALTER TABLE exercises ALTER COLUMN coach_id DROP NOT NULL;

-- Politique : tous les coachs peuvent VOIR les exercices standard (coach_id IS NULL)
CREATE POLICY "Les coachs voient les exercices standard"
  ON exercises FOR SELECT
  USING (coach_id IS NULL AND is_coach());

-- Politique : les clients voient les exercices standard utilisés dans leurs séances
-- (déjà couvert par les policies existantes qui regardent les séances)

-- Empêcher la suppression/modification des exercices standard par les coachs
-- (seul un admin via service_role pourra les modifier)
