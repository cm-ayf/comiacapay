import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Box from "@mui/material-pigment-css/Box";
import { LineChart } from "@mui/x-charts/LineChart";
import type { LineSeriesType } from "@mui/x-charts/models/seriesType";
import { useId, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { useDisplays } from "../$guildId.$eventId";
import type { clientLoader } from "./clientLoader";
import { Snowflake } from "~/lib/snowflake";

export default function Chart() {
  const { displays } = useDisplays();
  const { receipts } = useLoaderData<typeof clientLoader>();
  const [showRevenue, setShowRevenue] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    displays.map((d) => d.itemId),
  );

  // Prepare dataset for the chart
  const dataset = useMemo(() => {
    // Initialize counters
    let totalRevenue = 0;
    const displayCounts: Record<string, number> = {};

    const dataset: Record<string, number>[] = [];
    for (const receipt of receipts.toReversed()) {
      const snowflake = Snowflake.parse(receipt.id);

      // Update revenue
      totalRevenue += receipt.total;

      // Update counts
      for (const { itemId, count } of receipt.records) {
        // Lazily initialize count for each itemId
        if (displayCounts[itemId] === undefined) displayCounts[itemId] = count;
        else displayCounts[itemId] += count;
      }

      dataset.push({
        timestamp: snowflake ? snowflake.timestamp : 0,
        revenue: totalRevenue,
        ...displayCounts,
      });
    }
    return dataset;
  }, [receipts]);

  // Create series configuration
  const series = useMemo(() => {
    const series: LineSeriesType[] = [];

    // Add revenue line if enabled
    if (showRevenue) {
      series.push({
        type: "line",
        dataKey: "revenue",
        label: "総売上 (円)",
        curve: "stepAfter",
        showMark: false,
      });
    }

    // Add selected display count lines
    for (const display of displays) {
      if (!selectedItemIds.includes(display.itemId)) continue;

      series.push({
        type: "line",
        dataKey: display.itemId,
        label: `${display.item.name} (個)`,
        curve: "stepAfter",
        showMark: false,
        connectNulls: true,
        area: true,
        stack: "count",
        yAxisId: "count",
      });
    }

    return series;
  }, [displays, showRevenue, selectedItemIds]);

  const selectLabelId = useId();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Box sx={{ display: "flex", gap: "16px" }}>
        <FormControlLabel
          control={
            <Switch
              checked={showRevenue}
              onChange={(e) => setShowRevenue(e.target.checked)}
            />
          }
          label="売上を表示"
        />
        <FormControl fullWidth sx={{ flex: 1 }}>
          <InputLabel id={selectLabelId}>商品を表示</InputLabel>
          <Select
            labelId={selectLabelId}
            multiple
            value={selectedItemIds}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedItemIds(
                typeof value === "string" ? value.split(",") : value,
              );
            }}
            input={<OutlinedInput label="商品を表示" />}
          >
            {displays.map((display) => (
              <MenuItem key={display.itemId} value={display.itemId}>
                {display.item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          overflowX: "scroll",
          paddingBottom: "10%",
        }}
      >
        <LineChart
          dataset={dataset}
          series={series}
          xAxis={[
            {
              dataKey: "timestamp",
              scaleType: "time",
              label: "時刻",
              valueFormatter: (value) =>
                new Date(value).toLocaleDateString("ja-JP", {
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
            },
          ]}
          yAxis={[
            {
              id: "revenue",
              scaleType: "linear",
              label: "総売上 (円)",
            },
            {
              id: "count",
              scaleType: "linear",
              label: "販売数 (個)",
              position: "right",
            },
          ]}
          slotProps={{
            legend: {
              direction: "horizontal",
              position: { vertical: "top", horizontal: "center" },
            },
          }}
          sx={{ minWidth: 800, height: "90%" }}
        />
      </Box>
    </Box>
  );
}
