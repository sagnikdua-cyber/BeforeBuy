import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { interpretAnalysis } from '../utils/decisionEngine';

const AnalyzerPanel = ({ productKey, title, currentPrice, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const url = `http://localhost:5000/api/analyze?productKey=${encodeURIComponent(productKey)}${title ? `&title=${encodeURIComponent(title)}` : ''}`;
        const response = await axios.get(url);
        setData(response.data);
        setError(null);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load analysis. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [productKey, title]);

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 animate-pulse mt-4">
        <div className="h-6 w-1/3 bg-slate-800 rounded mb-4"></div>
        <div className="h-48 w-full bg-slate-800 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-800 rounded"></div>
            <div className="h-16 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-red-900/50 mt-4">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-red-400 font-semibold">Analysis Unavailable</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!data || !data.analysis) return null;

  const { analysis, dataSource } = data;
  const { chart_data, predicted_price_7d, trend, confidence, historical_min, historical_max } = analysis;

  const decision = interpretAnalysis({
      currentPrice,
      predictedPrice: predicted_price_7d,
      trend,
      historicalMin: historical_min
  });

  // Prepare chart data (adding the predicted point)
  const fullChartData = [...(chart_data || [])];
  if (fullChartData.length > 0) {
      const lastDate = new Date(fullChartData[fullChartData.length - 1].date);
      lastDate.setDate(lastDate.getDate() + 7);
      
      fullChartData.push({
          date: lastDate.toISOString().split('T')[0],
          price: null, // No historical price here
          predicted: predicted_price_7d
      });
      
      // Connect the lines visually
      fullChartData[fullChartData.length - 2].predicted = fullChartData[fullChartData.length - 2].price;
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mt-4">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Price Analysis</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center">&times;</button>
        </div>

        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${
            decision === 'Favorable' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' :
            decision === 'Wait' ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' :
            'bg-blue-900/20 border-blue-500/30 text-blue-400'
        }`}>
            <div>
                <span className="block text-xs uppercase tracking-wider opacity-80 mb-1">Recommendation</span>
                <span className="text-lg font-bold">
                    {decision === 'Favorable' ? 'Forecast indicates a favorable buying window.' :
                     decision === 'Wait' ? 'Forecast indicates a downward price trend. Wait.' :
                     'Price appears stable. Monitor for drops.'}
                </span>
                {(predicted_price_7d < historical_min || predicted_price_7d > historical_max) && (
                    <span className="block text-xs text-slate-400 mt-2 border-t border-slate-700/50 pt-2">
                        Note: Forecast is outside the observed historical price range.
                    </span>
                )}
            </div>
            <div className="text-right">
                <span className="block text-xs uppercase tracking-wider opacity-80 mb-1">Confidence</span>
                <span className="text-lg font-bold">{Math.round(confidence * 100)}%</span>
            </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fullChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        tick={{fill: '#64748b', fontSize: 12}}
                        tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getMonth()+1}/${d.getDate()}`;
                        }}
                    />
                    <YAxis 
                        stroke="#64748b" 
                        tick={{fill: '#64748b', fontSize: 12}}
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                        tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'predicted' ? '7-Day Forecast' : 'Historical Price']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                    {currentPrice && (
                        <ReferenceLine y={currentPrice} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Current Live Price', fill: '#f59e0b', fontSize: 12 }} />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
                <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Live Price</span>
                <span className="text-white font-bold text-lg">₹{currentPrice?.toLocaleString() || '--'}</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
                <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">7-Day Forecast</span>
                <span className="text-emerald-400 font-bold text-lg">₹{predicted_price_7d?.toLocaleString()}</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
                <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Historical Range</span>
                <span className="text-white font-medium text-sm">₹{historical_min?.toLocaleString()} - ₹{historical_max?.toLocaleString()}</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
                <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Recent Trend</span>
                <span className="text-white font-bold text-lg capitalize">{trend}</span>
            </div>
        </div>

        <div className="text-right text-xs text-slate-500">
            Data Source: {dataSource === 'DEMO' ? 'Demo Historical Dataset' : 'Live Accumulated Observations'}
        </div>
    </div>
  );
};

export default AnalyzerPanel;
