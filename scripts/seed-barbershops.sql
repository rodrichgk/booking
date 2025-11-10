-- First, create some sample users to be barbershop owners
-- Make sure to replace kibarodrich@gmail.com with your actual email if you want to own all shops
-- Or create different owner emails

-- Insert Barbershops (will be inactive until subscription is paid)

-- 1. Elite Barber Shop - Paris
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'Elite Barber Shop',
  'Le salon de coiffure de référence à Paris. Spécialisé dans les coupes modernes et les styles traditionnels. Notre équipe expérimentée vous garantit un service de qualité supérieure.',
  '45 Rue de Rivoli',
  'Paris',
  '+33 1 42 60 30 45',
  'contact@elitebarber.fr',
  'https://www.elitebarber.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.8',
  127
);

-- 2. The Gentleman's Cut - Lyon
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'The Gentleman''s Cut',
  'Salon de coiffure pour hommes situé au cœur de Lyon. Ambiance chaleureuse et professionnelle. Experts en coupes classiques et modernes, barbe et rasage traditionnel.',
  '12 Rue de la République',
  'Lyon',
  '+33 4 78 37 20 15',
  'contact@gentlemanscut.fr',
  'https://www.gentlemanscut.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.9',
  203
);

-- 3. Urban Style - Marseille
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'Urban Style',
  'Coiffeur barbier moderne à Marseille. Spécialisé dans les coupes tendance, dégradés et designs. Service rapide et professionnel dans une ambiance décontractée.',
  '89 La Canebière',
  'Marseille',
  '+33 4 91 54 12 78',
  'contact@urbanstyle.fr',
  'https://www.urbanstyle.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.7',
  156
);

-- 4. Classic Cuts - Toulouse
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'Classic Cuts',
  'Votre barbier de quartier à Toulouse depuis 2010. Expertise en coupes classiques et modernes, entretien de barbe et soins capillaires. Ambiance conviviale garantie.',
  '23 Rue Alsace-Lorraine',
  'Toulouse',
  '+33 5 61 23 45 67',
  'contact@classiccuts.fr',
  'https://www.classiccuts.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.6',
  98
);

-- 5. Le Salon Parisien - Nice
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'Le Salon Parisien',
  'Salon de coiffure haut de gamme à Nice. Services premium incluant coupe, coloration, soins et stylisme. Notre équipe de coiffeurs expérimentés est à votre écoute.',
  '15 Avenue Jean Médecin',
  'Nice',
  '+33 4 93 87 65 43',
  'contact@salonparisien.fr',
  'https://www.salonparisien.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.9',
  234
);

-- 6. Fresh Fade - Bordeaux
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'Fresh Fade',
  'Le meilleur barbershop de Bordeaux pour vos coupes fade et dégradés. Ambiance moderne, musique et équipe jeune et dynamique. Réservation en ligne disponible.',
  '67 Cours de l''Intendance',
  'Bordeaux',
  '+33 5 56 48 23 90',
  'contact@freshfade.fr',
  'https://www.freshfade.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.8',
  178
);

-- 7. Barber & Co - Nantes
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'Barber & Co',
  'Barbershop traditionnel avec une touche moderne à Nantes. Spécialistes du rasage à l''ancienne, soins de la barbe et coupes sur mesure. Service de qualité depuis 2012.',
  '34 Rue Crébillon',
  'Nantes',
  '+33 2 40 47 89 12',
  'contact@barberco.fr',
  'https://www.barberco.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.7',
  145
);

-- 8. Style Masters - Strasbourg
INSERT INTO barbershops (name, description, address, city, phone, email, website, owner_id, is_active, rating, review_count)
VALUES (
  'Style Masters',
  'Salon de coiffure mixte à Strasbourg. Équipe multiculturelle spécialisée dans tous types de cheveux. Coupes, colorations, soins et conseils personnalisés.',
  '18 Rue du Vieux-Marché-aux-Poissons',
  'Strasbourg',
  '+33 3 88 32 56 78',
  'contact@stylemasters.fr',
  'https://www.stylemasters.fr',
  (SELECT id FROM users WHERE email = 'kibarodrich@gmail.com' LIMIT 1),
  true,
  '4.9',
  189
);

-- Note: These barbershops are created as ACTIVE for demo purposes
-- In production, they should be created as INACTIVE and require subscription payment
-- To make them inactive, change 'true' to 'false' in the is_active field
