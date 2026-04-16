# Kafé — Project Context

## Business & people

Baptiste is the operational co-founder and owner of Kafé (kafe.paris), a specialty coffee and fast-casual food concept located at 12 rue Martel, Paris 10e, operated under the entity ALP/Kafé. Baptiste partners with Thibaud, whose holding company Iconic Group (Belgian entity) holds the majority stake in Kafé. Baptiste serves as Directeur Général with full operational responsibility; Thibaud acts as President and primary financial backer with network connections (notably ties to Hexa/eFounders ecosystem).

The concept is positioned between specialty coffee and quality fast-casual dining — comparable references include Cojean, Dumbo, and Erewhon on the fast-casual axis, and Holybelly / Ten Belles / Season on the neighborhood specialty-coffee axis. The 10e arrondissement reads bobo-hipster-arty rather than health-obsessed — craft, design, story, producer-sourcing signals beat "clean eating" framing; vegan and sans-gluten angles can work as curation rather than health claims. A nearby gym adds a post-workout segment but doesn't shift the overall positioning. Target clientele: neighborhood freelancers, local professionals, and nearby office workers. Key differentiators include artisanal sourdough sandwich triangles, a curated beverage selection (including the Bébéccino plant-based milk drink line), and a "basecamp" atmosphere suited to both quick takeaway and work sessions.

Key team members: Laura (operational right hand, Kitchen Manager & Barista — rigorous, process-oriented, military-style tendency), Lucie (barista), Lionel (cook — craft-focused, prefers stable planning), Tristan (salle/service — calm, good-humored under pressure). Key collaborators: Zazie (architect), Julien Chollet (menuisier), Walid (electrical/plumbing), Melho (decorator), Olivier (signage/menu design), Tanguy (website). Accountant: Xavier. Finance contact at Iconic Group: Inès. Thibaud's chief of staff: Charlotte.

The project underwent a prior iteration ("Douze," a different Paris location) that did not proceed. Kafé launched in early April 2026.

## Current state

Kafé has been open for several weeks. Baptiste is navigating post-launch operational and strategic tensions:

- **Positioning tension**: The physical setup (green banquettes, condiment bar) invites staying, while the intended concept leans takeaway — this contradiction needs resolution.
- **Production vs. waste**: Risk of over-producing to fill display fridges visually, leading to end-of-day waste.
- **Fridge positioning problem**: The two display fridges (20k€ investment) are perceived as "cheap" by customers — a mix of sandwiches, salads, bowls, and 4€+ bottled drinks creates an incoherent offer, empty-look when partially stocked, and price/perception mismatch on premium drinks next to yogurts. Sandwich-in-fridge is ruled out; chia/skyr sell well but waste remains; salads are hard to forecast.
- **Partner alignment**: Thibaud favors simplicity and limiting offerings; Baptiste wants to open delivery platforms with structured combos. This misalignment is a live discussion.
- **Menu gaps**: Healthy options are underrepresented despite strong signals from chia and skyr bowl sales.
- **Financing**: A loan offer from Caisse d'Épargne Île-de-France (84-month fixed-rate, BPI guarantee at 60%) has been negotiated. Key positions: reduce/waive frais de dossier (framing Iconic Group as the long-term client relationship), restructure CNP insurance to 50/50 rather than 100% per associate, and have Iconic Group bear the personal guarantee (caution personne physique) as majority shareholder, targeting 50% or zero individual exposure.
- **Website**: kafe.paris is built on Figma Sites. Recent CSS issues included text-transform conflicts, scroll-blocking via 100dvh, and layout breakage from column width changes. A stable state was restored via Version History.
- **Operational ramp-up**: Baptiste's strategic read is strong but operational fluency on the floor (salle service, commande prise, group handling) is still thin. First large group (13 pax, table service) exposed the gap — no morning brief, disorganized solicitation of the team, some orders missed. Laura gave a direct post-mortem; Baptiste accepted the feedback. Identified needs: morning service brief ritual, group 8+ protocol, targeted immersion on individual posts before claiming authority over them.

## On the horizon

- Resolving the takeaway vs. dine-in positioning with Thibaud
- Decision on opening delivery platforms and combo structure
- Adding healthy menu options (building on chia/skyr bowl traction)
- Adding ingredient text to recipe items on the website (two options identified: direct Figma edits per item, or Figma Sites CMS with a dedicated "Ingrédients" field)
- Finalizing bank financing terms and executing the Caisse d'Épargne loan
- Potential B2B supply collaborations (Rune partnership explored; white-label prepared dishes and products like chia puddings identified as better fit than sandwiches)
- Installing a daily morning service brief (5 min, non-negotiable, Baptiste leads)
- Writing a "groupe 8+" protocol with Laura: mandatory reservation, restricted menu/combos, pre-order where possible, pre-service team brief, dedicated order-taker, table plan
- Blocking targeted immersion weeks (one on salle/barista, one in cuisine with Lionel) to build operational authority
- Redesigning the fridge strategy: one fridge = one job (e.g. petit-déj / goûter curaté with chia, skyr, overnight oats, jus pressés — framed as craft/producer, not "healthy"); move 4€+ bottled drinks either behind the counter (staff-recommended) or into a fully staged dedicated drinks fridge; reduce SKUs and increase depth per SKU; attack forecasting via B2B pre-orders and a loyalty-card "tail" discount after 15h. Test on one fridge for 2 weeks before extending.
- Getting sandwich triangles out of the fridge into a dedicated counter-area display (échelle, wall shelf, panière, marble + cloche — to discuss with Zazie/Melho). Needs HACCP-compliant rhythm (2-4h max at ambient, continuous prod, afternoon cut-off to back-fridge) and a counter audit to free linear space before committing to a support. Target: 8-12 triangles visible, upstream of checkout, eye-level.

