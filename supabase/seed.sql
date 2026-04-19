-- ─────────────────────────────────────────────────────────────────────────────
-- SOLVE THE MURDERS — Seed Data
-- 3 free cases + 2 premium cases with full suspect rosters
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE 1: The Glenwood Estate (FREE · Easy)
-- ─────────────────────────────────────────────────────────────────────────────

WITH case1 AS (
  INSERT INTO public.cases (
    title, difficulty, is_free, order_index, setting, victim_name, victim_description,
    story_intro, solution_killer, solution_motive, solution_method
  ) VALUES (
    'Death at Glenwood Estate',
    'easy',
    TRUE,
    1,
    'A grand Victorian manor on the English countryside, 1923',
    'Lord Edmund Glenwood',
    'Wealthy patriarch, 67, found dead in his locked study at 9 PM on a stormy Thursday',
    'Lord Edmund Glenwood was found dead in his locked study by his butler, Harold, at precisely nine o''clock on a stormy Thursday evening. A glass of brandy sat half-finished on his desk. The doors were locked from the inside, the windows latched. His family had gathered for the annual reading of the estate accounts — and someone among them had used the storm as cover for murder.',
    'Victor Glenwood',
    'Victor stood to lose his entire inheritance — Lord Edmund had discovered his gambling debts and planned to cut him from the will at the next morning''s meeting with the solicitor',
    'Poison — an extract of belladonna stirred into the brandy decanter, which Victor had access to from the kitchen'
  ) RETURNING id
)
INSERT INTO public.suspects (case_id, name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer)
SELECT
  c.id,
  s.name,
  s.role,
  s.description,
  s.personality,
  s.knowledge_base::jsonb,
  s.hidden_truths::jsonb,
  s.reveal_conditions::jsonb,
  s.is_killer
