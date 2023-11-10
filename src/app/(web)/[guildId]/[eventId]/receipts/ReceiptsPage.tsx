"use client";

import { createContext, useState } from "react";

export interface ReceiptsPage {
  tab: string;
  setTab: (tab: string) => void;
  selected: string[];
  setSelected: (selected: string[]) => void;
}

function noop() {}

export const ReceiptsPage = createContext<ReceiptsPage>({
  tab: "summary",
  setTab: noop,
  selected: [],
  setSelected: noop,
});

export function ReceiptsPageProvider({ children }: { children: any }) {
  const [tab, setTab] = useState("summary");
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <ReceiptsPage.Provider value={{ tab, setTab, selected, setSelected }}>
      {children}
    </ReceiptsPage.Provider>
  );
}
