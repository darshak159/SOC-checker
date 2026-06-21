-- ============================================================================
-- SOC Checker — initial schema, security (RLS), and seed
-- Apply this in Supabase: Dashboard → SQL Editor → paste → Run.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── Roles ───────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('teamleader','trainer','manager','admin');
exception when duplicate_object then null; end $$;

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role         public.user_role not null default 'trainer',
  outlet       text not null default 'Brock',
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── Templates ───────────────────────────────────────────────────────────────
create table if not exists public.templates (
  id         text primary key,
  name       text not null,
  department text,
  sections   jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── Checks ──────────────────────────────────────────────────────────────────
create table if not exists public.checks (
  id            uuid primary key default gen_random_uuid(),
  date          date not null default current_date,
  outlet        text not null default 'Brock',
  trainee_name  text not null,
  trainer_id    uuid references public.profiles(id) on delete set null,
  trainer_name  text,
  template_id   text,
  template_name text,
  department    text,
  item_ratings  jsonb not null default '{}'::jsonb,
  score         int  not null default 0,
  comment       text default '',
  has_fail      boolean not null default false,
  created_by    uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  created_at    timestamptz not null default now()
);
create index if not exists checks_created_by_idx on public.checks(created_by);
create index if not exists checks_date_idx on public.checks(date);

-- ── Helper: current user's role (security definer to avoid RLS recursion) ────
create or replace function public.my_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── Auto-create a profile whenever an auth user is created ──────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, role, outlet, active)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'trainer'),
    coalesce(nullif(new.raw_user_meta_data->>'outlet',''), 'Brock'),
    true
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Login directory: lets the (anonymous) login screen list names + map to the
--    sign-in email. Emails here are synthetic identifiers, not contact addresses.
create or replace function public.login_directory()
returns table (id uuid, display_name text, role public.user_role, email text)
language sql stable security definer set search_path = public, auth as $$
  select p.id, p.display_name, p.role, u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.active = true
  order by p.role, p.display_name;
$$;
grant execute on function public.login_directory() to anon, authenticated;

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table public.profiles  enable row level security;
alter table public.templates enable row level security;
alter table public.checks    enable row level security;

-- Profiles: any signed-in user may read the team (names/roles needed across UI);
-- only an admin may modify via SQL (most writes happen through the service role).
drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_write  on public.profiles;
create policy profiles_read  on public.profiles for select to authenticated using (true);
create policy profiles_write on public.profiles for all to authenticated
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- Templates: all signed-in users read; only admin (GM) writes.
drop policy if exists templates_read  on public.templates;
drop policy if exists templates_write on public.templates;
create policy templates_read  on public.templates for select to authenticated using (true);
create policy templates_write on public.templates for all to authenticated
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- Checks:
--  read   → managers & admins see all; everyone else sees only their own
--  insert → must stamp yourself as creator
--  update → owner or admin
--  delete → admin only
drop policy if exists checks_read   on public.checks;
drop policy if exists checks_insert on public.checks;
drop policy if exists checks_update on public.checks;
drop policy if exists checks_delete on public.checks;
create policy checks_read   on public.checks for select to authenticated
  using (public.my_role() in ('manager','admin') or created_by = auth.uid());
create policy checks_insert on public.checks for insert to authenticated
  with check (created_by = auth.uid());
create policy checks_update on public.checks for update to authenticated
  using (public.my_role() = 'admin' or created_by = auth.uid());
create policy checks_delete on public.checks for delete to authenticated
  using (public.my_role() = 'admin');