FROM case1 c,
(VALUES
  (
    'Victor Glenwood',
    'Eldest Son',
    'Lord Edmund''s eldest son, 38. Impeccably dressed, perpetually nervous. Has not looked anyone in the eye since the body was found.',
    'Charming on the surface, deflects personal questions with wit. Becomes agitated when finances are mentioned.',
    '{"alibi": "Claims he was in the billiard room all evening with his wife", "relationship_to_victim": "Son, expected to inherit the estate", "timeline": "Last seen entering the study at 7:45 PM, claims he left at 8 PM"}',
    '{"debt_amount": "Victor owed £14,000 to a London gambling club", "will_change": "Lord Edmund met with solicitor on Wednesday and instructed a change to the will", "poison_access": "Victor spent 20 minutes alone in the kitchen pantry before dinner"}',
    '{"leverage_required": "Confronting him about the will change or the kitchen visit will make him slip"}',
    TRUE
  ),
  (
    'Lady Claire Glenwood',
    'Victim''s Wife',
    'Lord Edmund''s second wife, 44. Composed, elegant. Shows little outward grief.',
    'Cold and calculating. Speaks in precise sentences. Will answer questions but never volunteers information.',
    '{"alibi": "Was in her bedroom all evening, claims to have heard nothing", "relationship_to_victim": "Second wife, married 6 years", "timeline": "Did not come down for dinner, said she had a headache"}',
    '{"affair": "Lady Claire was conducting an affair with Dr. Henley", "knowledge_of_will": "She knew Edmund was changing the will but did not know Victor was being cut"}',
    '{"leverage_required": "Mentioning Dr. Henley by name will unsettle her"}',
    FALSE
  ),
  (
    'Harold Pemberton',
    'Butler / First Witness',
    'The estate butler, 62. Discovered the body. A man of rigid routine and impeccable discretion.',
    'Formal, precise, loyal to the estate above all. Volunteered to find the body — and called the police himself.',
    '{"alibi": "Was serving in the dining room from 7 PM until he found the body at 9 PM", "what_he_saw": "Noticed Victor returning from the study wing at approximately 8:05 PM, coat pockets bulging", "timeline": "Knocked on the study door at 9 PM as was routine, heard no response, found it locked"}',
    '{"observation": "Harold saw Victor pocket something from the kitchen pantry but said nothing out of loyalty", "sound": "Heard what he thought was the scrape of the study window latch at 8:30 PM"}',
    '{"leverage_required": "Ask him directly what he saw Victor carry out of the study wing"}',
    FALSE
  ),
  (
    'Dr. Arthur Henley',
    'Family Physician / Coroner',
    'The family doctor who attended the scene, 52. Served the Glenwoods for 15 years.',
    'Professional but evasive about personal matters. Gives clipped medical answers.',
    '{"cause_of_death": "Cardiac arrest, preliminary; awaiting toxicology", "time_of_death": "Between 8 PM and 8:45 PM based on body temperature", "medical_history": "Lord Edmund was in good health for his age"}',
    '{"affair": "Dr. Henley was having an affair with Lady Claire and would benefit from Edmund''s death", "toxicology": "Preliminary tests show belladonna alkaloids present in the brandy glass"}',
    '{"leverage_required": "Pressing on the toxicology results will make him admit belladonna was found"}',
    FALSE
  ),
  (
    'Constable Reeves',
    'Police',
    'The local constable who arrived first on the scene, 34. Methodical if unsophisticated.',
    'Earnest and cooperative. Shares what he knows. A bit out of his depth with wealthy families.',
    '{"scene_notes": "Study locked from inside; key found in victim''s waistcoat pocket", "window_status": "North window found unlatched despite stormy weather", "fingerprints": "Partial fingerprint found on the brandy decanter, still being examined"}',
    '{"fingerprint_match": "The partial fingerprint matches Victor''s right thumb according to Scotland Yard"}',
    '{"leverage_required": "Ask about the fingerprint on the decanter once you have facts about Victor"}',
    FALSE
  ),
  (
    'Margaret Glenwood',
    'Suspect',
    'Lord Edmund''s daughter from his first marriage, 32. A sharp, observant woman who lives in London.',
    'Direct and sardonic. Does not hide her disdain for her stepmother.',
    '{"alibi": "Was in the library all evening, can be verified by the maid", "relationship_to_victim": "Daughter, trusted advisor on estate finances", "motive_assessment": "She knew about Victor''s debts and was furious her father would not cut him out sooner"}',
    '{"overheard_argument": "Margaret overheard Victor and Lord Edmund arguing about money at 7:30 PM in the study"}',
    '{"leverage_required": "She will share what she overheard if asked about the 7:30 PM timeframe"}',
    FALSE
  )
) AS s(name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer);

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE 2: The Midnight Gallery (FREE · Medium)
-- ─────────────────────────────────────────────────────────────────────────────

WITH case2 AS (
  INSERT INTO public.cases (
    title, difficulty, is_free, order_index, setting, victim_name, victim_description,
    story_intro, solution_killer, solution_motive, solution_method
  ) VALUES (
    'The Midnight Gallery',
    'medium',
    TRUE,
    2,
    'A contemporary art gallery in downtown Chicago, present day',
    'Renata Voss',
    'Gallery owner and art dealer, 51, found stabbed in her private office on the night of a major exhibition opening',
    'The night of the Voss Gallery''s most anticipated opening — a collection of never-before-seen works by reclusive artist Julian Marre — ended not with applause but with a scream. Renata Voss, the gallery''s iron-fisted owner, was found stabbed in her private second-floor office at 10:47 PM. The guests were still downstairs. The killer was still in the building.',
    'Derek Osei',
    'Renata had discovered that Derek, her head curator, had been selling forgeries of gallery pieces through a shell company. She had called him to her office that evening to confront him before going to the police',
    'Stabbed with a bronze letter opener from Renata''s own desk'
  ) RETURNING id
)
INSERT INTO public.suspects (case_id, name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer)
SELECT
  c.id,
  s.name,
  s.role,
  s.description,
  s.personality,
  s.knowledge_base::jsonb,
  s.hidden_truths::jsonb,
  s.reveal_conditions::jsonb,
  s.is_killer
