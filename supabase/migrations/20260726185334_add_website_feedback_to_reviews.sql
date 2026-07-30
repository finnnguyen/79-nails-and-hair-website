alter table reviews
  add column website_rating smallint check (website_rating between 1 and 5),
  add column website_comment text;
