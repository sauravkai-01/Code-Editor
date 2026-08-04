import Plot from 'react-plotly.js';

type Point = { t: number; label: string; score: number };

export function SentimentChartPanel({ points }: { points: Point[] }) {

  const x = points.map((p) => new Date(p.t).toLocaleTimeString());
  const y = points.map((p) => p.score);

  const trace = {
    x,
    y,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { size: 7 },
    line: { width: 2 },
  } as const;

  const layout = {
    title: 'Sentiment over time',
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { l: 40, r: 20, t: 40, b: 30 },
    xaxis: { title: 'Time', tickangle: -30 },
    yaxis: { title: 'Score', range: [0, 1] },
  } as const;

  const config = { responsive: true, displayModeBar: false } as const;

  return (
    <div className="sentiment-chart">
      <Plot data={[trace]} layout={layout} config={config} style={{ width: '100%', height: 280 }} />
    </div>
  );
}