-- Auto-generated SOC template seed (13 templates)
insert into public.templates (id, name, department, sections) values
  ('tpl_pullforward', '5 Point Pull Forward System', 'Drive Thru', '[{"id":"pf_s1","name":"DT Presenter","weight":0.5,"items":[{"id":"pf1","text":"Ensure you have supplies: pen/marker, receipt paper"},{"id":"pf2","text":"Hand out drinks"},{"id":"pf3","text":"Let the guest know WHY, WHEN, WHERE they are being pulled forward"},{"id":"pf4","text":"Point and look to where you want them to go while asking them to pull ahead"},{"id":"pf5","text":"Press the HOLD button on the bump bar, if applicable"},{"id":"pf6","text":"Record the entire license plate # on the receipt"},{"id":"pf7","text":"Place the receipt in the designated spot (tuck a note)"},{"id":"pf8","text":"Let the shift manager and designated pull forward runner know order is pulled"}]},{"id":"pf_s2","name":"Pull Forward Runner","weight":0.5,"items":[{"id":"pf9","text":"Keep the safety vest on at all times"},{"id":"pf10","text":"Ensure apron is stocked with essentials (ketchup, straws, napkins, etc.)"},{"id":"pf11","text":"Assembles the order and takes the receipt from the tuck a note"},{"id":"pf12","text":"Asks DT team to serve the order off on their way out to deliver"},{"id":"pf13","text":"Watches for traffic safety concerns"},{"id":"pf14","text":"Re-greets and presents order and receipt to driver, asks them to verify order is correct"},{"id":"pf15","text":"Thanks the guest for their visit and asks for repeat business"}]}]'::jsonb),
  ('tpl_breakfast', 'Breakfast Kitchen', 'Kitchen', '[{"id":"bk_s1","name":"Initiator","weight":0.5,"items":[{"id":"bk1","text":"Ensure current UHC charts are posted"},{"id":"bk2","text":"Check for proper muffin and bagel toast continuously throughout breakfast daypart"},{"id":"bk3","text":"Immediately calls for assistance when orders go into danger zone (3rd order on screen)"},{"id":"bk4","text":"Follows proper bump sequence: place wrap on table, bread on wrap, then bump order"},{"id":"bk5","text":"Pairs like sandwiches to make maximum \"two-at-a-time\" when possible"},{"id":"bk6","text":"Untoasted muffins and bagels are completely accessible – no fumbling"},{"id":"bk7","text":"Wears a headset to initiate DT orders more quickly"},{"id":"bk8","text":"Keeps unnecessary communication to a minimum"},{"id":"bk9","text":"Aids toast & bake person when no other order is on screen"},{"id":"bk10","text":"Manages UHC levels and communicates product needs to batch cooker"},{"id":"bk11","text":"Empty trays removed immediately from meat/eggs UHC"},{"id":"bk12","text":"Works as a TEAM – all available hands constantly working on current sandwiches"},{"id":"bk13","text":"Moves to HLZ-end of UHC table when assembling to allow room for second person"},{"id":"bk14","text":"Spare sets of tongs ready at all times"}]},{"id":"bk_s2","name":"Prep Person","weight":0.3,"items":[{"id":"bk15","text":"Enough hashbrowns, sausage, bacon, McGriddles in kitchen freezer for entire daypart"},{"id":"bk16","text":"McGriddles are baked, tempered, and placed in proper pan with holes, false bottom and lid"},{"id":"bk17","text":"Enough eggs and Hot Cakes in proper kitchen fridge"},{"id":"bk18","text":"Spare red capped bottle of butter ready with secondary code date marked"},{"id":"bk19","text":"Enough cheese conditioned and marked with secondary code date and conditioning time"},{"id":"bk20","text":"Enough breakfast lids and bases at all necessary stations"}]},{"id":"bk_s3","name":"Grill","weight":0.2,"items":[{"id":"bk21","text":"Enough bacon cooked according to charts"},{"id":"bk22","text":"Bacon is pre-broken in half"},{"id":"bk23","text":"Disposable gloves are available"},{"id":"bk24","text":"One grill is on and ready to cook eggs with egg rings and KPTs set up and ready"}]}]'::jsonb),
  ('tpl_kitchen_speed', 'Kitchen — Seconds Savers', 'Kitchen', '[{"id":"ks_s1","name":"Initiator","weight":0.4,"items":[{"id":"ks1","text":"Immediately calls for assistance when orders go into danger zone (3rd order on KVS)"},{"id":"ks2","text":"Places the crown in centre of wrap with heel facing up, on side closest to UHC"},{"id":"ks3","text":"Follows proper bump sequence (bun into toaster, place wrap/box on table, bump when last sandwich taken)"},{"id":"ks4","text":"Pairs like sandwiches to make \"two-at-a-time\" when possible by looking ahead on KVS"},{"id":"ks5","text":"Buns completely accessible – no fumbling (change rack heights if needed, do not overstock bun trays)"},{"id":"ks6","text":"Wears a headset to initiate DT orders before they reach KVS"},{"id":"ks7","text":"Stores sandwich boxes the way they are placed on the table – does not overstock"},{"id":"ks8","text":"Keeps unnecessary communication to a minimum"},{"id":"ks9","text":"Does NOT communicate to team what they are taking"},{"id":"ks10","text":"Aids assembler with last 2 sandwiches when no other order on KVS"}]},{"id":"ks_s2","name":"Assembler","weight":0.4,"items":[{"id":"ks11","text":"Pulls sandwiches versus pushing them to create ownership of product"},{"id":"ks12","text":"Uses both hands to add condiments and grab enough product for all sandwiches at once"},{"id":"ks13","text":"Assists assembly of other prep side when idle"},{"id":"ks14","text":"Keeps additional pans of full condiments ready for rush in kitchen fridge with cover"},{"id":"ks15","text":"Aids CFN/Meat when idle"},{"id":"ks16","text":"Manages UHC levels – anticipates and communicates product needs to batch cooker"},{"id":"ks17","text":"Empty trays removed immediately from UHC"}]},{"id":"ks_s3","name":"Meat & Team","weight":0.2,"items":[{"id":"ks18","text":"Inserts as Chaser when idle (functions between initiator and assembler)"},{"id":"ks19","text":"Pre-lines meat trays"},{"id":"ks20","text":"Fully stocked with onions, liners, seasoning, clean grill cloths"},{"id":"ks21","text":"Spatula and scraper blades are sharp with no nicks or burrs"},{"id":"ks22","text":"Both sides of prep table ready to go at all times"},{"id":"ks23","text":"Works as a TEAM – all hands constantly working on current sandwiches"},{"id":"ks24","text":"During peak times, \"aces in their places\""}]}]'::jsonb),
  ('tpl_mcdelivery', 'McDelivery', 'Front Counter', '[{"id":"md_s1","name":"Assembly","weight":0.6,"items":[{"id":"md1","text":"Takes receipt from POS printer and places in assembly area when courier is 3 min away"},{"id":"md2","text":"Determines if a small or large bag is required (small for food-only or drinks-only orders)"},{"id":"md3","text":"Adds ketchup automatically for all fries/hash brown orders (sm=1 pkt, med=2, lg=3)"},{"id":"md4","text":"All beverages completed while waiting for food and placed in drink tray"},{"id":"md5","text":"Places 2 of the 3 stickers on the bag while waiting for food"},{"id":"md6","text":"Places drink tray in bag first, then beverages into drink tray"},{"id":"md7","text":"Sandwiches and/or platters placed in A, B, C, or D bags determined by order size"},{"id":"md8","text":"Does not over-fill bags; fries are standing up straight"},{"id":"md9","text":"Completed food bags are double folded to retain heat"},{"id":"md10","text":"Fries, hashbrowns, poutines not bagged until driver arrives and identifies themselves"},{"id":"md11","text":"Desserts, smoothies, and frappes prepared ahead but are the last items prepared"},{"id":"md12","text":"All service items included (spoons, straws, etc.)"}]},{"id":"md_s2","name":"Driver Handoff","weight":0.4,"items":[{"id":"md13","text":"Greets courier upon arrival and confirms order number from their phone"},{"id":"md14","text":"Adds fries, hashbrowns or poutine to the order upon driver arrival"},{"id":"md15","text":"Double checks order for accuracy with the Pick Ticket"},{"id":"md16","text":"Checks for condiments"},{"id":"md17","text":"Double folds any remaining inner bags and places food bags in large rope handled delivery bag"},{"id":"md18","text":"Seals large rope handled bags with 3 stickers; order details filled in if not already complete"},{"id":"md19","text":"Hands courier partner ALL bags in the order AT THE SAME TIME"},{"id":"md20","text":"Completes an appropriate farewell and asks courier to swipe the order on their phone"}]}]'::jsonb),
  ('tpl_bestburger', 'Best Burger Grill Procedures', 'Kitchen', '[{"id":"bb_s1","name":"Cooking Procedures","weight":0.4,"items":[{"id":"bb1","text":"Maximum run size for regular meat is 6; for 1/4 patties is 4"},{"id":"bb2","text":"Looks at monitor & determines # of patties to cook, then bumps screen"},{"id":"bb3","text":"Puts on blue gloves before handling frozen patties"},{"id":"bb4","text":"Grill is set to Auto Detect"},{"id":"bb5","text":"Lifts first clam, retrieves patties from grill-side freezer, lays under platen using both hands (2 at a time)"},{"id":"bb6","text":"Uses knuckle or back of hand/wrist to lower the clam"},{"id":"bb7","text":"Positions 2 or more meat trays with new tray liners at grill"},{"id":"bb8","text":"Repeats for second clam if applicable, then removes gloves"},{"id":"bb9","text":"Gets spatula, hutzler, and grill seasoning ready while waiting for clam to rise"}]},{"id":"bb_s2","name":"Look & Cook","weight":0.2,"items":[{"id":"bb10","text":"Aware of meat cabinet levels and refers to cabinet charts to maintain target amount"},{"id":"bb11","text":"Cooks to replenish cabinet levels as orders come up on screen"},{"id":"bb12","text":"Listens for what is being wasted to replenish and maintain target cabinet levels"}]},{"id":"bb_s3","name":"Grill Scraping & Teflon","weight":0.2,"items":[{"id":"bb13","text":"Scrapes grill and squeegeees teflon after every run"},{"id":"bb14","text":"Grill surface steamed and teflons wiped with grill cloth minimally every 15 minutes"},{"id":"bb15","text":"Uses grill cloth to clean each spatula prior to steaming the grill"},{"id":"bb16","text":"Disposes of grill cloth in soiled grill cloth bucket after spatulas and grill have been steamed"}]},{"id":"bb_s4","name":"Meat Removal & Quality","weight":0.2,"items":[{"id":"bb17","text":"Uses proper sized spatula – no meat left on grill as a result of tearing"},{"id":"bb18","text":"Spatula held at 45 degree angle with enough force to cut meat off grill in one motion"},{"id":"bb19","text":"Spatula wiped using grill squeegee after each use; excess onions scraped onto patties into tray"},{"id":"bb20","text":"First 3 regular patties removed in one stack, then remaining 3; 1/4 patties one at a time"},{"id":"bb21","text":"Seasoning dispenser centered over each patty with correct amount dispensed evenly"},{"id":"bb22","text":"Hammer action used with proper amount of onions on each patty"},{"id":"bb23","text":"15 & 18 second removal times being met"},{"id":"bb24","text":"Minimum 2 seasoning dispensers in use"},{"id":"bb25","text":"A fresh liner is used for every run of meat"},{"id":"bb26","text":"Beef consistently cooked and removed within quality temperature zone 71°C–79°C"},{"id":"bb27","text":"UHC timer activated after meat is placed in cabinet"},{"id":"bb28","text":"All patties are Tender, Juicy, Seared, Seasoned"}]}]'::jsonb),
  ('tpl_condiment', 'Condiment SOC', 'Kitchen', '[{"id":"cs_s1","name":"Station Stock & Prep","weight":0.3,"items":[{"id":"cs1","text":"Station is stocked with all sauce guns and bottles – no mayo gun used in place of bottles"},{"id":"cs2","text":"Cheese is conditioned and stocked"},{"id":"cs3","text":"Prep fridge stocked with cucumbers, shredded cheese, and backup sauce bottles with code dates"}]},{"id":"cs_s2","name":"Sandwiches","weight":0.4,"items":[{"id":"cs4","text":"Only chicken sandwiches receive mayo from the sauce gun; all other sandwiches use a sauce bottle"},{"id":"cs5","text":"Quarter BLTs and sandwiches with extra mayo get sauce from bottle in the shape of a stop sign"},{"id":"cs6","text":"Extra sauce is added to the bottom bun of a sandwich"},{"id":"cs7","text":"Any additional sauce added to a sandwich receives sauce in the shape of a stop sign"},{"id":"cs8","text":"Extra pickles is double the standard amount (Cheeseburger=2, McDouble=4)"},{"id":"cs9","text":"Soufflé cups only filled halfway with two pumps of sauce"}]},{"id":"cs_s3","name":"Wraps","weight":0.3,"items":[{"id":"cs10","text":"Recognizes and utilizes the build zone for wraps"},{"id":"cs11","text":"McWraps receive two small hot lid''s worth of lettuce such that build zone is fully covered"},{"id":"cs12","text":"Snack wraps receive one small hot lid worth of lettuce"},{"id":"cs13","text":"McWraps are made using the quadruple arch sauce technique in the build zone"},{"id":"cs14","text":"Snack wraps are made with one single line of sauce using the sauce bottles"}]}]'::jsonb),
  ('tpl_cones', 'Cones Mini SOC', 'Kitchen', '[{"id":"cn_s1","name":"Checklist","weight":1,"items":[{"id":"cn1","text":"Using the diameter of the cone as a guide for the first swirl, circles the cone 5 times so ice cream reaches 5 inches (or 4.5 swirls) above the cone"},{"id":"cn2","text":"Weighs the cone to ensure it is 5oz"}]}]'::jsonb),
  ('tpl_order_accuracy', 'Kitchen Order Accuracy', 'Kitchen', '[{"id":"oa_s1","name":"Checklist","weight":1,"items":[{"id":"oa1","text":"A headset is being worn by the initiator"},{"id":"oa2","text":"Clear communication of grill orders down the line with SLIP PLACEMENT (FACE UP)"},{"id":"oa3","text":"In the case of an \"Ask Me\" Initiator, the order taker asks what the \"Ask Me\" is and communicates to the assembler"},{"id":"oa4","text":"Assembler does final check for accuracy"},{"id":"oa5","text":"Bump order only after the grill slip or tab is pulled on the box"}]}]'::jsonb),
  ('tpl_smart_retailing', 'Smart Retailing', 'Front Counter', '[{"id":"sr_s1","name":"Key Behaviours","weight":0.6,"items":[{"id":"sr1","text":"Engaging tone of voice and body language"},{"id":"sr2","text":"Eye contact maintained throughout the interaction"},{"id":"sr3","text":"Friendly throughout the order taking process – SMILE (see it, hear it)"},{"id":"sr4","text":"Uses time-of-day appropriate greeting"},{"id":"sr5","text":"Uses pairing options when suggesting items"},{"id":"sr6","text":"Eliminates banned phrases (\"Is that all?\", \"Just the sandwich?\", \"Was that a small?\", etc.)"},{"id":"sr7","text":"Uses recommended phrases (\"My favourite\", \"I recommend\", \"Only $___\", \"Premium Roast coffee\", \"Freshly made\", etc.)"},{"id":"sr8","text":"Does NOT retail to obvious guests (exact change, children, \"that''s all\", etc.)"}]},{"id":"sr_s2","name":"Retailing Techniques (min. 1 required per applicable order)","weight":0.4,"items":[{"id":"sr9","text":"Order clarification – commonly asking about a larger size"},{"id":"sr10","text":"Feature Item – spotlighting new, specific, or LTO products"},{"id":"sr11","text":"Core Four – filling in a missing sandwich, side, beverage, or dessert"},{"id":"sr12","text":"Tailor Suggestions – suggesting a matching item based on what the guest already ordered"}]}]'::jsonb),
  ('tpl_pushpull', 'Push/Pull Kitchen Procedure', 'Kitchen', '[{"id":"pp_s1","name":"Checklist","weight":1,"items":[{"id":"pp1","text":"Initiator responds to KVS and follows the bun-box-bump procedure"},{"id":"pp2","text":"Initiator communicates special requests to Assembler using pull tab or grill slip (e.g. No Onions, Extra Pickle)"},{"id":"pp3","text":"Initiator stays assembling the sandwich(es) until Assembler takes over – sandwiches are never abandoned"},{"id":"pp4","text":"Assembler \"pulls\" the sandwich(es) allowing Initiator to start the next order – Initiator never \"pushes\" to Assembler"}]}]'::jsonb),
  ('tpl_ordercomplete', 'Order Complete / NBLZ', 'Front Counter', '[{"id":"oc_s1","name":"NBLZ (Non-BDAP)","weight":0.4,"items":[{"id":"oc1","text":"Runner picks small orders from Assembly Monitor and places PICK TICKET on the NBLZ mat"},{"id":"oc2","text":"Beverage person presents order to guest as soon as drink is prepared"},{"id":"oc3","text":"Runner uses NBLZ for beverages-only, coffee + baked good, or completed food waiting for a drink"}]},{"id":"oc_s2","name":"Order Complete Button","weight":0.4,"items":[{"id":"oc4","text":"Order taker presses \"Order Complete\" button on POS for simple orders they can complete themselves"},{"id":"oc5","text":"Runner prints pick ticket, serves off Present Monitor, and removes from ORB by tapping order TWICE"},{"id":"oc6","text":"Order taker OWNS the order and completes it themselves once \"Order Complete\" is pressed"}]},{"id":"oc_s3","name":"BDAP Locations","weight":0.2,"items":[{"id":"oc7","text":"Runner clears order from assembly screen only once BDAP person places drink on NBLZ"},{"id":"oc8","text":"Runner grabs drink from NBLZ with pick ticket in hand and presents to guest"}]}]'::jsonb),
  ('tpl_mobileorder', 'Mobile Order (ROA)', 'Front Counter', '[{"id":"mo_s1","name":"Readiness","weight":0.2,"items":[{"id":"mo1","text":"Has McDonald''s App on phone and is familiar with using it to aid guests"},{"id":"mo2","text":"Has set a target for the shift with manager"},{"id":"mo3","text":"Service apron is on and stocked with a little bit of everything"}]},{"id":"mo_s2","name":"Assembly","weight":0.2,"items":[{"id":"mo4","text":"Assembles order as it appears on monitor according to \"order of assembly\""},{"id":"mo5","text":"Able to \"Pick and GO\" efficiently"},{"id":"mo6","text":"Double checks order for accuracy"},{"id":"mo7","text":"Places pick ticket sticker in the middle of the bag"},{"id":"mo8","text":"Does not make ice cream products until the guest arrives"}]},{"id":"mo_s3","name":"Front Counter","weight":0.2,"items":[{"id":"mo9","text":"Presents order by calling out guest''s name (order # only if no name or unsure of pronunciation)"},{"id":"mo10","text":"Places order in designated area with pick ticket facing dining room if guest has not arrived"},{"id":"mo11","text":"SMILEs and thanks the guest; follows correct procedures for serving the order off"}]},{"id":"mo_s4","name":"Drive Thru","weight":0.2,"items":[{"id":"mo12","text":"Order taker greets guest by name (if provided) once order number is given; confirms order accuracy"},{"id":"mo13","text":"Cashier greets the guest by name"},{"id":"mo14","text":"Presenter smiles, makes eye contact, mentions key items, confirms condiments; bag is double folded; thanks guest"}]},{"id":"mo_s5","name":"Curbside","weight":0.2,"items":[{"id":"mo15","text":"Gives personalized greeting at vehicle using guest''s name if provided"},{"id":"mo16","text":"Presents order and calls out any special items"},{"id":"mo17","text":"Asks guest to double check their order, then thanks them for their visit"}]}]'::jsonb),
  ('tpl_brower', 'Martin Brower Checklist', 'Brower', '[{"id":"mb_s1","name":"Pre-Delivery","weight":0.3,"items":[{"id":"mb1","text":"Reposition freezer & walk-in stock to accommodate new stock, ensuring proper rotation (FIFO); inspect and clean floors, thresholds, and underneath all shelving"},{"id":"mb2","text":"Move DT clearance sign if necessary; remove ladders, garbage and obstructions from delivery corridors"},{"id":"mb3","text":"Move all empty bun trays and milk crates outside and store them safely"},{"id":"mb4","text":"Reviewed safe lifting practices (examine load weight, ask for help if needed, safe techniques)"},{"id":"mb5","text":"If using NestaFlex Gravity Conveyor, Manager reviews safe use and warnings before each use"}]},{"id":"mb_s2","name":"During Delivery","weight":0.4,"items":[{"id":"mb6","text":"Places \"detour\" sign/chains off the Drive-Thru entrance lane (if applicable)"},{"id":"mb7","text":"Air curtains left in place at all times to maintain freezer and walk-in temperatures"},{"id":"mb8","text":"Shell eggs are on the lowest shelf (food safety)"},{"id":"mb9","text":"Proper lifting techniques used – bend knees, use legs NOT back"},{"id":"mb10","text":"Tender Loving Care used with all sensitive products (especially FRIES)"},{"id":"mb11","text":"Ensures 2-inch gap between product and walls/other boxes using empty bun trays along perimeter"},{"id":"mb12","text":"Empty milk crate placed in front of delivery door to prevent product from opening panic bar (if applicable)"},{"id":"mb13","text":"No employees on the Brower Truck for any reason"},{"id":"mb14","text":"Path from truck to unloading area is clear for free and safe movement"},{"id":"mb15","text":"Fridge & freezer pallets unloaded within max 10 minutes each; 2 people navigate carts when in motion"},{"id":"mb16","text":"Buns moved directly from truck into freezer; no product left unattended"}]},{"id":"mb_s3","name":"Post-Delivery","weight":0.3,"items":[{"id":"mb17","text":"Bottled water placed in walk-in refrigerator"},{"id":"mb18","text":"\"Detour\" sign removed, DT entrance unblocked, clearance sign moved back"},{"id":"mb19","text":"ALL stock properly rotated (FIFO) and placed correctly with product names facing forward"},{"id":"mb20","text":"Yogurt tube cambro containers prepped with lids (minimum 6-8)"},{"id":"mb21","text":"Product name and EXPIRY DATE recorded on boxes in walk-in refrigerator (dressings, cheeses, sauces, etc.)"},{"id":"mb22","text":"Tomatoes placed on bun trays with fresh liners, stem side down, max 20-25 per tray, AT ROOM TEMPERATURE – NEVER IN FRIDGE"},{"id":"mb23","text":"All Operating Supplies placed in appropriate spots and reorganized if necessary"},{"id":"mb24","text":"Non-Product entered in Excel Non-Product Tracker"},{"id":"mb25","text":"Completed checklist placed in Food Safety Binder under \"Brower Delivery Checklist\" tab"}]}]'::jsonb)
on conflict (id) do nothing;

-- ============================================================================
-- Realtime — let every device see new checks the moment they're submitted.
-- Realtime respects the SELECT policies above, so each user receives live
-- updates ONLY for rows they're allowed to see.
-- ============================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.checks;    exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.templates; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.profiles;  exception when duplicate_object then null; end;
  end if;
end $$;
