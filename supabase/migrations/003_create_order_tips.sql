-- Kafé · Pourboires Square par ordre + jours travaillés équipe
-- À exécuter dans le SQL Editor de Supabase

-- Pourboires par ordre Square
CREATE TABLE IF NOT EXISTS order_tips (
  order_id    text        PRIMARY KEY,
  date        date        NOT NULL,
  time        time        NOT NULL,
  tip_amount  numeric     NOT NULL DEFAULT 0,
  synced_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_tips_date ON order_tips (date);

ALTER TABLE order_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_order_tips"
  ON order_tips FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_upsert_order_tips_insert"
  ON order_tips FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_upsert_order_tips_update"
  ON order_tips FOR UPDATE
  TO anon
  USING (true);

-- Jours travaillés par membre, par mois (stocké dans monthly_costs)
ALTER TABLE monthly_costs
  ADD COLUMN IF NOT EXISTS team_days jsonb DEFAULT '{}'::jsonb;
