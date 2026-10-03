-- Ajout de champs supplémentaires aux exercices pour le coaching multi-disciplines
-- + remplacement de la bibliothèque de démarrage

-- Nouveaux champs
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT '';

-- Supprimer les anciens exercices standard (coach_id IS NULL)
DELETE FROM exercises WHERE coach_id IS NULL;

-- Insérer les 25 exercices de la bibliothèque de démarrage (vidéos YMove)
INSERT INTO exercises (name, category, description, equipment, muscle_group, coach_id) VALUES
('Squat barre', 'Renforcement', 'Barre sur les trapèzes, descendez en gardant le dos droit et les genoux alignés.', 'Barre', 'Quadriceps, Fessiers', NULL),
('Développé couché', 'Haut du corps', 'Allongé sur un banc, poussez la barre vers le haut en gardant les pieds au sol.', 'Barre, Banc', 'Pectoraux, Triceps', NULL),
('Soulevé de terre', 'Renforcement', 'Pieds largeur hanches, saisissez la barre et levez-vous en poussant le sol, dos droit.', 'Barre', 'Dos, Ischio-jambiers, Fessiers', NULL),
('Élévations latérales', 'Haut du corps', 'Debout, montez les haltères sur les côtés jusqu''à hauteur d''épaules.', 'Haltères', 'Épaules', NULL),
('Curl marteau', 'Haut du corps', 'Paumes face à face, fléchissez les avant-bras en gardant les coudes fixes.', 'Haltères', 'Biceps, Avant-bras', NULL),
('Rowing barre', 'Haut du corps', 'Penché à 45°, tirez la barre vers le nombril en serrant les omoplates.', 'Barre', 'Dos, Biceps', NULL),
('Rowing renegade', 'Full body', 'En position de pompe avec haltères, tirez alternativement un haltère vers la hanche.', 'Haltères', 'Dos, Core', NULL),
('Kettlebell swing', 'Full body', 'Balancez le kettlebell entre les jambes puis projetez-le à hauteur d''épaules avec les hanches.', 'Kettlebell', 'Fessiers, Ischio-jambiers, Core', NULL),
('Développé militaire', 'Haut du corps', 'Debout ou assis, poussez la barre ou les haltères au-dessus de la tête.', 'Barre ou Haltères', 'Épaules, Triceps', NULL),
('Hip thrust barre', 'Bas du corps', 'Dos contre un banc, barre sur les hanches, poussez les hanches vers le haut.', 'Barre, Banc', 'Fessiers', NULL),
('Dumbbell snatch', 'Full body', 'Arraché avec haltère : soulevez l''haltère du sol au-dessus de la tête en un mouvement explosif.', 'Haltère', 'Épaules, Jambes, Core', NULL),
('Tirage vertical prise neutre', 'Haut du corps', 'À la poulie haute avec prise neutre, tirez vers la poitrine en serrant les omoplates.', 'Poulie', 'Dos, Biceps', NULL),
('Rowing poulie assis', 'Haut du corps', 'Assis face à la poulie basse, tirez la poignée vers le ventre en gardant le dos droit.', 'Poulie', 'Dos, Biceps', NULL),
('Pec deck / butterfly', 'Haut du corps', 'Assis sur la machine, rapprochez les bras devant la poitrine en contrôlant le mouvement.', 'Machine', 'Pectoraux', NULL),
('Développé incliné machine', 'Haut du corps', 'Sur la machine inclinée, poussez les poignées vers le haut.', 'Machine', 'Pectoraux, Épaules', NULL),
('Extension triceps poulie', 'Haut du corps', 'Face à la poulie haute, poussez la barre vers le bas en gardant les coudes fixes.', 'Poulie', 'Triceps', NULL),
('Extension triceps corde au-dessus de la tête', 'Haut du corps', 'Dos à la poulie, poussez la corde au-dessus de la tête en tendant les bras.', 'Poulie, Corde', 'Triceps', NULL),
('Curl biceps machine', 'Haut du corps', 'Assis sur la machine, fléchissez les avant-bras en isolant les biceps.', 'Machine', 'Biceps', NULL),
('Curl biceps poulie haute', 'Haut du corps', 'Face aux poulies hautes, fléchissez les bras en ramenant les mains vers les oreilles.', 'Poulie', 'Biceps', NULL),
('Leg extension', 'Bas du corps', 'Assis sur la machine, tendez les jambes pour travailler les quadriceps.', 'Machine', 'Quadriceps', NULL),
('Hack squat', 'Bas du corps', 'Sur la machine hack squat, descendez en contrôlant et poussez pour remonter.', 'Machine', 'Quadriceps, Fessiers', NULL),
('Leg curl couché', 'Bas du corps', 'Allongé sur la machine, fléchissez les jambes pour travailler les ischio-jambiers.', 'Machine', 'Ischio-jambiers', NULL),
('Kickback fessier machine', 'Bas du corps', 'Sur la machine, poussez la jambe vers l''arrière en serrant le fessier.', 'Machine', 'Fessiers', NULL),
('Reverse fly machine', 'Haut du corps', 'Assis face à la machine, écartez les bras vers l''arrière pour cibler les deltoïdes postérieurs.', 'Machine', 'Épaules, Dos', NULL),
('Woodchop poulie', 'Core', 'À la poulie, faites une rotation du buste en tirant la poignée de haut en bas ou inversement.', 'Poulie', 'Obliques, Core', NULL);