FROM case2 c,
(VALUES
  (
    'Derek Osei',
    'Head Curator',
    'Renata''s long-serving head curator, 44. The creative force behind the gallery for a decade.',
    'Smooth, confident, too comfortable. Answers questions about art with passion. Becomes clipped when asked about business operations.',
    '{"alibi": "Claims he was overseeing the caterers on the ground floor until the body was found", "relationship_to_victim": "Professional — worked together 10 years", "timeline": "Was seen on the second floor at 10:15 PM by a server"}',
    '{"forgery_ring": "Derek ran a forgery operation out of a warehouse in Pilsen, selling copies of gallery works through a shell company registered in Delaware", "confrontation": "Renata emailed him at 9:30 PM: ''Come upstairs at 10. Bring the ledger. We need to talk.''", "weapon": "Derek''s fingerprints are on the letter opener"}',
    '{"leverage_required": "Mention the email or the shell company and he will crack"}',
    TRUE
  ),
  (
    'Priya Sharma',
    'Artist / Suspect',
    'Rising star featured in the exhibition, 29. Intense and guarded.',
    'Defensive about her work. Visibly anxious. Keeps checking her phone.',
    '{"alibi": "Was speaking to gallery guests during the estimated window of death", "relationship_to_victim": "Professional — Renata had exclusive rights to her work", "grievance": "Renata took 60% commission and had threatened to void Priya''s contract if she showed anywhere else"}',
    '{"overheard": "Priya overheard Renata and Derek arguing about ''the ledger'' at 9:45 PM near the stairwell"}',
    '{"leverage_required": "Ask her what she heard near the stairwell"}',
    FALSE
  ),
  (
    'Officer Nguyen',
    'Police',
    'First officer on scene, 36. Calm and efficient.',
    'Professional. Shares official findings. Tight-lipped about ongoing forensics.',
    '{"scene_notes": "Office locked from inside; door breached by security. No signs of forced entry via window.", "weapon_status": "Letter opener found wiped clean but trace blood found under desk", "time_of_death": "Coroner estimates 10:30–10:50 PM"}',
    '{"fingerprint_result": "Partial print on the letter opener handle matched to Derek Osei in AFIS"}',
    '{"leverage_required": "Mention Derek''s presence on the second floor and the fingerprint match becomes relevant"}',
    FALSE
  ),
  (
    'Julian Marre',
    'Suspect',
    'The reclusive artist whose work the exhibition featured. Rarely seen in public.',
    'Eccentric, evasive, intensely private. Speaks in fragments. Refuses to answer about his relationship with Renata.',
    '{"alibi": "Was in a private viewing room on the second floor from 9 PM onwards, alone", "relationship_to_victim": "Renata controlled his entire commercial output; he believed she was defrauding him on royalties"}',
    '{"financial_dispute": "Julian was owed $340,000 in unpaid royalties and had threatened legal action last month", "innocence": "Julian did not kill Renata — his dispute was financial, not violent. He was in the viewing room with noise-cancelling headphones."}',
    '{"leverage_required": "His alibi checks out under examination. He''s a red herring."}',
    FALSE
  ),
  (
    'Marcus Webb',
    'Ballistics / Forensics',
    'Crime scene technician, 41.',
    'Precise, evidence-focused. Answers questions factually.',
    '{"trace_evidence": "Fibre from a navy blue cashmere blazer found caught on the desk corner", "blood_spatter": "Consistent with single forward thrust, attacker was standing", "entry_time": "Security card logs show Derek''s key card accessed the second floor at 10:08 PM"}',
    '{"blazer_match": "Derek Osei was wearing a navy cashmere blazer that evening — logged in the security camera footage"}',
    '{"leverage_required": "Ask about the security card log to get the 10:08 PM access time"}',
    FALSE
  )
) AS s(name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer);

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE 3: The Silent Harbour (FREE · Medium)
-- ─────────────────────────────────────────────────────────────────────────────

