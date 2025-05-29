-- Insert team members (profiles) with mock emails
INSERT INTO profiles (email, full_name, invitation_status) VALUES
('jeffrey.wong@company.com', 'Jeffrey', 'active'),
('nerissa.chen@company.com', 'Nerissa', 'active'),
('edmund.lee@company.com', 'Edmund', 'active'),
('elaine.tam@company.com', 'Elaine', 'active'),
('dorothy.liu@company.com', 'Dorothy', 'active'),
('jonathan.ng@company.com', 'Jonathan', 'active'),
('carson.chan@company.com', 'Carson', 'active'),
('melo.kim@company.com', 'Melo', 'active'),
('phoebe.zhao@company.com', 'Phoebe', 'active');

-- Insert projects with calculated dates (assuming 2024 and week 1 starts Jan 1)
INSERT INTO projects (name, start_date, end_date) VALUES
('Troubleshooting', '2024-04-29', '2024-12-30'), -- Week 18-53
('PWH LAS', '2024-02-12', '2024-04-15'), -- Week 7-16
('QMH Pivka +RUO+A1c', '2024-05-13', '2024-05-27'), -- Week 20-22
('UCH LAS', '2024-10-07', '2024-12-30'), -- Week 41-53
('Mass spec training', '2024-05-27', '2024-05-27'), -- Week 22
('KAM training', '2024-06-03', '2024-06-03'), -- Week 23
('Evaluation revamp', '2024-06-03', '2024-07-29'), -- Week 23-31
('PYNEH u601', '2024-04-15', '2024-04-22'), -- Week 16-17
('UCH PIvka', '2024-05-20', '2024-05-20'), -- Week 21
('MGH LAS', '2024-06-03', '2024-06-24'), -- Week 23-27
('Mass spec launch', '2024-06-03', '2024-07-29'), -- Week 23-31
('ALNH A1c', '2024-05-13', '2024-05-20'), -- Week 20-21
('HKCH BILT3,Vita D,NGAL', '2024-06-10', '2024-06-10'), -- Week 24
('DEEP Training', '2024-05-27', '2024-05-27'), -- Week 22
('QEH PIPO', '2024-04-08', '2024-05-06'), -- Week 15-19
('PMH Pivka +BILT3', '2024-05-13', '2024-05-27'), -- Week 20-22
('EKMC Live run +report', '2024-05-06', '2024-05-13'), -- Week 19-20
('BILT3', '2024-06-10', '2024-07-29'), -- Week 24-31
('KWH A1c', '2024-05-27', '2024-06-10'), -- Week 22-24
('Kingmed LAS (Pro A)', '2024-06-17', '2024-09-02'), -- Week 25-36
('Kingmed LAS (Pro B)', '2024-10-07', '2024-12-30'), -- Week 41-53
('PY a1c', '2024-06-24', '2024-07-08'), -- Week 26-28
('TMH a1c', '2024-07-22', '2024-08-05'), -- Week 30-32
('PMH urine eval', '2024-05-06', '2024-05-06'), -- Week 19
('PWH Pivka and BILT3', '2024-06-10', '2024-06-24'), -- Week 24-26
('MGH', '2024-04-08', '2024-08-26'), -- Week 15-35
('MUST', '2024-04-08', '2024-04-29'), -- Week 15-18
('MS', '2024-04-29', '2024-12-30'); -- Week 18-53

-- Insert project member assignments
-- Jeffrey's assignments
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
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
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
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
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Edmund'),
    ('ALNH A1c', 'Edmund'),
    ('HKCH BILT3,Vita D,NGAL', 'Edmund'),
    ('KAM training', 'Edmund'),
    ('DEEP Training', 'Edmund')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Elaine's assignments
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
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
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
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
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Jonathan'),
    ('KWH A1c', 'Jonathan'),
    ('PY a1c', 'Jonathan'),
    ('TMH a1c', 'Jonathan'),
    ('UCH LAS', 'Jonathan')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Carson's assignments
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
FROM projects p, profiles u, (VALUES
    ('Troubleshooting', 'Carson'),
    ('PMH urine eval', 'Carson'),
    ('QMH Pivka +RUO+A1c', 'Carson'),
    ('PWH Pivka and BILT3', 'Carson'),
    ('UCH LAS', 'Carson')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Melo's assignments
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
FROM projects p, profiles u, (VALUES
    ('MGH', 'Melo'),
    ('MUST', 'Melo'),
    ('Troubleshooting', 'Melo')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;

-- Phoebe's assignments
INSERT INTO project_members (project_id, user_id)
SELECT p.id, u.id
FROM projects p, profiles u, (VALUES
    ('MGH', 'Phoebe'),
    ('MS', 'Phoebe')
) AS assignments(project_name, member_name)
WHERE p.name = assignments.project_name AND u.full_name = assignments.member_name;
