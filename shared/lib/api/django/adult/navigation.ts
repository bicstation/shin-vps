import { normalizeParams } from './utils';
import { resolveApiUrl, getDjangoHeaders } from '../client';

export async function getAdultNavigationFloors(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const query = new URLSearchParams(cleanParams).toString();
  const siteVal = cleanParams.api_source || '';
  
  const targetUrl = resolveApiUrl(`adult/navigation/floors/?${query}`);
  
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      cache: 'no-store'
    });
    
    const json = await res.json();
    const data = json?.results || json?.data || json || {};

    if (siteVal) {
      const filteredData: any = {};
      Object.keys(data).forEach(key => {
        const k = key.toUpperCase();
        const isMatch = (siteVal === 'DMM') 
          ? (k.includes('DMM') && !k.includes('FANZA'))
          : k.includes(siteVal);
          
        if (isMatch) filteredData[key] = data[key];
      });
      return Object.keys(filteredData).length > 0 ? filteredData : data;
    }

    return data;
  } catch (error) {
    console.error("[Adult-Nav] FETCH_FAILED:", error);
    return {};
  }
}