WITH case3 AS (
  INSERT INTO public.cases (
    title, difficulty, is_free, order_index, setting, victim_name, victim_description,
    story_intro, solution_killer, solution_motive, solution_method
  ) VALUES (
    'The Silent Harbour',
    'medium',
    TRUE,
    3,
    'A small fishing town on the Maine coast, present day',
    'Captain Ray Doyle',
    'Retired fishing captain, 63, found drowned in the harbour — but not by the sea',
    'Captain Ray Doyle''s body was found floating in the harbour at dawn, tangled in his own mooring ropes. The coroner found no water in his lungs — he was dead before he hit the water. In a town where everyone knows everyone, and where old debts run as deep as the tides, someone had finally decided the Captain had lived long enough.',
    'Sylvia Doyle',
    'Sylvia had discovered Ray had a second family in Portland — a woman and two children he''d supported for 12 years while draining their joint savings. She had confronted him the night of his death',
    'Blunt force trauma to the back of the skull with a mooring cleat, then pushed into the harbour to disguise the death as drowning'
  ) RETURNING id
)
INSERT INTO public.suspects (case_id, name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer)
SELECT
  c.id,
  s.name,
  s.role,
  s.description,
  s.personality,
  s.knowledge_base::jsonb,
  s.hidden_truths::jsonb,
  s.reveal_conditions::jsonb,
  s.is_killer
FROM case3 c,
(VALUES
  (
    'Sylvia Doyle',
    'Victim''s Wife',
    'Ray''s wife of 28 years, 60. A quiet, dignified woman who runs the local bakery.',
    'Soft-spoken but watchful. Answers in short, careful sentences. Shows little emotion but her hands shake.',
    '{"alibi": "Claims she was at home all evening after dinner at the Anchor Inn at 7 PM", "relationship_to_victim": "Wife, married 28 years", "last_seen_together": "They were seen arguing outside the Anchor Inn at 7:30 PM"}',
    '{"second_family": "Sylvia discovered bank statements showing Ray had been supporting a woman named Karen Wells in Portland — two children, 12 and 9", "confrontation": "She confronted Ray at the harbour at 9 PM. She struck him once with the mooring cleat when he laughed at her", "weapon_disposal": "She threw the cleat into the water after the act; it''s now lodged under the dock at berth 4"}',
    '{"leverage_required": "Mention Karen Wells or the Portland bank transfers; she will fall apart"}',
    TRUE
  ),
  (
    'Pete Calloway',
    'First Witness',
    'Harbour master, 58. Found the body at 5:45 AM.',
    'Blunt, no-nonsense. Deeply unsettled by the death — Doyle was his oldest friend.',
    '{"what_he_saw": "Found the body at 5:45 AM tangled in mooring ropes at berth 4. Noticed the body was unusually positioned — face up.", "sounds_heard": "His dog was barking toward the harbour around 9:15 PM but he thought nothing of it"}',
    '{"observation": "Pete noticed Sylvia''s car parked near the harbour at 9:05 PM when he took his dog for a walk — he hasn''t mentioned this to police yet"}',
    '{"leverage_required": "Ask him about his 9 PM dog walk and he will recall seeing the car"}',
    FALSE
  ),
  (
    'Sheriff Dana Lowe',
    'Police',
    'Local sheriff, 45. Competent, cautious, reluctant to point fingers in a small community.',
    'Measured. Professional. Clearly uncomfortable with the pressure of the case.',
    '{"official_finding": "Cause of death: blunt force trauma to occipital region. Death predates water entry by approximately 30 minutes.", "suspects_interviewed": "All family members and harbour regulars interviewed", "no_weapon_found": "No weapon recovered at scene yet"}',
    '{"cleat_location": "An underwater search of berth 4 was scheduled but not yet conducted due to poor visibility"}',
    '{"leverage_required": "Mention berth 4 specifically and she will order the dive immediately"}',
    FALSE
  ),
  (
    'Tommy Reyes',
    'Suspect',
    'Ray''s former first mate, 39. Was fired three months ago under disputed circumstances.',
    'Angry, resentful, clearly holds a grudge. Keeps insisting Ray ''had enemies''.',
    '{"alibi": "Was at the Tackle Bar from 8 PM until closing at midnight — verified by at least four witnesses", "motive_claimed": "Insists Ray cheated him out of $8,000 in back pay"}',
    '{"innocence": "Tommy''s alibi is rock-solid. He is a red herring — genuinely angry but had no opportunity", "extra_info": "Tommy does know about the Portland woman — Ray bragged to him about it once when drunk"}',
    '{"leverage_required": "Ask him if Ray ever confided anything personal. He will mention Portland."}',
    FALSE
  ),
  (
    'Dr. Miriam Cross',
    'Coroner',
    'County medical examiner, 52.',
    'Methodical and exacting. Speaks in clinical language but is thorough when pressed.',
    '{"cause_of_death": "Blunt force trauma to the posterior skull, single blow. Death occurred at approximately 9 PM.", "water_entry": "No water found in lungs — victim was dead before entering the water", "wound_profile": "Wound consistent with a curved metal object, diameter 4–6 inches"}',
    '{"wound_match": "A mooring cleat would be consistent with the wound profile. She has not been asked to compare yet."}',
    '{"leverage_required": "Ask her specifically about mooring hardware and she will confirm a match is possible"}',
    FALSE
  )
) AS s(name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer);

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE 4: Boardroom at Midnight (PREMIUM · Hard)
-- ─────────────────────────────────────────────────────────────────────────────