## Key learnings & principles

- **Sandwich white-labeling doesn't work**: Triangle sandwiches visually signal Kafé to end customers regardless of recipe, making them unsuitable for B2B supply to partners wanting their own brand identity. Plated/prepared dishes and products like chia puddings are better B2B candidates.
- **Iconic Group as the anchor relationship**: In bank negotiations, framing Kafé as one node in the Iconic Group portfolio strengthens leverage on fees and guarantees.
- **Personal guarantees follow corporate roles, not ownership**: As DG (not President), Baptiste's legal exposure differs from Thibaud's; Iconic Group as majority shareholder is the appropriate guarantor.
- **Production calibration before volume commitments**: Baptiste established a principle of spending the first weeks post-opening calibrating production capacity before committing to B2B volumes.
- **Operational sequencing matters**: In renovation/build-out, structural and infrastructure work must be completed before finishes and equipment installation to avoid rework.
- **Authority on a post requires mastery of it**: Giving directions without knowing the work invites pushback. Before claiming operational authority over a station (salle, barista, cuisine), spend focused time owning it.
- **Preparation beats improvisation in service**: "Aura" and clear direction in the moment come from the prep that happened before the shift, not from reacting live. Morning brief + known-group protocol replace heroics.
- **Laura's rigor is an asset, not a threat**: Her process instinct fills a gap Baptiste doesn't (yet) cover. Channel it rather than counter-balance it. She writes the ops process in her zone; Baptiste holds strategic direction and service tempo. Over-processing is easier to loosen later than chaos is to structure.
- **"Être partout, donc nulle part"**: DG trap. Pick a single post per service and hold it rather than sampling across the floor.
- **One fridge = one job**: A display fridge that mixes categories (food, drinks, snacks) reads as commodity/supermarché and devalues premium items. Dedicate each fridge to a single universe, reduce SKUs, increase depth. Half-empty kills perceived value — a "full" fridge sells, a half-stocked one depreciates the whole offer.
- **Premium drinks need context to justify price**: Bottled drinks at 4€+ self-served in a fridge next to yogurts feel expensive; the same bottles recommended by staff or staged in a dedicated, theatrical display read as curated. Positioning is half the price.
- **Neighborhood reads beat menu theory**: The 10e rewards craft/design/story/producer framing more than "healthy/clean eating". A strong sales signal on one category (e.g. chia/skyr) doesn't automatically translate to a broader positioning — check that the framing matches the quartier before building strategy on it.
- **The signature product belongs in the window**: Hiding the triangle sandwich in a fridge erases its visual role. A signature item earns a dedicated, theatrical display — limited quantity, eye-level, upstream of the register — even when counter space is tight (audit first, then buy the fixture).

## Approach & patterns

- **Communication style — general**: Direct, concise, and founder-mode. Prefers short sentences and active verbs. Pushes back on drafts that are wordy, over-structured, or include filler.
- **Communication style — by register**:
  - Formal documents and team briefs: structured, bienveillant, with explicit reciprocity (not just demands but what each person can expect in return)
  - Thibaud (WhatsApp): short fragments, no punctuation, no bullet points, energy-forward — matching Thibaud's natural style
  - Stakeholder emails: direct, peer-to-peer, flowing prose over bullet lists
  - Negotiations: firm but fair, win-win framing, no unnecessary information volunteered
- **Iterative refinement**: Provides targeted corrections to specific sections rather than full rewrites; expects Claude to incorporate edits cleanly without re-explaining them.
- **Notion formatting**: Prefers copy-pasteable plain prose for notes destined for Notion — no tables (breaks on paste).
- **Team management calibration**: Adjusts asks per person — Laura can be heavily loaded; Lucie should not be over-pressured; Lionel is focused on craft rather than commercial outcomes.
- **Stakeholder communications**: Prefers to arrive at meetings as the one setting the agenda and framing topics as collective decisions, not as someone being interrogated.

## Tools & resources

- **POS**: Square
- **Website**: Figma Sites (kafe.paris)
- **Project management**: Notion
- **Coffee equipment**: La Marzocco Linea Classic S (espresso), Marco BRU (filter), Fellow Ode (grinder)
- **Suppliers (established or in discussion)**: Feve (roaster), Archibald (bread), Accent Bio/KULT (kefir), RISH Kombucha, OyeYaar, June (chocolaterie), Foodflow, Rungis Market (produce pricing reference)
- **Network**: Hexa/eFounders ecosystem (Thibaud's connections); Paris Initiative Entreprendre (PIE) financing
- **Legal/admin**: Legalstart (incorporation), Xavier (accountant), Laura David (legal)
- **Banking**: Caisse d'Épargne Île-de-France (primary loan, contact: Adam Behloul); Crédit Agricole Île-de-France also approac
