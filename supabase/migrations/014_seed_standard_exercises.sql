-- Insertion des exercices standard — bibliothèque de base accessible à tous les coachs
-- coach_id = NULL = exercice standard
-- Les vidéos seront ajoutées manuellement via le dashboard Supabase

-- === HAUT DU CORPS ===
INSERT INTO exercises (name, category, description, coach_id) VALUES
('Développé couché', 'Haut du corps', 'Allongé sur un banc, poussez la barre vers le haut en gardant les pieds au sol et le dos légèrement cambré.', NULL),
('Développé incliné haltères', 'Haut du corps', 'Sur banc incliné à 30-45°, poussez les haltères vers le haut en rapprochant les mains en haut du mouvement.', NULL),
('Pompes', 'Haut du corps', 'Corps gainé, descendez la poitrine vers le sol en pliant les coudes, puis poussez pour remonter.', NULL),
('Pompes diamant', 'Haut du corps', 'Mains rapprochées sous la poitrine formant un losange, cible les triceps.', NULL),
('Rowing haltère', 'Haut du corps', 'Un genou et une main sur le banc, tirez l''haltère vers la hanche en serrant l''omoplate.', NULL),
('Rowing barre', 'Haut du corps', 'Penché à 45°, tirez la barre vers le nombril en gardant le dos droit.', NULL),
('Tirage vertical (lat pulldown)', 'Haut du corps', 'Assis à la poulie haute, tirez la barre vers la poitrine en serrant les omoplates.', NULL),
('Tractions', 'Haut du corps', 'Suspendez-vous à la barre, tirez le menton au-dessus de la barre en serrant le dos.', NULL),
('Développé militaire', 'Haut du corps', 'Debout ou assis, poussez la barre ou les haltères au-dessus de la tête.', NULL),
('Élévations latérales', 'Haut du corps', 'Debout, montez les haltères sur les côtés jusqu''à hauteur d''épaules, coudes légèrement fléchis.', NULL),
('Curl biceps haltères', 'Haut du corps', 'Debout, fléchissez les avant-bras en gardant les coudes fixes le long du corps.', NULL),
('Curl marteau', 'Haut du corps', 'Comme le curl classique mais paumes face à face, travaille le brachial et l''avant-bras.', NULL),
('Extensions triceps poulie', 'Haut du corps', 'Face à la poulie haute, poussez la barre vers le bas en gardant les coudes fixes.', NULL),
('Dips', 'Haut du corps', 'Sur barres parallèles, descendez le corps en pliant les coudes puis poussez pour remonter.', NULL),
('Face pull', 'Haut du corps', 'À la poulie, tirez la corde vers le visage en écartant les mains, cible les deltoïdes postérieurs.', NULL),

-- === BAS DU CORPS ===
('Squat barre', 'Bas du corps', 'Barre sur les trapèzes, descendez les fesses en arrière en gardant le dos droit et les genoux alignés.', NULL),
('Squat goblet', 'Bas du corps', 'Haltère ou kettlebell tenu contre la poitrine, descendez en squat profond.', NULL),
('Fentes avant', 'Bas du corps', 'Faites un grand pas en avant et descendez le genou arrière vers le sol, puis revenez.', NULL),
('Fentes marchées', 'Bas du corps', 'Enchaînez les fentes en avançant à chaque répétition.', NULL),
('Soulevé de terre', 'Bas du corps', 'Pieds largeur hanches, saisissez la barre et levez-vous en poussant le sol, dos droit.', NULL),
('Soulevé de terre roumain', 'Bas du corps', 'Jambes quasi tendues, descendez la barre le long des cuisses en poussant les fesses en arrière.', NULL),
('Hip thrust', 'Bas du corps', 'Dos contre un banc, barre sur les hanches, poussez les hanches vers le haut en serrant les fessiers.', NULL),
('Presse à cuisses', 'Bas du corps', 'Sur la machine, poussez la plateforme en gardant le dos plaqué et les pieds largeur épaules.', NULL),
('Leg curl', 'Bas du corps', 'Allongé ou assis sur la machine, fléchissez les jambes pour travailler les ischio-jambiers.', NULL),
('Leg extension', 'Bas du corps', 'Assis sur la machine, tendez les jambes pour travailler les quadriceps.', NULL),
('Mollets debout', 'Bas du corps', 'Debout sur une marche, montez sur la pointe des pieds puis redescendez lentement.', NULL),
('Bulgarian split squat', 'Bas du corps', 'Pied arrière sur un banc, descendez en fente sur la jambe avant.', NULL),