WITH case4 AS (
  INSERT INTO public.cases (
    title, difficulty, is_free, order_index, setting, victim_name, victim_description,
    story_intro, solution_killer, solution_motive, solution_method
  ) VALUES (
    'Boardroom at Midnight',
    'hard',
    FALSE,
    4,
    'A 52-floor corporate tower in Manhattan, present day',
    'Franklin Holt',
    'CEO of Holt Capital, 58, found dead in the executive boardroom at 2 AM on the night of a hostile takeover vote',
    'The night Holt Capital''s board was to vote on a hostile takeover bid from Meridian Group, CEO Franklin Holt was found dead in the 52nd-floor boardroom with a shattered scotch glass beside him and a vote that would never be cast. Seven people had access to that floor after midnight. Each had reason to want the takeover to succeed — or fail. The city lights below were indifferent.',
    'Cassandra Holt-Briggs',
    'Franklin''s own COO — and secret daughter from an affair — had discovered he was planning to name a rival as successor and sell the company against the board''s wishes, erasing her from both the legacy and a $40M inheritance clause',
    'Sedative added to the scotch decanter, then pushed from the balcony to stage a suicide — the sedative would have appeared as alcohol in a cursory toxicology'
  ) RETURNING id
)
INSERT INTO public.suspects (case_id, name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer)
SELECT
  c.id,
  s.name,
  s.role,
  s.description,
  s.personality,
  s.knowledge_base::jsonb,
  s.hidden_truths::jsonb,
  s.reveal_conditions::jsonb,
  s.is_killer
