-- Apply after src/lib/supabase/schema.sql. Review preflight results before applying.
-- Existing duplicates must be reconciled by the owner, not silently deleted.
BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS registrations_email_unique ON registrations (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS registrations_user_unique ON registrations (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS squad_members_role_unique ON squad_members (squad_id, role);
CREATE UNIQUE INDEX IF NOT EXISTS squad_members_user_unique ON squad_members (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS squads_creator_unique ON squads (created_by);
CREATE SEQUENCE IF NOT EXISTS ai60_builder_number;
SELECT setval('ai60_builder_number', greatest(coalesce((SELECT max(builder_number) FROM registrations), 0), 1), exists(SELECT 1 FROM registrations));
CREATE UNIQUE INDEX IF NOT EXISTS registrations_number_unique ON registrations (builder_number);
ALTER TABLE squad_members ADD CONSTRAINT ai60_valid_role CHECK (role IN ('BUILDER', 'SOLVER', 'SHIPPER'));

CREATE OR REPLACE FUNCTION ai60_register(p_profile jsonb, p_project jsonb, p_email text, p_phone text, p_source text, p_referrer uuid, p_squad_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE u uuid := gen_random_uuid(); n integer := nextval('ai60_builder_number'); attributed uuid;
BEGIN
  INSERT INTO users(id,name,college,branch,graduation_year,target_role,skills,ai_experience,archetype,ai_readiness_score,recommended_project,squad_role)
  VALUES(u,p_profile->>'name',p_profile->>'college',p_profile->>'branch',p_profile->>'graduationYear',p_profile->>'targetRole',p_profile->'skills',p_profile->>'aiExperience',p_project->>'archetype',null,p_project->'project',p_project->>'squadRole');
  SELECT id INTO attributed FROM squads WHERE code=p_squad_code AND created_by=p_referrer;
  INSERT INTO registrations(id,user_id,email,phone,builder_number,source,referrer_user_id,squad_id)
  VALUES(gen_random_uuid(),u,lower(p_email),p_phone,n,p_source,CASE WHEN attributed IS NOT NULL THEN p_referrer ELSE null END,attributed);
  RETURN jsonb_build_object('userId',u,'builderNumber',n);
END; $$;

CREATE OR REPLACE FUNCTION ai60_create_squad(p_user uuid,p_project text,p_role text,p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s squads%ROWTYPE;
BEGIN
  -- Serialize all squad operations for the same participant.
  PERFORM 1 FROM users WHERE id=p_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown builder'; END IF;
  SELECT squads.* INTO s FROM squads JOIN squad_members ON squad_members.squad_id=squads.id WHERE squad_members.user_id=p_user;
  IF FOUND THEN RETURN jsonb_build_object('id',s.id,'code',s.code); END IF;
  INSERT INTO squads(id,code,created_by,project_name) VALUES(gen_random_uuid(),p_code,p_user,p_project) RETURNING * INTO s;
  INSERT INTO squad_members(id,squad_id,user_id,role) VALUES(gen_random_uuid(),s.id,p_user,p_role);
  RETURN jsonb_build_object('id',s.id,'code',s.code);
END; $$;

CREATE OR REPLACE FUNCTION ai60_join_squad(p_code text,p_user uuid,p_role text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s squads%ROWTYPE; assigned text; occupied text[];
BEGIN
  PERFORM 1 FROM users WHERE id=p_user FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Unknown builder.','status',401); END IF;
  SELECT * INTO s FROM squads WHERE code=p_code FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Invite not found.','status',404); END IF;
  SELECT role INTO assigned FROM squad_members WHERE squad_id=s.id AND user_id=p_user;
  IF FOUND THEN RETURN jsonb_build_object('success',true,'assignedRole',assigned,'squad',jsonb_build_object('id',s.id,'code',s.code)); END IF;
  IF EXISTS(SELECT 1 FROM squad_members WHERE user_id=p_user) THEN RETURN jsonb_build_object('error','You already belong to a squad.','status',409); END IF;
  SELECT coalesce(array_agg(role),ARRAY[]::text[]) INTO occupied FROM squad_members WHERE squad_id=s.id;
  IF cardinality(occupied)>=3 THEN RETURN jsonb_build_object('error','This squad is full. Your workshop registration remains valid.','status',409); END IF;
  SELECT r INTO assigned FROM unnest(ARRAY[p_role,'BUILDER','SOLVER','SHIPPER']) WITH ORDINALITY AS candidate(r,position)
    WHERE r IN ('BUILDER','SOLVER','SHIPPER') AND NOT (r=ANY(occupied)) ORDER BY position LIMIT 1;
  INSERT INTO squad_members(id,squad_id,user_id,role) VALUES(gen_random_uuid(),s.id,p_user,assigned);
  UPDATE registrations SET squad_id=s.id WHERE user_id=p_user;
  RETURN jsonb_build_object('success',true,'assignedRole',assigned,'squad',jsonb_build_object('id',s.id,'code',s.code));
END; $$;
REVOKE ALL ON FUNCTION ai60_register(jsonb,jsonb,text,text,text,uuid,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION ai60_create_squad(uuid,text,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION ai60_join_squad(text,uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai60_register(jsonb,jsonb,text,text,text,uuid,text) TO service_role;
GRANT EXECUTE ON FUNCTION ai60_create_squad(uuid,text,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION ai60_join_squad(text,uuid,text) TO service_role;
COMMIT;
