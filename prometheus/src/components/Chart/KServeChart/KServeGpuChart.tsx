/*
 * Copyright 2026 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useTranslation } from '@kinvolk/headlamp-plugin/lib';
import { Box, Typography } from '@mui/material';
import { green, grey, orange } from '@mui/material/colors';
import { alpha, useTheme } from '@mui/material/styles';
import { fetchMetrics } from '../../../request';
import { createTickTimestampFormatter, dataProcessor, formatBytes } from '../../../util';
import Chart from '../Chart/Chart';
import { KServeChartPanelProps } from './KServeRequestRateChart';
import { getKServeGpuQueries } from './metrics';

/**
 * Formats a 0-1 ratio as a whole percentage for the utilisation axis.
 * @param value - Utilisation ratio.
 * @returns Percentage label.
 */
export function formatRatioPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export const KServeGpuChart = (props: KServeChartPanelProps) => {
  const { t } = useTranslation();
  const xTickFormatter = createTickTimestampFormatter(props.timespan);
  const theme = useTheme();

  const queries = getKServeGpuQueries(props.namespace, props.serviceName, props.component);

  const utilizationPlots = [
    {
      query: queries.utilization,
      name: t('GPU Utilization'),
      strokeColor: alpha(green[600], 0.8),
      fillColor: alpha(green[400], 0.1),
      dataProcessor: dataProcessor,
    },
  ];

  const memoryPlots = [
    {
      query: queries.memoryUsed,
      name: t('GPU Memory Used'),
      strokeColor: alpha(orange[600], 0.8),
      fillColor: alpha(orange[400], 0.1),
      dataProcessor: dataProcessor,
    },
    {
      query: queries.memoryTotal,
      name: t('GPU Memory Total'),
      strokeColor: alpha(grey[500], 0.8),
      fillColor: alpha(grey[400], 0),
      dataProcessor: dataProcessor,
    },
  ];

  const xAxisProps = {
    dataKey: 'timestamp',
    tickLine: false,
    tick: (tickProps: any) => {
      const value = xTickFormatter(tickProps.payload.value);
      if (!value) return null;
      return (
        <g
          transform={`translate(${tickProps.x},${tickProps.y})`}
          fill={theme.palette.chartStyles?.labelColor || theme.palette.text.secondary}
        >
          <text x={0} y={10} dy={0} textAnchor="middle">
            {value}
          </text>
        </g>
      );
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, height: '100%', width: '100%' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" align="center" gutterBottom>
          {t('GPU Utilization')}
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Chart
            plots={utilizationPlots}
            xAxisProps={xAxisProps}
            yAxisProps={{ domain: [0, 1], width: 60, tickFormatter: formatRatioPercent }}
            CustomTooltip={props.CustomTooltip}
            fetchMetrics={fetchMetrics as any}
            autoRefresh={props.refresh}
            prometheusPrefix={props.prometheusPrefix}
            interval={props.timespan}
            resolution={props.resolution}
            subPath={props.subPath ?? ''}
          />
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" align="center" gutterBottom>
          {t('GPU Memory')}
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Chart
            plots={memoryPlots}
            xAxisProps={xAxisProps}
            yAxisProps={{ domain: [0, 'auto'], width: 80, tickFormatter: formatBytes }}
            CustomTooltip={props.CustomTooltip}
            fetchMetrics={fetchMetrics as any}
            autoRefresh={props.refresh}
            prometheusPrefix={props.prometheusPrefix}
            interval={props.timespan}
            resolution={props.resolution}
            subPath={props.subPath ?? ''}
          />
        </Box>
      </Box>
    </Box>
  );
};
