-- Table des abonnements Stripe pour les coachs
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'free',  -- free, active, canceled, past_due
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Le coach voit son propre abonnement
CREATE POLICY "Le coach voit son abonnement"
  ON subscriptions FOR SELECT
  USING (coach_id = auth.uid());

-- Seul le service_role peut modifier (via webhook)
CREATE POLICY "Service role gère les abonnements"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');
