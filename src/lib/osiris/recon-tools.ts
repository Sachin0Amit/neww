/**
 * OSIRIS - Reconnaissance Tools
 * 14 OSINT tools powered by web search and AI analysis.
 * Each tool uses webSearch() for real-time data and askAI() for interpretation.
 */

import { webSearch, askAI } from '@/lib/ai-sdk';
import type { Result } from '@/lib/types';
import { ok, err, isOk } from '@/lib/types';
import type {
  ReconResult,
  DNSResult,
  WHOISResult,
  IPResult,
  CertResult,
  BGPResult,
  CVEResult,
} from './types';

// =================== Helper ===================

/** Search the web and return structured text results */
async function searchAndAnalyze(query: string, analysisPrompt: string): Promise<Result<{ searchSnippets: string; aiAnalysis: string }>> {
  const searchResult = await webSearch({ query, num: 10 });
  if (!isOk(searchResult)) {
    return err(searchResult.error);
  }

  const snippets = searchResult.value
    .map((r, i) => `[${i + 1}] ${r.name}: ${r.snippet} (${r.url})`)
    .join('\n');

  const aiResult = await askAI(
    `Based on these search results:\n\n${snippets}\n\n${analysisPrompt}`,
    'You are an OSINT analyst. Extract precise, factual intelligence data. Be specific with numbers, dates, and technical details. If data is not found, state "Not available" rather than guessing.',
    'medium',
  );

  const aiAnalysis = isOk(aiResult) ? aiResult.value.text : 'AI analysis unavailable';

  return ok({ searchSnippets: snippets, aiAnalysis });
}

/** Create a timestamp */
function ts(): string {
  return new Date().toISOString();
}

// =================== 14 OSINT Tools ===================

