// @shared/ui/SystemDiagnostic.tsx
"use client";

import React, { useState, useEffect } from 'react';

interface Props {
  id: string;
  source: string;
  data: any;
  targetUrl?: string;
  secondaryData?: any;
  errorMsg?: string | null;
  secondaryError?: string | null;
  apiInternalUrl?: string;
}

/**
 * 🛰️ SystemDiagnostic: 
 * サイトの「プロ仕様」を演出するデバッグターミナル兼、システム監視UI
 */
export default function SystemDiagnostic({ 
  id, source, data, targetUrl, secondaryData, errorMsg, secondaryError, apiInternalUrl 
}: Props) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1];
    const newLogs = [
      `[${timestamp}] CONNECTION_ESTABLISHED: NODE_${source}`,
      `[${timestamp}] DATA_FETCH_INIT: ID_${id}`,
      errorMsg ? `[${timestamp}] ERROR: ${errorMsg}` : `[${timestamp}] PAYLOAD_RECEIVED: OK`,
      secondaryData ? `[${timestamp}] RELATION_SYNC: ${secondaryData.length} ITEMS` : `[${timestamp}] RELATION_SYNC: PENDING`,
    ];
    setLogs(newLogs);
  }, [id, source, errorMsg, secondaryData]);

  return (
    <section className="mt-20 border-t border-white/10 font-mono text-[10px] bg-black/60 p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-gray-400 uppercase tracking-widest">System Diagnostic Terminal v2.4</span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#e94560] hover:underline uppercase"
        >
          {isExpanded ? '[ CLOSE_STREAM ]' : '[ OPEN_DATA_STREAM ]'}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1 text-blue-400">
            {logs.map((log, i) => <p key={i}>{log}</p>)}
            <p className="text-yellow-500 underline break-all mt-2">API_ENDPOINT: {apiInternalUrl}</p>
          </div>
          <div className="bg-black/80 p-2 border border-white/5 max-h-[150px] overflow-auto">
            <pre className="text-gray-500 text-[9px]">
              {JSON.stringify({ target: targetUrl, status: "DECODED", data_size: JSON.stringify(data).length }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}