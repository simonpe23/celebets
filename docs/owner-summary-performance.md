# The owner's own summary of the Performance redesign

**Written by him, 26 August 2026. Verbatim. Nothing below the line has
been edited, corrected, tidied or paraphrased**, including its typos.

**This is a primary source and it outranks every other document.**
Everything in `docs/decisions.md` and `docs/performance-brief.md` about
Performance is my write-up of his voice notes, heard through a chat that
compacted twice. This is him, in writing, unfiltered. Where the two
disagree, this wins, and the other file is the one to fix.

His own framing: "its a summary of my brain dump from 2 days ago."

---

Summary of Performance Page Redesign:

First - the page will now have 4 buttons at the bottom. Track, Performance, Research, Profile
The new Performance area, one page, three tabs at the top:

* Home (was Review, name still fluid): the ranked list mixing everything, just as our mockup Moneyline next to Premier League next to Low odds. Its job: tell you what you are good at within seconds. Close to the prototype home we built.
Inside Home lives Insights and What Changed. See description below.
* Lab: the builder. The view we spent most time on, chips plus the + sign, click Moneyline then Tennis. Lab V1's spirit, formally back. Heatmap added. Similar to one of our mockups. I like that one!
* Totals: today's live actuals.cc/stats content. Sports breakdown, odds groups, singles vs parlays, categories. The quick scan of every slice. Ask me if you want to see how it looks today and you'll redesign it.

Other pages:

* Compare: survives, your current lean is inside Lab. Open. I want a button to pop up that says compare - whenever two boxes inside lab are highlighted.
* Insights: reachable from every page as a popup, AND a real page of its own via "view all insights". That page is new and needs designing.
* What changed page: survives, an exciting button, living in Home. Once clicked, the page stays the same, but the top list changes, from your all time top list to a new top list of what has changed. Can still filter on 1 day, 1 week, 1 month etc.
* Betting history: Will have a proper home. All bets will be inside the totals page. It's a  scroll at the bottom of Totals with your last 50 bets, but a button will be there. Click it to see all betts.

Cut from last weeks multiple mockups (they were good looking, so great job! but were cutting them.)

* The insight card modal. Good-looking, no home.
* All facts as a page. You have changed your mind, it is gone.

Untouched for now: Track and Research and Settings.

---

Compare - described.

* What you described: select Football and Baseball in Lab, see the combined total, and a Compare button appears that flips the same two selections from "added together" to "side by side".
* Why it is good: Compare stops being a place you go and becomes a lens on what you already selected. It kills the standalone Compare page, the rival-picker sheet, and the "where does Compare live" question in one move. One selection, two readings.
* Compare appears whenever exactly two things are selected, whatever they are, and disappears at three.

Betting history

* One page with multiple doors. One inside Track and one inside Performance / Lab and one inside Performance / Totals.
* The extra move: When highlighting From Lab, with Moneyline and Tennis selected, the door reads "See these 26 bets" and opens betting history already filtered to them. From Track and  it opens unfiltered.

Questions and answers:

* What does tapping a ranked row on Home do?
Answer: Jump to Lab with that fact selected? Something else? This is the main seam between your two biggest tabs and it decides whether the area feels like one product.
* Same for a heatmap tile.


* The insights popup, reachable from where exactly? Everywhere in Performance + from Track. The sparkle and yellow color, similar to our mockups is the trigger.
* Does Home keep a door to Lab? Yes I like the "Build your Performance View" button inside home. It takes you to an empty lab with nothing selected.

Lastly:
• • Three pills inside Performance plus three tabs at the bottom is two tab systems on one screen. I think it can work, the earlier mockups already draw segmented pills that looks great.
