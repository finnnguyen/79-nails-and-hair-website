alter table staff_rotation add column queue_position int not null default 0;

update staff_rotation sr
set queue_position = s.sort_order
from staff s
where s.id = sr.staff_id;
