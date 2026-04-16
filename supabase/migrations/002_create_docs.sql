-- Kafé · Table de contenu éditable pour les notes / pages statiques
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS docs (
  slug        text PRIMARY KEY,
  content     jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz DEFAULT now(),
  updated_by  text
);

ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

-- Lecture publique (pages publiques)
CREATE POLICY "anon_read_docs"
  ON docs FOR SELECT
  TO anon
  USING (true);

-- Écriture réservée aux utilisateurs connectés
CREATE POLICY "auth_insert_docs"
  ON docs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "auth_update_docs"
  ON docs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