FROM case4 c,
(VALUES
  (
    'Cassandra Holt-Briggs',
    'Chief Operating Officer',
    'Franklin''s COO, 34. Brilliant, ruthless, intensely loyal to the company — or so everyone thought.',
    'Composed under pressure. Answers in precise corporate language. A slight pause before personal questions.',
    '{"alibi": "Claims she was in her office on floor 51 reviewing merger documents until 1 AM", "relationship_to_victim": "Professional — his most trusted executive for 6 years"}',
    '{"secret_paternity": "Cassandra is Franklin''s biological daughter from an affair. Only two people knew — Franklin and his attorney.", "inheritance_clause": "Franklin''s will included a $40M clause for Cassandra, contingent on her not being convicted of a crime", "sedative_access": "Cassandra had a prescription for zolpidem; she dissolved two tablets in the decanter"}',
    '{"leverage_required": "Confront her with the paternity or the will clause and she will break character"}',
    TRUE
  ),
  (
    'Robert Vance',
    'Board Chairman',
    'Franklin''s oldest ally on the board, 67. Now the swing vote on the Meridian deal.',
    'Patrician, deliberate. Weighs every word. Does not like being questioned.',
    '{"alibi": "Left the building at 11 PM per lobby security logs", "motive": "Stood to gain $22M if the Meridian deal closed — was on the verge of voting yes"}',
    '{"deal_pressure": "Meridian''s representative had offered Robert a seat on the new board in exchange for his vote", "innocence": "Robert left before the death. His motive existed but his alibi is solid."}',
    '{"leverage_required": "He is a red herring with a real motive. His alibi is verifiable."}',
    FALSE
  ),
  (
    'Detective Lin Park',
    'Police',
    'NYPD Homicide, lead detective on the case, 43.',
    'Incisive, fast, doesn''t waste words.',
    '{"official_cause": "Blunt force and fall from height. Toxicology pending — full results in 72 hours.", "security_log": "Badge access shows Cassandra used her keycard on floor 52 at 1:17 AM", "camera_gap": "The 52nd floor camera was offline for 11 minutes starting 1:15 AM — reported as a maintenance cycle but unscheduled"}',
    '{"toxicology_preview": "Preliminary tox found traces of zolpidem in the decanter residue — not yet public"}',
    '{"leverage_required": "Ask about the unscheduled camera outage and she will confirm it was triggered manually from the server room, which Cassandra has access to"}',
    FALSE
  ),
  (
    'Nina Okafor',
    'Suspect',
    'Meridian Group''s lead negotiator, 40. Was present for a late-night deal briefing.',
    'Polished, strategic. Clearly has been coached on what to say.',
    '{"alibi": "Left building at 12:30 AM, documented by lobby sign-out", "motive": "The deal closing would have meant a $4M bonus for her personally"}',
    '{"innocence": "Nina left before the death and her sign-out is verified. She is a deliberate red herring.", "observation": "Nina passed Cassandra in the elevator going up at 12:55 AM — Cassandra told her she forgot her phone"}',
    '{"leverage_required": "Nina will mention the 12:55 AM elevator encounter if asked who she saw leaving"}',
    FALSE
  ),
  (
    'Dr. Samir Nath',
    'Coroner / Medical Examiner',
    'NYC Medical Examiner, 55.',
    'Thorough and methodical. Will share what the evidence shows.',
    '{"cause_of_death": "Trauma from fall; secondary blunt force injury to posterior skull pre-fall.", "sedative_finding": "Trace zolpidem found in decanter residue. Concentration sufficient to impair balance significantly within 20 minutes.", "time_of_death": "1:20–1:35 AM based on core temperature"}',
    '{"zolpidem_prescription": "A search of Franklin''s medical records showed no zolpidem prescription — someone else put it there"}',
    '{"leverage_required": "Ask him if Franklin had any sedative prescription; the answer will be no"}',
    FALSE
  )
) AS s(name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer);

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE 5: The Red Room Cipher (PREMIUM · Hard)
-- ─────────────────────────────────────────────────────────────────────────────

WITH case5 AS (
  INSERT INTO public.cases (
    title, difficulty, is_free, order_index, setting, victim_name, victim_description,
    story_intro, solution_killer, solution_motive, solution_method
  ) VALUES (
    'The Red Room Cipher',
    'hard',
    FALSE,
    5,
    'A private members'' intelligence club in London, present day',
    'Hugh Calder',
    'Former MI6 officer turned private intelligence broker, 56, found dead in the club''s Red Room with a cipher on his desk',
    'Hugh Calder had sold secrets to the highest bidder for thirty years under the cover of a gentleman''s club. When he was found dead in the Red Room — a cipher written in his own blood on the blotter, a bullet through the temple — it was unclear whether it was assassination, suicide staged as a message, or something far more personal. Five people were in the building. Only one left carrying a secret worth killing for.',
    'Irina Vasquez',
    'Irina, Hugh''s most trusted analyst, had discovered he was about to sell a list of deep-cover agents — including her brother — to a foreign intelligence service. She acted to prevent it and to destroy the list before it could be transmitted',
    'Single gunshot from a suppressed .22 pistol, using a weapon she had obtained through the club''s unlicensed armoury two weeks prior. The cipher was planted to confuse investigators.'
  ) RETURNING id
)
INSERT INTO public.suspects (case_id, name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer)
SELECT
  c.id,
  s.name,
  s.role,
  s.description,
  s.personality,
  s.knowledge_base::jsonb,
  s.hidden_truths::jsonb,
  s.reveal_conditions::jsonb,
  s.is_killer
