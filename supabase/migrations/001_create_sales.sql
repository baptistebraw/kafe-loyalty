-- Kafé · Table des ventes (source : Square items export)
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS sales (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date        date        NOT NULL,
  time        time        NOT NULL,
  category    text,
  item        text        NOT NULL,
  qty         numeric     DEFAULT 1,
  product_sales numeric,
  discounts   numeric,
  net_sales   numeric     NOT NULL,
  tax         numeric,
  gross_sales numeric,
  transaction_id text     NOT NULL,
  payment_id  text,
  dining_option text,
  employee    text,
  notes       text,
  created_at  timestamptz DEFAULT now(),

  CONSTRAINT sales_unique_row UNIQUE (transaction_id, item, time)
);

-- Index pour les requêtes du dashboard
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales (date);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_id ON sales (transaction_id);

-- RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Lecture anonyme (dashboard public)
CREATE POLICY "anon_read_sales"
  ON sales FOR SELECT
  TO anon
  USING (true);

-- Insertion anonyme (outil d'import)
CREATE POLICY "anon_insert_sales"
  ON sales FOR INSERT
  TO anon
  WITH CHECK (true);
