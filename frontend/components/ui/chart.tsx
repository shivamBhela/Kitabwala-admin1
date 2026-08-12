'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

// ── KitabWala brand colours ──────────────────────────────────────────────────
export const KW_COLORS = {
  yellow: '#FFD400',
  yellowLight: '#FFF3B0',
  yellowMid: '#FFE55A',
  amber: '#F59E0B',
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate200: '#E2E8F0',
  slate500: '#64748B',
  slate700: '#334155',
  slate900: '#0F172A',
  emerald: '#10B981',
  rose: '#F43F5E',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  // Chart palette – warm/golden
  chart1: '#FFD400',
  chart2: '#F59E0B',
  chart3: '#FBBF24',
  chart4: '#FDE68A',
  chart5: '#10B981',
  chart6: '#3B82F6',
};

// ── Theme map used by ChartStyle ─────────────────────────────────────────────
const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error('useChart must be used within a <ChartContainer />');
  return ctx;
}

// ── ChartContainer ────────────────────────────────────────────────────────────
function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={`flex aspect-video justify-center text-xs
          [&_.recharts-cartesian-axis-tick_text]:fill-slate-500
          [&_.recharts-cartesian-grid_line]:stroke-amber-100
          [&_.recharts-curve.recharts-tooltip-cursor]:stroke-amber-200
          [&_.recharts-dot[stroke='#fff']]:stroke-transparent
          [&_.recharts-layer]:outline-none
          [&_.recharts-surface]:outline-none
          ${className ?? ''}`}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// ── ChartStyle ────────────────────────────────────────────────────────────────
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color);
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color = item.theme?.[theme as keyof typeof item.theme] || item.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join('\n')}
}`,
          )
          .join('\n'),
      }}
    />
  );
};

// ── ChartTooltip ──────────────────────────────────────────────────────────────
const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: RechartsPrimitive.TooltipContentProps & {
  className?: string;
  color?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;
    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;
    if (labelFormatter)
      return (
        <div className={`font-semibold ${labelClassName ?? ''}`}>
          {labelFormatter(value, payload)}
        </div>
      );
    if (!value) return null;
    return (
      <div className={`font-semibold text-slate-800 ${labelClassName ?? ''}`}>{value}</div>
    );
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) return null;
  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={`
        bg-white border border-amber-200 shadow-lg shadow-amber-100/50
        grid min-w-[9rem] items-start gap-1.5 rounded-xl px-3 py-2 text-xs
        ${className ?? ''}
      `}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;

          return (
            <div
              key={String(item.dataKey)}
              className={`flex w-full flex-wrap items-stretch gap-2 ${
                indicator === 'dot' ? 'items-center' : ''
              }`}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className="shrink-0 rounded-sm border"
                        style={{
                          width: indicator === 'dot' ? 10 : indicator === 'line' ? 4 : 0,
                          height: indicator === 'dot' ? 10 : undefined,
                          borderColor: indicatorColor,
                          backgroundColor:
                            indicator === 'dashed' ? 'transparent' : indicatorColor,
                          borderStyle: indicator === 'dashed' ? 'dashed' : 'solid',
                        }}
                      />
                    )
                  )}
                  <div
                    className={`flex flex-1 justify-between leading-none ${
                      nestLabel ? 'items-end' : 'items-center'
                    }`}
                  >
                    <div className="grid gap-1">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-slate-500">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== undefined && (
                      <span className="font-mono font-bold text-slate-800 tabular-nums">
                        {Number(item.value).toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ChartLegend ───────────────────────────────────────────────────────────────
const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: Pick<RechartsPrimitive.DefaultLegendContentProps, 'payload' | 'verticalAlign'> & {
  className?: string;
  hideIcon?: boolean;
  nameKey?: string;
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      className={`flex items-center justify-center gap-4 ${
        verticalAlign === 'top' ? 'pb-3' : 'pt-3'
      } ${className ?? ''}`}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-xs font-medium text-slate-600">{itemConfig?.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) return undefined;

  const p = payload as Record<string, unknown>;
  const payloadPayload =
    'payload' in p && typeof p.payload === 'object' && p.payload !== null
      ? (p.payload as Record<string, unknown>)
      : undefined;

  let configLabelKey: string = key;

  if (key in p && typeof p[key] === 'string') {
    configLabelKey = p[key] as string;
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === 'string') {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
};
