import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle2, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import {
  DemandService,
  getCurrentUser,
  getAuthToken
} from '../../../services/api';
import {
  DemandGatewayHealth,
  TopCropPrediction
} from '../../../types';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 502) return 'Prediction service is temporarily unavailable. Please try again shortly.';
    if (status === 504) return 'Prediction request timed out. Please try again.';

    const apiMessage = error.response?.data?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
      return apiMessage;
    }
  }

  return 'Something went wrong while contacting the prediction service.';
};

const normalizeTopCrops = (payload: unknown): TopCropPrediction[] => {
  if (!payload || typeof payload !== 'object') return [];

  const data = payload as {
    topCrops?: Array<{
      commodityName?: string;
      predictedDemand?: number;
      confidenceScore?: number;
      crop?: string;
      demand_score?: number;
      score?: number;
      confidence?: number;
    }>;
    items?: Array<{
      commodityName?: string;
      predictedDemand?: number;
      confidenceScore?: number;
      crop?: string;
      demand_score?: number;
      score?: number;
      confidence?: number;
    }>;
  };

  const source = Array.isArray(data.topCrops) && data.topCrops.length > 0
    ? data.topCrops
    : Array.isArray(data.items)
      ? data.items
      : [];

  return source
    .map((item) => ({
      commodityName: item.commodityName || item.crop || 'Unknown Crop',
      predictedDemand: item.predictedDemand ?? item.demand_score ?? item.score,
      confidenceScore: item.confidenceScore ?? item.confidence
    }))
    .filter((item) => item.commodityName.trim().length > 0);
};

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const DemandPrediction: React.FC = () => {
  const user = getCurrentUser();
  const token = getAuthToken();

  const thisMonth = useMemo(() => new Date().getMonth() + 1, []);
  const thisYear = useMemo(() => new Date().getFullYear(), []);

  const [healthLoading, setHealthLoading] = useState(false);
  const [healthData, setHealthData] = useState<DemandGatewayHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [topMonth, setTopMonth] = useState(thisMonth);
  const [topYear, setTopYear] = useState(thisYear);
  const [topN, setTopN] = useState(5);
  const [topCrops, setTopCrops] = useState<TopCropPrediction[]>([]);
  const [topLoading, setTopLoading] = useState(false);
  const [topMessage, setTopMessage] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    const loadHealth = async () => {
      setHealthLoading(true);
      setHealthError(null);

      try {
        const response = await DemandService.getHealth();
        if (response.success && response.data) {
          setHealthData(response.data);
        } else {
          setHealthData(null);
          setHealthError(response.message || 'Unable to fetch gateway health status.');
        }
      } catch (error) {
        setHealthData(null);
        setHealthError(getErrorMessage(error));
      } finally {
        setHealthLoading(false);
      }
    };

    loadHealth();
  }, []);

  const handleTopCrops = async (event: React.FormEvent) => {
    event.preventDefault();
    setTopLoading(true);
    setTopError(null);
    setTopMessage(null);

    try {
      const response = await DemandService.getTopCrops({
        month: topMonth,
        year: topYear,
        topN
      });

      if (response.success && response.data) {
        const normalized = normalizeTopCrops(response.data);
        setTopCrops(normalized);
        setTopMessage(response.message || 'Top crops fetched successfully.');
      } else {
        setTopCrops([]);
        setTopError(response.message || 'Could not fetch top crops right now.');
      }
    } catch (error) {
      setTopCrops([]);
      setTopError(getErrorMessage(error));
    } finally {
      setTopLoading(false);
    }
  };

  const isPythonHealthy = healthData?.python?.status?.toLowerCase() === 'healthy';

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Demand Prediction
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Forecast high-demand crops using the prediction gateway.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-medium w-fit
            bg-gray-50 border-gray-200 text-gray-700">
            <Activity className="w-4 h-4" />
            {healthLoading && 'Checking service health...'}
            {!healthLoading && isPythonHealthy && 'Gateway healthy'}
            {!healthLoading && !isPythonHealthy && 'Gateway degraded'}
          </div>
        </div>

        {(healthError || healthData) && (
          <div className="mt-4 text-sm">
            {healthError && (
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <span>{healthError}</span>
              </div>
            )}

            {healthData && (
              <div className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 border ${
                isPythonHealthy
                  ? 'text-green-700 bg-green-50 border-green-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {isPythonHealthy ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                )}
                <span>
                  Python service: {healthData.python.status} ({healthData.python.statusCode}) - {healthData.python.message}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Top Crops Forecast</h2>
          <p className="text-sm text-gray-600 mb-5">Get the best crop opportunities for a month and year.</p>

          <form onSubmit={handleTopCrops} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-gray-700">Month</span>
                <select
                  value={topMonth}
                  onChange={(e) => setTopMonth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500"
                  required
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.value} - {month.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-gray-700">Year</span>
                <input
                  type="number"
                  min={2020}
                  max={2100}
                  value={topYear}
                  onChange={(e) => setTopYear(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500"
                  required
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-gray-700">Top N</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={topLoading || !token}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {topLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {topLoading ? 'Predicting...' : 'Get Top Crops'}
            </button>
          </form>

          {!token && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Please sign in as farmer to use demand prediction endpoints.
            </p>
          )}

          {topMessage && <p className="mt-4 text-sm text-green-700">{topMessage}</p>}
          {topError && <p className="mt-4 text-sm text-red-600">{topError}</p>}

          <div className="mt-4 space-y-3">
            {topCrops.map((crop, index) => (
              <div key={`${crop.commodityName}-${index}`} className="border border-gray-100 rounded-lg px-4 py-3 bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900">{index + 1}. {crop.commodityName}</p>
                  {typeof crop.confidenceScore === 'number' && (
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Confidence: {(crop.confidenceScore * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Predicted Demand: {typeof crop.predictedDemand === 'number' ? crop.predictedDemand.toFixed(2) : 'N/A'}
                </p>
              </div>
            ))}

            {!topLoading && topCrops.length === 0 && topMessage && !topError && (
              <div className="border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 bg-white">
                No crop rows were returned by the prediction service for this input.
              </div>
            )}
          </div>
        </section>
      </div>

      {user?.role !== 'Farmer' && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          This view is designed for farmer accounts. Some actions may be restricted for your role.
        </div>
      )}
    </div>
  );
};

export default DemandPrediction;