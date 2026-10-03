-- Read-only checks. Every result should be empty before applying the integrity migration.
SELECT lower(email),count(*) FROM registrations GROUP BY lower(email) HAVING count(*)>1;
SELECT user_id,count(*) FROM registrations GROUP BY user_id HAVING count(*)>1;
SELECT builder_number,count(*) FROM registrations GROUP BY builder_number HAVING count(*)>1;
SELECT created_by,count(*) FROM squads GROUP BY created_by HAVING count(*)>1;
SELECT squad_id,role,count(*) FROM squad_members GROUP BY squad_id,role HAVING count(*)>1;
SELECT user_id,count(*) FROM squad_members GROUP BY user_id HAVING count(*)>1;
SELECT squad_id,count(*) FROM squad_members GROUP BY squad_id HAVING count(*)>3;
SELECT * FROM squad_members WHERE role NOT IN ('BUILDER','SOLVER','SHIPPER');
