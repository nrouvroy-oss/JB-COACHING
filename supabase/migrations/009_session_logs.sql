-- Suivi de complétion des séances par le client
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(session_id, client_id)
);

ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- Le client gère ses logs de séance
CREATE POLICY "Le client gère ses session_logs"
  ON session_logs FOR ALL
  USING (client_id = auth.uid());

-- Le coach voit les logs de ses clients
CREATE POLICY "Le coach voit les session_logs de ses clients"
  ON session_logs FOR SELECT
  USING (
    client_id IN (
      SELECT p.client_id FROM programs p WHERE p.coach_id = auth.uid()
    )
  );