/** 1. DNS Lookup - DNS record enumeration */
export async function dnsLookup(domain: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `DNS records for ${domain} site:dnsdumpster.com OR site:securitytrails.com OR site:viewdns.info`,
      `Analyze DNS records for ${domain}. Extract ALL available DNS record types (A, AAAA, MX, NS, TXT, CNAME, SOA, PTR, SRV, CAA). For each record provide: type, value, and TTL if known. Also identify: SPF record, DKIM record, DMARC record, mail servers. Format as structured data.`,
    );

    if (!isOk(result)) return err(result.error);

    const parseResult = await askAI(
      `Parse the following DNS analysis into a JSON object with this exact structure:
{
  "domain": "${domain}",
  "records": [{"type": "A", "value": "1.2.3.4", "ttl": 300}],
  "nameservers": ["ns1.example.com"],
  "mxRecords": ["mail.example.com"],
  "spfRecord": "v=spf1 ...",
  "dkimRecord": "... or null",
  "dmarcRecord": "... or null"
}

Analysis:\n${result.value.aiAnalysis}

Return ONLY valid JSON, no markdown.`,
      'You are a data parser. Return only valid JSON.',
      'small',
    );

    const dnsData: DNSResult = isOk(parseResult)
      ? (() => { try { return JSON.parse(parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()); } catch { return { domain, records: [] }; } })()
      : { domain, records: [] };

    return ok({
      tool: 'dns_lookup',
      query: domain,
      results: dnsData as unknown as Record<string, unknown>,
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'dns_lookup',
      query: domain,
      results: { domain, records: [], error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 2. WHOIS Lookup - Domain registration data */
export async function whoisLookup(domain: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `WHOIS ${domain} domain registration info registrar creation date`,
      `Extract WHOIS data for ${domain}. Include: registrar, creation date, expiration date, last updated date, name servers, registrant info (country, organization if public), domain status codes, admin email if public. Be specific with dates and status codes.`,
    );

    if (!isOk(result)) return err(result.error);

    const parseResult = await askAI(
      `Parse into JSON: {"domain":"${domain}","registrar":"...","creationDate":"...","expirationDate":"...","updatedDate":"...","nameServers":[],"registrant":"...","registrantCountry":"...","status":"...","organization":"...","adminEmail":"..."}
Data:\n${result.value.aiAnalysis}
Return ONLY valid JSON.`,
      'Data parser. Return only valid JSON.',
      'small',
    );

    const whoisData: WHOISResult = isOk(parseResult)
      ? (() => { try { return JSON.parse(parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()); } catch { return { domain }; } })()
      : { domain };

    return ok({
      tool: 'whois_lookup',
      query: domain,
      results: whoisData as unknown as Record<string, unknown>,
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'whois_lookup',
      query: domain,
      results: { domain, error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 3. IP Intelligence - Geolocation & reputation */
export async function ipIntelligence(ip: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `IP address ${ip} geolocation ISP ASN reputation proxy detection threat intelligence`,
      `Analyze IP ${ip}. Extract: ASN number, ISP name, organization, country, city, region, latitude/longitude, timezone, hostname reverse DNS, whether it's a proxy/VPN, Tor exit node, hosting/datacenter IP, reputation score, abuse score if available. Be precise with coordinates and ASN.`,
    );

    if (!isOk(result)) return err(result.error);

    const parseResult = await askAI(
      `Parse into JSON: {"ip":"${ip}","asn":"AS12345","isp":"...","organization":"...","country":"...","city":"...","region":"...","latitude":0,"longitude":0,"timezone":"...","hostname":"...","isProxy":false,"isTor":false,"isHosting":false,"reputation":"...","abuseScore":0}
Data:\n${result.value.aiAnalysis}
Return ONLY valid JSON.`,
      'Data parser. Return only valid JSON.',
      'small',
    );

    const ipData: IPResult = isOk(parseResult)
      ? (() => { try { return JSON.parse(parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()); } catch { return { ip }; } })()
      : { ip };

    return ok({
      tool: 'ip_intelligence',
      query: ip,
      results: ipData as unknown as Record<string, unknown>,
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'ip_intelligence',
      query: ip,
      results: { ip, error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 4. SSL Certificate Lookup */
export async function certLookup(domain: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `SSL certificate ${domain} TLS issuer validity site:crt.sh OR site:sslshopper.com`,
      `Analyze SSL/TLS certificate for ${domain}. Extract: issuer (CA), subject/CN, validity dates (from/to), serial number, SHA-256 fingerprint, TLS protocol versions supported, key size/type, whether expired, self-signed, SAN (Subject Alternative Names), chain issues, HSTS status. Be specific with dates and fingerprint.`,
    );

    if (!isOk(result)) return err(result.error);

    const parseResult = await askAI(
      `Parse into JSON: {"domain":"${domain}","issuer":"...","subject":"...","validFrom":"...","validTo":"...","serialNumber":"...","fingerprint":"...","protocol":"TLS 1.3","keySize":2048,"isExpired":false,"isSelfSigned":false,"sanNames":[],"chainIssues":[]}
Data:\n${result.value.aiAnalysis}
Return ONLY valid JSON.`,
      'Data parser. Return only valid JSON.',
      'small',
    );

    const certData: CertResult = isOk(parseResult)
      ? (() => { try { return JSON.parse(parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()); } catch { return { domain }; } })()
      : { domain };

    return ok({
      tool: 'cert_lookup',
      query: domain,
      results: certData as unknown as Record<string, unknown>,
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'cert_lookup',
      query: domain,
      results: { domain, error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 5. BGP/ASN Lookup */
export async function bgpLookup(asnOrPrefix: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `BGP ASN ${asnOrPrefix} routing peers upstreams downstreams site:bgp.he.net OR site:bgpstream.com OR site:routeviews.org`,
      `Analyze BGP routing for ${asnOrPrefix}. Extract: ASN, AS name, organization, announced prefixes, country, peers count, upstream providers, downstream networks, RPKI validation status. Be specific with ASN numbers and prefix CIDRs.`,
    );

    if (!isOk(result)) return err(result.error);

    const parseResult = await askAI(
      `Parse into JSON: {"asn":"AS12345","asName":"...","asOrg":"...","prefix":"...","country":"...","peers":[],"upstreams":[],"downstreams":[],"rpkiStatus":"..."}
Data:\n${result.value.aiAnalysis}
Return ONLY valid JSON.`,
      'Data parser. Return only valid JSON.',
      'small',
    );

    const bgpData: BGPResult = isOk(parseResult)
      ? (() => { try { return JSON.parse(parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()); } catch { return {}; } })()
      : {};

    return ok({
      tool: 'bgp_lookup',
      query: asnOrPrefix,
      results: bgpData as unknown as Record<string, unknown>,
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'bgp_lookup',
      query: asnOrPrefix,
      results: { error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 6. CVE Lookup - Vulnerability assessment */
export async function cveLookup(cveIdOrProduct: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `${cveIdOrProduct} CVE vulnerability NVD CVSS score site:nvd.nist.gov OR site:cvedetails.com`,
      `Analyze CVE/vulnerability data for ${cveIdOrProduct}. Extract: CVE ID(s), description, CVSS v3.x base score and vector, severity rating, published date, last modified date, affected products/versions, CWE classification, known exploits, available patches. Be specific with CVSS scores and versions.`,
    );

    if (!isOk(result)) return err(result.error);

    const parseResult = await askAI(
      `Parse into JSON array of CVEs: [{"cveId":"CVE-2024-XXXX","description":"...","severity":"high","cvssScore":9.8,"cvssVector":"CVSS:3.1/...","publishedDate":"...","modifiedDate":"...","affectedProducts":[],"references":[],"cwe":"CWE-XXX","exploitAvailable":false,"patchAvailable":true}]
Data:\n${result.value.aiAnalysis}
Return ONLY valid JSON array.`,
      'Data parser. Return only valid JSON array.',
      'small',
    );

    const cveData: CVEResult[] = isOk(parseResult)
      ? (() => { try { return JSON.parse(parseResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()); } catch { return []; } })()
      : [];

    return ok({
      tool: 'cve_lookup',
      query: cveIdOrProduct,
      results: { vulnerabilities: cveData },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'cve_lookup',
      query: cveIdOrProduct,
      results: { vulnerabilities: [], error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 7. Shodan-style Lookup - Exposed services */
export async function shodanLookup(target: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `${target} exposed services open ports vulnerabilities Shodan site:shodan.io OR site:censys.io`,
      `Analyze exposed services for ${target}. Identify: open ports and services, running software versions, potential vulnerabilities, exposed databases, management interfaces, default credentials detected, IoT devices, industrial control systems. Prioritize critical exposures.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'shodan_lookup',
      query: target,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'shodan_lookup',
      query: target,
      results: { error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 8. Network Sweep - IP + port info */
export async function networkSweep(target: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `${target} network infrastructure IP ranges ports services scan`,
      `Perform network analysis for ${target}. Identify: IP ranges/subnets associated, active hosts, common open ports (22, 80, 443, 3306, 5432, 8080, 8443, 27017), services running, network topology, firewall detected, CDN/WAF in use, hosting provider. Be specific with IP addresses and port numbers.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'network_sweep',
      query: target,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'network_sweep',
      query: target,
      results: { error: 'Sweep failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 9. Sanctions Search - OFAC/sanctions check */
export async function sanctionsSearch(entity: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `${entity} OFAC SDN sanctions list denied persons entity list site:treasury.gov OR site:ec.europa.eu OR site:un.org`,
      `Check sanctions status for ${entity}. Search: OFAC Specially Designated Nationals (SDN) list, EU consolidated sanctions, UN Security Council sanctions, BIS Entity List, Denied Persons List. Include: matching entries, sanctions program, listing date, associated aliases, designation type. If no match found, state clearly.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'sanctions_search',
      query: entity,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'sanctions_search',
      query: entity,
      results: { error: 'Search failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 10. Threat Intelligence - Aggregated threat feeds */
export async function threatIntelligence(target: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `${target} threat intelligence APT malware campaign indicators compromise threat report 2024 2025`,
      `Aggregate threat intelligence for ${target}. Include: known APT groups targeting this type, active campaigns, malware families, indicators of compromise (IPs, domains, hashes), MITRE ATT&CK techniques, threat actor TTPs, recent incidents. Be specific with IOC values and campaign names.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'threat_intelligence',
      query: target,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'threat_intelligence',
      query: target,
      results: { error: 'Search failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 11. Phone Lookup - Phone validation */
export async function phoneLookup(phoneNumber: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `phone number ${phoneNumber} validation carrier location lookup`,
      `Analyze phone number ${phoneNumber}. Extract: country code, country, carrier/telecom, line type (mobile/landline/voip), region/city, timezone, number validity, risk assessment (if available), associated spam reports. Be specific with carrier name and location.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'phone_lookup',
      query: phoneNumber,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'phone_lookup',
      query: phoneNumber,
      results: { error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 12. MAC Lookup - MAC vendor identification */
export async function macLookup(macAddress: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `MAC address ${macAddress} vendor manufacturer OUI lookup IEEE`,
      `Identify MAC address ${macAddress}. Extract: OUI (first 3 octets), vendor/manufacturer, organization, address, device type if known. Include whether the OUI is registered and any known device associations.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'mac_lookup',
      query: macAddress,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'mac_lookup',
      query: macAddress,
      results: { error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 13. GitHub Intel - GitHub user/repo intelligence */
export async function githubIntel(usernameOrRepo: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `github ${usernameOrRepo} profile repositories activity contributions site:github.com`,
      `Analyze GitHub intelligence for ${usernameOrRepo}. Extract: user profile info (name, bio, location, company), public repositories count, languages used, contribution activity, notable projects, follower/following counts, organization memberships, GPG key status, recent activity patterns. For repos: stars, forks, open issues, last commit, primary language, license.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'github_intel',
      query: usernameOrRepo,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'github_intel',
      query: usernameOrRepo,
      results: { error: 'Lookup failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/** 14. Leak Detection - Breach/leak monitoring */
export async function leakDetection(target: string): Promise<Result<ReconResult>> {
  try {
    const result = await searchAndAnalyze(
      `${target} data breach leak compromised credentials haveibeenpwned site:haveibeenpwned.com OR site:dehashed.com`,
      `Check for data breaches/leaks involving ${target}. Include: known breaches affecting this domain/email, breach names, breach dates, data types exposed (emails, passwords, PII, financial), number of affected records, paste sites, stealer logs. Assess severity and recommend immediate actions.`,
    );

    if (!isOk(result)) return err(result.error);

    return ok({
      tool: 'leak_detection',
      query: target,
      results: { analysis: result.value.aiAnalysis, sources: result.value.searchSnippets },
      timestamp: ts(),
    });
  } catch (error) {
    return ok({
      tool: 'leak_detection',
      query: target,
      results: { error: 'Detection failed' },
      timestamp: ts(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// =================== Tool Registry ===================

export interface ReconToolDef {
  id: string;
  name: string;
  description: string;
  category: string;
  fn: (target: string) => Promise<Result<ReconResult>>;
}

/** All available recon tools */
export const RECON_TOOLS: ReconToolDef[] = [
  { id: 'dns_lookup', name: 'DNS Lookup', description: 'DNS record enumeration', category: 'network', fn: dnsLookup },
  { id: 'whois_lookup', name: 'WHOIS Lookup', description: 'Domain registration data', category: 'network', fn: whoisLookup },
  { id: 'ip_intelligence', name: 'IP Intelligence', description: 'Geolocation & reputation', category: 'network', fn: ipIntelligence },
  { id: 'cert_lookup', name: 'SSL Inspector', description: 'Certificate chain analysis', category: 'network', fn: certLookup },
  { id: 'bgp_lookup', name: 'BGP/ASN Lookup', description: 'Routing & ASN information', category: 'network', fn: bgpLookup },
  { id: 'cve_lookup', name: 'CVE Scanner', description: 'Vulnerability assessment', category: 'vulnerability', fn: cveLookup },
  { id: 'shodan_lookup', name: 'Shodan-style Scan', description: 'Exposed services detection', category: 'recon', fn: shodanLookup },
  { id: 'network_sweep', name: 'Network Sweep', description: 'IP & port reconnaissance', category: 'recon', fn: networkSweep },
  { id: 'sanctions_search', name: 'Sanctions Check', description: 'OFAC/SDN list search', category: 'compliance', fn: sanctionsSearch },
  { id: 'threat_intelligence', name: 'Threat Intel', description: 'Aggregated threat feeds', category: 'threat', fn: threatIntelligence },
  { id: 'phone_lookup', name: 'Phone Lookup', description: 'Phone validation & carrier', category: 'osint', fn: phoneLookup },
  { id: 'mac_lookup', name: 'MAC Lookup', description: 'MAC vendor identification', category: 'osint', fn: macLookup },
  { id: 'github_intel', name: 'GitHub Intel', description: 'GitHub user/repo analysis', category: 'osint', fn: githubIntel },
  { id: 'leak_detection', name: 'Leak Detection', description: 'Breach/leak monitoring', category: 'threat', fn: leakDetection },
];

/** Get a recon tool by ID */
export function getReconTool(id: string): ReconToolDef | undefined {
  return RECON_TOOLS.find(t => t.id === id);
}

/** Run multiple recon tools against a target */
export async function runReconTools(
  target: string,
  toolIds: string[],
  onProgress?: (toolId: string, index: number, total: number) => void,
): Promise<ReconResult[]> {
  const tools = toolIds
    .map(id => RECON_TOOLS.find(t => t.id === id))
    .filter((t): t is ReconToolDef => t !== undefined);

  const results: ReconResult[] = [];

  for (let i = 0; i < tools.length; i++) {
    onProgress?.(tools[i].id, i, tools.length);
    const result = await tools[i].fn(target);
    if (isOk(result)) {
      results.push(result.value);
    } else {
      results.push({
        tool: tools[i].id,
        query: target,
        results: { error: result.error.message },
        timestamp: ts(),
        error: result.error.message,
      });
    }
  }

  return results;
}