-- === ABDOMINAUX ===
('Crunch', 'Abdominaux', 'Allongé, pieds au sol, décollez les épaules en contractant les abdominaux.', NULL),
('Planche (gainage)', 'Abdominaux', 'En appui sur les avant-bras et les orteils, maintenez le corps droit et gainé.', NULL),
('Planche latérale', 'Abdominaux', 'En appui sur un avant-bras, maintenez le corps aligné sur le côté.', NULL),
('Mountain climbers', 'Abdominaux', 'En position de pompe, ramenez alternativement les genoux vers la poitrine rapidement.', NULL),
('Relevé de jambes', 'Abdominaux', 'Allongé ou suspendu à la barre, montez les jambes tendues à l''horizontale.', NULL),
('Russian twist', 'Abdominaux', 'Assis, dos incliné, faites pivoter le buste de gauche à droite avec ou sans poids.', NULL),
('Ab wheel (roue abdominale)', 'Abdominaux', 'À genoux, roulez la roue vers l''avant en gardant le corps gainé, puis revenez.', NULL),

-- === CARDIO ===
('Burpees', 'Cardio', 'Enchaînez : squat, planche, pompe, saut vertical. Exercice complet haute intensité.', NULL),
('Jumping jacks', 'Cardio', 'Sautez en écartant bras et jambes simultanément, puis revenez en position initiale.', NULL),
('Corde à sauter', 'Cardio', 'Sautez par-dessus la corde en gardant les coudes près du corps et les sauts courts.', NULL),
('Sprint sur place', 'Cardio', 'Courez sur place en montant les genoux le plus haut possible.', NULL),
('Box jumps', 'Cardio', 'Sautez sur une box ou un banc, atterrissez en douceur pieds à plat, redescendez.', NULL),
('Rameur', 'Cardio', 'Sur le rameur, poussez avec les jambes puis tirez avec les bras. Gardez le dos droit.', NULL),
('Vélo assault', 'Cardio', 'Pédalez et poussez/tirez les bras simultanément. Plus vous allez vite, plus c''est dur.', NULL),

-- === ÉTIREMENTS ===
('Étirement quadriceps', 'Étirements', 'Debout, attrapez le pied derrière vous et tirez doucement le talon vers la fesse.', NULL),
('Étirement ischio-jambiers', 'Étirements', 'Jambe tendue sur un support, penchez le buste vers l''avant en gardant le dos droit.', NULL),
('Étirement pectoraux', 'Étirements', 'Bras tendu contre un mur, pivotez le buste pour sentir l''étirement dans la poitrine.', NULL),
('Étirement dos (chat-vache)', 'Étirements', 'À quatre pattes, alternez entre dos rond (chat) et dos creux (vache).', NULL),
('Étirement fessiers (pigeon)', 'Étirements', 'Une jambe pliée devant, l''autre tendue derrière, descendez le buste vers l''avant.', NULL),
('Rotation thoracique', 'Étirements', 'À quatre pattes ou en fente, ouvrez le buste en levant un bras vers le ciel.', NULL),

-- === FULL BODY ===
('Kettlebell swing', 'Full body', 'Balancez le kettlebell entre les jambes puis projetez-le à hauteur d''épaules avec les hanches.', NULL),
('Clean and press', 'Full body', 'Montez la barre ou les haltères aux épaules (clean) puis poussez au-dessus de la tête (press).', NULL),
('Thrusters', 'Full body', 'Squat avec haltères aux épaules, enchaînez avec un développé au-dessus de la tête en remontant.', NULL),
('Turkish get-up', 'Full body', 'Depuis le sol, levez-vous debout en gardant un kettlebell bras tendu au-dessus de la tête.', NULL),
('Bear crawl', 'Full body', 'À quatre pattes, genoux décollés du sol, avancez en coordonnant bras et jambes opposés.', NULL);
