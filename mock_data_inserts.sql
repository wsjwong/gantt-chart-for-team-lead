-- Insert team members (profiles) with mock emails
INSERT INTO profiles (id, email, full_name, invitation_status) VALUES
(gen_random_uuid(), 'jeffrey.wong@company.com', 'Jeffrey', 'active'),
(gen_random_uuid(), 'nerissa.chen@company.com', 'Nerissa', 'active'),
(gen_random_uuid(), 'edmund.lee@company.com', 'Edmund', 'active'),
(gen_random_uuid(), 'elaine.tam@company.com', 'Elaine', 'active'),
(gen_random_uuid(), 'dorothy.liu@company.com', 'Dorothy', 'active'),
(gen_random_uuid(), 'jonathan.ng@company.com', 'Jonathan', 'active'),
(gen_random_uuid(), 'carson.chan@company.com', 'Carson', 'active'),
(gen_random_uuid(), 'melo.kim@company.com', 'Melo', 'active'),
(gen_random_uuid(), 'phoebe.zhao@company.com', 'Phoebe', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert projects with calculated dates (assuming 2024 and week 1 starts Jan 1)
-- Note: admin_id will need to be set to an actual user ID after profiles are created
INSERT INTO projects (id, name, start_date, end_date, admin_id) VALUES
(gen_random_uuid(), 'Troubleshooting', '2024-04-29', '2024-12-30', (SELECT id FROM profiles WHERE email = 'jeffrey.wong@company.com')), -- Week 18-53
(gen_random_uuid(), 'PWH LAS', '2024-02-12', '2024-04-15', (SELECT id FROM profiles WHERE email = 'jeffrey.wong@company.com')), -- Week 7-16
(gen_random_uuid(), 'QMH Pivka +RUO+A1c', '2024-05-13', '2024-05-27', (SELECT id FROM profiles WHERE email = 'jeffrey.wong@company.com')), -- Week 20-22
(gen_random_uuid(), 'UCH LAS', '2024-10-07', '2024-12-30', (SELECT id FROM profiles WHERE email = 'jeffrey.wong@company.com')), -- Week 41-53
(gen_random_uuid(), 'Mass spec training', '2024-05-27', '2024-05-27', (SELECT id FROM profiles WHERE email = 'jeffrey.wong@company.com')), -- Week 22
(gen_random_uuid(), 'KAM training', '2024-06-03', '2024-06-03', (SELECT id FROM profiles WHERE email = 'jeffrey.wong@company.com')), -- Week 23
(gen_random_uuid(), 'Evaluation revamp', '2024-06-03', '2024-07-29', (SELECT id FROM profiles WHERE email = 'jeffrey.wong@company.com')), -- Week 23-31
(gen_random_uuid(), 'PYNEH u601', '2024-04-15', '2024-04-22', (SELECT id FROM profiles WHERE email = 'nerissa.chen@company.com')), -- Week 16-17
(gen_random_uuid(), 'UCH PIvka', '2024-05-20', '2024-05-20', (SELECT id FROM profiles WHERE email = 'nerissa.chen@company.com')), -- Week 21
(gen_random_uuid(), 'MGH LAS', '2024-06-03', '2024-06-24', (SELECT id FROM profiles WHERE email = 'nerissa.chen@company.com')), -- Week 23-27
(gen_random_uuid(), 'Mass spec launch', '2024-06-03', '2024-07-29', (SELECT id FROM profiles WHERE email = 'nerissa.chen@company.com')), -- Week 23-31
(gen_random_uuid(), 'ALNH A1c', '2024-05-13', '2024-05-20', (SELECT id FROM profiles WHERE email = 'edmund.lee@company.com')), -- Week 20-21
(gen_random_uuid(), 'HKCH BILT3,Vita D,NGAL', '2024-06-10', '2024-06-10', (SELECT id FROM profiles WHERE email = 'edmund.lee@company.com')), -- Week 24
(gen_random_uuid(), 'DEEP Training', '2024-05-27', '2024-05-27', (SELECT id FROM profiles WHERE email = 'edmund.lee@company.com')), -- Week 22
(gen_random_uuid(), 'QEH PIPO', '2024-04-08', '2024-05-06', (SELECT id FROM profiles WHERE email = 'elaine.tam@company.com')), -- Week 15-19
(gen_random_uuid(), 'PMH Pivka +BILT3', '2024-05-13', '2024-05-27', (SELECT id FROM profiles WHERE email = 'elaine.tam@company.com')), -- Week 20-22
(gen_random_uuid(), 'EKMC Live run +report', '2024-05-06', '2024-05-13', (SELECT id FROM profiles WHERE email = 'elaine.tam@company.com')), -- Week 19-20
(gen_random_uuid(), 'BILT3', '2024-06-10', '2024-07-29', (SELECT id FROM profiles WHERE email = 'elaine.tam@company.com')), -- Week 24-31
(gen_random_uuid(), 'KWH A1c', '2024-05-27', '2024-06-10', (SELECT id FROM profiles WHERE email = 'dorothy.liu@company.com')), -- Week 22-24
(gen_random_uuid(), 'Kingmed LAS (Pro A)', '2024-06-17', '2024-09-02', (SELECT id FROM profiles WHERE email = 'dorothy.liu@company.com')), -- Week 25-36
(gen_random_uuid(), 'Kingmed LAS (Pro B)', '2024-10-07', '2024-12-30', (SELECT id FROM profiles WHERE email = 'dorothy.liu@company.com')), -- Week 41-53
(gen_random_uuid(), 'PY a1c', '2024-06-24', '2024-07-08', (SELECT id FROM profiles WHERE email = 'jonathan.ng@company.com')), -- Week 26-28
(gen_random_uuid(), 'TMH a1c', '2024-07-22', '2024-08-05', (SELECT id FROM profiles WHERE email = 'jonathan.ng@company.com')), -- Week 30-32
(gen_random_uuid(), 'PMH urine eval', '2024-05-06', '2024-05-06', (SELECT id FROM profiles WHERE email = 'carson.chan@company.com')), -- Week 19
(gen_random_uuid(), 'PWH Pivka and BILT3', '2024-06-10', '2024-06-24', (SELECT id FROM profiles WHERE email = 'carson.chan@company.com')), -- Week 24-26
(gen_random_uuid(), 'MGH', '2024-04-08', '2024-08-26', (SELECT id FROM profiles WHERE email = 'melo.kim@company.com')), -- Week 15-35
(gen_random_uuid(), 'MUST', '2024-04-08', '2024-04-29', (SELECT id FROM profiles WHERE email = 'melo.kim@company.com')), -- Week 15-18
(gen_random_uuid(), 'MS', '2024-04-29', '2024-12-30', (SELECT id FROM profiles WHERE email = 'phoebe.zhao@company.com')); -- Week 18-53

-- Insert project member assignments
-- Jeffrey's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Jeffrey'),
    ('PWH LAS', 'Jeffrey'),
    ('QMH Pivka +RUO+A1c', 'Jeffrey'),
    ('UCH LAS', 'Jeffrey'),
    ('Mass spec training', 'Jeffrey'),
    ('KAM training', 'Jeffrey'),
    ('Evaluation revamp', 'Jeffrey')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Nerissa's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Nerissa'),
    ('PYNEH u601', 'Nerissa'),
    ('UCH PIvka', 'Nerissa'),
    ('MGH LAS', 'Nerissa'),
    ('Mass spec training', 'Nerissa'),
    ('Mass spec launch', 'Nerissa')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Edmund's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Edmund'),
    ('ALNH A1c', 'Edmund'),
    ('HKCH BILT3,Vita D,NGAL', 'Edmund'),
    ('KAM training', 'Edmund'),
    ('DEEP Training', 'Edmund')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Elaine's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Elaine'),
    ('QEH PIPO', 'Elaine'),
    ('PMH Pivka +BILT3', 'Elaine'),
    ('EKMC Live run +report', 'Elaine'),
    ('UCH LAS', 'Elaine'),
    ('BILT3', 'Elaine')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Dorothy's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Dorothy'),
    ('QEH PIPO', 'Dorothy'),
    ('ALNH A1c', 'Dorothy'),
    ('KWH A1c', 'Dorothy'),
    ('Kingmed LAS (Pro A)', 'Dorothy'),
    ('Kingmed LAS (Pro B)', 'Dorothy')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Jonathan's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Jonathan'),
    ('KWH A1c', 'Jonathan'),
    ('PY a1c', 'Jonathan'),
    ('TMH a1c', 'Jonathan'),
    ('UCH LAS', 'Jonathan')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Carson's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Carson'),
    ('PMH urine eval', 'Carson'),
    ('QMH Pivka +RUO+A1c', 'Carson'),
    ('PWH Pivka and BILT3', 'Carson'),
    ('UCH LAS', 'Carson')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Melo's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('MGH', 'Melo'),
    ('MUST', 'Melo'),
    ('Troubleshooting', 'Melo')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Phoebe's assignments
INSERT INTO project_members (id, project_id, user_id)
SELECT gen_random_uuid(), p.id, u.id
FROM projects p, profiles u, (VALUES
    ('MGH', 'Phoebe'),
    ('MS', 'Phoebe')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;
