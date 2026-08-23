"use client";

// The Portfolio living preview: one tappable prototype. Home's rows
// open the Fact Page; a fact page's grid cards narrow it; Back walks
// out. Local preview, gitignored.
//
// App owns the DIRECTION of every move, because only App knows
// whether a navigation went deeper or came back. Each view just
// wears the class. See motion.tsx for why direction is the whole
// point.

import { useMemo, useState } from "react";
import Home from "./Home";
import Fact from "./Fact";
import Compare from "./Compare";
import MapView from "./MapView";
import Changed from "./Changed";
import InsightCard from "./InsightCard";
import { makeEngine, type Chip } from "./engine";
import type { Dir } from "./motion";
import type { BetWithLegs } from "@/lib/types";

export default function App({ bets }: { bets: BetWithLegs[] }) {
  const engine = useMemo(() => makeEngine(bets), [bets]);
  const [path, setPath] = useState<Chip[]>([]);
  const [rival, setRival] = useState<Chip | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [changedOpen, setChangedOpen] = useState(false);
  const [insightOpen, setInsightOpen] = useState(false);
  const [dir, setDir] = useState<Dir>("fwd");

  // Every navigation states its own direction. Naming it at the call
  // site is the only way it can be right: a component cannot know
  // whether it is being entered or returned to.
  function go(dirTo: Dir, change: () => void) {
    setDir(dirTo);
    change();
  }

  if (changedOpen) {
    return (
      <Changed
        dir={dir}
        engine={engine}
        onOpen={(chip) =>
          go("fwd", () => {
            setChangedOpen(false);
            setPath([chip]);
          })
        }
        onBack={() => go("back", () => setChangedOpen(false))}
      />
    );
  }
  if (mapOpen) {
    return (
      <MapView
        dir={dir}
        engine={engine}
        onOpen={(chip) =>
          go("fwd", () => {
            setMapOpen(false);
            setPath([chip]);
          })
        }
        onBack={() => go("back", () => setMapOpen(false))}
      />
    );
  }
  if (rival !== null && path.length > 0) {
    return (
      <Compare
        dir={dir}
        engine={engine}
        a={path}
        b={rival}
        onBack={() => go("back", () => setRival(null))}
        onOpen={(p) =>
          go("fwd", () => {
            setRival(null);
            setPath(p);
          })
        }
      />
    );
  }
  if (path.length === 0) {
    return (
      <>
        <Home
          dir={dir}
          engine={engine}
          onOpen={(chip) => go("fwd", () => setPath([chip]))}
          onMap={() => go("fwd", () => setMapOpen(true))}
          onChanged={() => go("fwd", () => setChangedOpen(true))}
          onInsight={() => setInsightOpen(true)}
        />
        {insightOpen && (
          <InsightCard
            engine={engine}
            onExplore={(p) =>
              go("fwd", () => {
                setInsightOpen(false);
                setPath(p);
              })
            }
            onClose={() => setInsightOpen(false)}
          />
        )}
      </>
    );
  }
  return (
    <Fact
      dir={dir}
      engine={engine}
      path={path}
      onOpen={(chip) => go("fwd", () => setPath([...path, chip]))}
      onRemove={(chip) =>
        go("back", () =>
          setPath(
            path.filter(
              (c) => !(c.group === chip.group && c.value === chip.value)
            )
          )
        )
      }
      onCompare={(chip) => go("fwd", () => setRival(chip))}
      onBack={() => go("back", () => setPath(path.slice(0, -1)))}
    />
  );
}
