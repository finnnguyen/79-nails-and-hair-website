alter table services add column duration_minutes int not null default 30;

update services set duration_minutes = case id
  -- Nail Services
  when 'manicure' then 30
  when 'pedicure' then 45
  when 'mani-pedi' then 75
  when 'full-set' then 75
  when 'pink-white' then 90
  when 'dipping-powder' then 60
  when 'ombre-powder' then 75
  when 'press-on-manicure' then 45
  when 'refill' then 60
  -- Nail add-ons (stack on top of the core nail service)
  when 'additional-gel' then 10
  when 'additional-ombre-gel' then 15
  when 'marble-effect' then 15
  when 'clear-gel' then 10
  when 'additional-french' then 10
  when 'callus-treatment' then 15
  when 'design' then 20
  when 'gel-polish-change' then 20
  when 'polish-change' then 15
  -- Hair Services
  when 'men-haircut' then 20
  when 'women-haircut' then 30
  when 'root-touch-up' then 60
  when 'perm' then 120
  when 'highlight' then 120
  when 'whole-package' then 180
  when 'hair-treatment' then 30
  when 'ombre-color' then 150
  when 'keratin-treatment' then 150
  when 'straightening' then 180
  when 'flat-iron' then 30
  -- Facial Services
  when 'eyebrow-threading' then 10
  when 'eyebrow-wax' then 10
  when 'lip-wax' then 5
  when 'under-arm' then 10
  when 'face-wax' then 20
  when 'leg-wax' then 30
  when 'full-arm-wax' then 20
  when 'bikini-wax' then 20
  when 'brazilian-wax' then 30
  when 'eyelash-extensions' then 90
  when 'eyelash-removal' then 15
  when 'facial-40' then 40
  else duration_minutes
end;