FROM case5 c,
(VALUES
  (
    'Irina Vasquez',
    'Intelligence Analyst',
    'Hugh''s most trusted analyst, 38. Brilliant, quiet, always at the edge of the room.',
    'Precise and unreadable. Answers in complete, carefully chosen sentences. Never volunteers anything personal.',
    '{"alibi": "Claims she was in the cipher room on level 2 from 9 PM until the body was found at 10:30 PM", "relationship_to_victim": "Professional — his most trusted operative for 9 years"}',
    '{"brother_on_list": "Irina''s brother, Marco, is a deep-cover operative whose identity was on the list Hugh was selling", "weapon_acquisition": "Irina checked out a .22 pistol from the club armoury 14 days ago under a false maintenance reason", "list_destruction": "She burned the list in the fireplace before the body was found — ashes are still in the grate"}',
    '{"leverage_required": "Ask her about the armoury log or the fireplace ashes and she will acknowledge the list existed"}',
    TRUE
  ),
  (
    'Control (M)',
    'First Witness / Police Liaison',
    'Hugh''s handler and the club''s de facto director, 61. Discovered the body.',
    'Authoritative and evasive. Clearly suppressing facts for institutional reasons.',
    '{"what_he_found": "Found Hugh at 10:30 PM. Door was unlocked. The cipher was already on the desk.", "list_knowledge": "Confirms Hugh had been negotiating a sale but will not name the buyer", "official_position": "Calling it a possible suicide pending ballistics"}',
    '{"suppression": "Control is suppressing the identity of the buyer to protect the club''s reputation. He knew about the list sale and did nothing."}',
    '{"leverage_required": "Press him on why he was in the building at 10:30 PM — he had no scheduled meeting"}',
    FALSE
  ),
  (
    'Commander Birch',
    'Ballistics',
    'Ballistics expert attached to the Metropolitan Police, 48.',
    'Technical, factual, precise.',
    '{"weapon_calibre": ".22 LR, suppressed based on cartridge casing found under the desk", "trajectory": "Entry wound consistent with a standing shooter at close range — not consistent with self-inflicted", "residue": "Gunshot residue found on the inside of the left desk drawer — weapon was briefly stored there"}',
    '{"armoury_match": "The .22 cartridge casing matches the specific batch issued by the club armoury. Only three weapons of that calibre were in stock."}',
    '{"leverage_required": "Ask about the armoury batch match and he will confirm it narrows the weapon to the club''s own stock"}',
    FALSE
  ),
  (
    'Oliver Crane',
    'Suspect',
    'A foreign intelligence buyer who was in the club that evening for a ''social visit''.',
    'Smooth, diplomatic, plausibly deniable. Smiles too much.',
    '{"alibi": "Was in the bar from 9 PM onwards — verified by staff", "role": "Represents the foreign intelligence service that was about to receive the list"}',
    '{"innocence": "Oliver did not kill Hugh — he was about to receive the list. Hugh''s death was against his interests.", "reaction": "He is alarmed that the list was destroyed and will attempt to obstruct the investigation subtly"}',
    '{"leverage_required": "He is a red herring. His alibi holds. But pressing him reveals the list existed."}',
    FALSE
  ),
  (
    'Dr. Presta',
    'Coroner',
    'Forensic pathologist, 50.',
    'Clinical, professional.',
    '{"cause_of_death": "Single GSW to right temporal lobe. Contact range based on stippling pattern.", "time_of_death": "9:45–10:15 PM based on lividity and core temperature", "other_findings": "Faint traces of accelerant on the victim''s right hand — consistent with having recently handled a burning document"}',
    '{"document_handling": "Hugh may have attempted to burn the list himself before being killed, or the killer placed his hand near the fire post-mortem to implicate him"}',
    '{"leverage_required": "Ask about the accelerant on his hand and she will note it is inconsistent with a self-inflicted death scenario"}',
    FALSE
  )
) AS s(name, role, description, personality, knowledge_base, hidden_truths, reveal_conditions, is_killer);
