# OrbINT: Local-First Cybersecurity and Intelligence Workstation

## 1. Project vision

Turn OrbINT (orbint.net) into a browser-based, local-first cybersecurity
and intelligence workstation.

The website should be the main interface. It should combine the existing
OrbINT OSINT and reconnaissance capabilities with the cybersecurity
dashboard concept.

The goal is not to build another cloud-dependent cybersecurity SaaS. The
goal is to let users open OrbINT in a browser and perform as much work
as possible on their own computer.

Core principle:

**Local by default. Online when necessary.**

-   Keep investigation data and processing on the user's computer
    whenever practical.
-   Use the internet when the user requests searches, public-information
    research, threat-intelligence lookups, or access to external
    websites.
-   Make cloud AI, synchronization, and external APIs optional.
-   Clearly disclose when information leaves the computer.
-   Do not request unrestricted computer access. Use explicit, granular
    permissions.

## 2. Product concept

OrbINT combines three main capabilities:

1.  **OSINT and intelligence gathering**
    -   Domain and IP research
    -   Public-information searches
    -   Website and infrastructure reconnaissance
    -   Collection and organization of publicly available information
2.  **Local cybersecurity and system intelligence**
    -   Operating-system and hardware information
    -   Running-process inspection
    -   File analysis and hashing
    -   Network-connection monitoring
    -   Security-event monitoring
    -   Application and startup-item inventory
3.  **AI-assisted analysis and automation**
    -   Summarize research findings
    -   Correlate information from multiple sources
    -   Assist with investigations
    -   Operate a locally controlled browser for authorized research
    -   Generate investigation reports

OrbINT should feel like a browser-based security workstation rather than
a collection of unrelated web pages.

## 3. Proposed application modules

### 3.1 Command Center

The main overview of the user's OrbINT workspace.

Potential features: - System and agent connection status - Recent
investigations - Recent security events - Alerts and noteworthy
findings - Local resource usage, when available - Quick access to
frequently used tools - Current browser-automation activity

### 3.2 OSINT Operations

The existing OrbINT reconnaissance functionality should remain an
important part of the platform.

Potential features: - Domain research - IP address research - DNS
information - Public website and infrastructure information - Publicly
available records and references - Search-result collection -
Investigation notes and source tracking

Preserve browser-local and privacy-conscious functionality where
possible. Do not require users to upload all OSINT research to a cloud
service.

### 3.3 Web Intelligence

A research and browser-automation workspace.

Potential features: - Search the web - Open and inspect public
websites - Navigate between pages - Extract relevant page content -
Collect page titles, URLs, and timestamps - Organize findings by
investigation - Summarize collected information - Run approved research
workflows

Playwright could be used as the browser-automation engine. A local
Node.js process can launch and control a browser for the user.

Important limitations: - Playwright generally controls browsers it
launches or explicitly connects to. - It does not automatically gain
control over every tab in the user's existing browser. - An optional
browser extension could provide additional browser integration. -
Automation should respect website terms, access restrictions, rate
limits, and applicable law. - Do not bypass authentication, access
controls, CAPTCHAs, or other security protections.

### 3.4 Threat Detection

A workspace for reviewing potential security threats.

Potential features: - IP, domain, URL, and file-hash analysis -
Indicators of compromise (IOCs) - Reputation checks through optional
external sources - Suspicious-process findings from the local agent -
Correlation of local events with external intelligence - Severity and
confidence labels - Evidence and source references

External reputation services should be optional. Before sending a hash,
URL, IP, domain, or other indicator to an external service, explain what
will be shared.

### 3.5 System Intelligence

This module provides information about the user's own computer through
browser capabilities and, when connected, the local agent.

Potential features: - Operating-system information - Hardware
specifications - CPU and memory usage - Running-process inventory -
Installed-application inventory - Startup applications - System events -
Agent health and connection status

A normal website cannot freely inspect all operating-system details or
enumerate all running processes. Deeper system inspection requires a
separately installed local component with explicit permissions.

### 3.6 Network Operations

Potential features: - Active network-connection inventory - Local
network-interface information - DNS-related analysis - Connection
history, where supported - Suspicious endpoint correlation -
Network-event timelines

The local agent should only collect information that the user has
explicitly enabled. Avoid packet capture or broad network inspection by
default.

### 3.7 File Intelligence

Potential features: - User-selected file inspection - File hashing (for
example, SHA-256) - File metadata extraction - File-type
identification - Local text and metadata analysis - Optional
malware-scanning integrations - File-integrity monitoring -
Investigation evidence management

Start with read-only analysis. Do not modify, quarantine, delete, or
execute files without a separate, explicit user approval.

### 3.8 Terminal

An optional interface for approved local operations.

Potential features: - Display command output - Run a limited set of
predefined diagnostic tasks - Show task status and logs - Require
confirmation for sensitive operations - Keep an audit record of commands
and actions

Do not expose an unrestricted remote shell through the website. The
local agent should enforce an allowlist or tightly scoped task
interface. Any higher-risk operation should require a clear confirmation
and should be logged.

### 3.9 AI Analyst

An assistant that can work with information collected by OrbINT.

Potential features: - Explain security findings - Summarize web
research - Correlate indicators and observations - Identify missing
information - Draft investigation timelines - Generate reports - Answer
questions about selected local scan results

AI deployment options: - Local model through software such as Ollama -
Optional external model through an API provider such as OpenRouter

Local models are preferable for sensitive data. If an external model is
used, show the user what context will be sent and allow redaction or
exclusion of sensitive information.

### 3.10 Investigations

A workspace for organizing research and security findings.

Potential features: - Create and name investigations - Save notes and
observations - Attach URLs, hashes, indicators, and scan results -
Record source and collection timestamps - Build event timelines - Link
related findings - Export reports - Keep an audit history of actions

Store investigation data locally by default. Cloud synchronization
should be optional.

## 4. Recommended architecture

Use a web-first interface with local processing components.

### Layer 1: OrbINT web interface

Hosted at orbint.net.

Responsibilities: - User interface - Navigation and workspace layout -
Investigation views - Data visualization - User-controlled settings and
permissions - Communication with browser-side features and the local
agent

Possible technologies: - React - Next.js - TypeScript - Tailwind CSS

The hosted website should not be responsible for performing all security
operations on a remote server.

### Layer 2: Browser runtime

Runs inside the user's browser.

Possible technologies and capabilities: - IndexedDB for structured local
application data - Origin Private File System (OPFS) for supported local
storage needs - Web Workers for background processing - WebAssembly for
suitable local analysis tasks - File System Access API for user-selected
files and folders - Browser APIs for supported browser information and
permissions

Browser security restrictions still apply. A website cannot obtain
unrestricted access to the computer merely because the user clicks an
approval button.

### Layer 3: Optional local agent

A separately installed application that runs on the user's computer.

Recommended starting technology: - C# and .NET for Windows integration -
Node.js for local Playwright automation, if useful - A narrowly scoped
local API for communication with the website

Potential responsibilities: - Read approved system information -
Enumerate processes when permitted - Collect selected system events -
Inspect user-approved files and folders - Calculate file hashes - Gather
approved network-connection information - Launch and control a dedicated
Playwright browser - Execute predefined diagnostic tasks - Send results
to the browser interface

The agent should not have unrestricted authority by default. Build
separate capabilities and permissions for each category of access.

### Layer 4: External internet services

Used only when necessary or requested.

Examples: - Search engines - Public websites - Public records and data
sources - DNS and domain-information services - Threat-intelligence
feeds - Optional AI APIs

Make external requests visible and understandable. Avoid sending private
investigation data to third parties without the user's approval.

## 5. Local agent and permissions

Do not implement a single permission called "Full Computer Access."

Use granular permissions instead.

Possible permission categories:

1.  System information
    -   Read operating-system and hardware details.
2.  Process monitoring
    -   Inspect running processes and selected process metadata.
3.  File inspection
    -   Inspect only user-selected files and folders.
4.  Network monitoring
    -   Read approved network-interface and connection information.
5.  Application inventory
    -   Identify installed applications where supported.
6.  Browser automation
    -   Launch and control a dedicated local browser session.
7.  System modifications
    -   Separate, disabled-by-default permission for approved
        remediation tasks.
8.  Command execution
    -   Restrict to predefined, validated tasks. Do not provide an
        unrestricted shell by default.

Recommended safeguards: - Read-only access by default - Separate
approval for destructive or modifying actions - Clear explanation of
each permission - Visible agent status - Local audit log - Revocable
permissions - Short-lived authentication tokens - Secure communication
between the website and local agent - Strict origin checks so unrelated
websites cannot control the agent - Bind local services to loopback
interfaces where possible - Validate every request in the agent, not
just in the website - Rate-limit and authenticate local requests -
Provide a disconnect and uninstall path

The local agent must independently enforce its security rules. Never
trust the browser interface as the only security boundary.

## 6. Browser automation with Playwright

Playwright is a strong candidate for local web research automation.

A possible workflow:

1.  The user creates an investigation.
2.  The user enters a domain, URL, organization, or research question.
3.  OrbINT asks which research actions are allowed.
4.  The local automation service launches a dedicated browser.
5.  The browser visits approved public pages.
6.  OrbINT collects relevant page information.
7.  Results are stored in the local investigation.
8.  The AI Analyst can summarize and correlate the findings.
9.  The user reviews and exports the report.

Potential automation actions: - Navigate to a URL - Search a website -
Read publicly accessible page content - Extract links and metadata -
Capture page titles and timestamps - Take screenshots when appropriate -
Follow links selected by the user or an approved workflow - Organize
findings

Keep browser automation visible to the user. Show which pages are being
visited and what information is being collected.

Do not use automation to evade access controls or perform unauthorized
actions.

## 7. Data storage and privacy

The platform should work without requiring a cloud database for its
basic local workflows.

Suggested storage strategy:

-   IndexedDB: browser-side structured data and settings
-   OPFS: suitable local files and databases
-   SQLite: local agent or desktop-side structured storage
-   Local file system: user-selected exports and evidence
-   Supabase: optional account services or synchronization, not
    mandatory for local operation

Important design decisions: - Make local storage the default. - Give
users control over retention and deletion. - Provide investigation
export and backup options. - Explain browser-profile limitations and
what happens when browser data is cleared. - Do not silently upload
files, investigation records, or scan results. - Separate local data
from data sent to external APIs.

## 8. AI architecture

Support two AI modes.

### Local AI

Possible implementation: - Ollama or another local inference runtime -
Models selected and installed by the user - Local processing of
sensitive investigation data

Advantages: - Better privacy - No required external AI API - Can operate
without internet after setup, depending on the model and configuration

Limitations: - Requires local hardware resources - Model speed and
quality depend on the computer - Users may need to download and manage
models

### External AI

Possible implementation: - OpenRouter or another model API -
User-configurable model selection - Explicit approval before sending
sensitive context

Advantages: - Access to a wider range of models - No need to run a large
model locally - Easier access to more capable models

Limitations: - Requires internet access - May incur API costs - Data is
sent to an external provider

Do not assume that all AI analysis is private just because the OrbINT
interface is hosted locally or uses a local agent. Explain where
inference happens and what data is transmitted.

## 9. Suggested technology stack

  Area                            Suggested technology
  ------------------------------- ---------------------------------
  Web interface                   Next.js, React, TypeScript
  UI styling                      Tailwind CSS
  Browser-side storage            IndexedDB
  Browser file storage            OPFS
  Background browser processing   Web Workers
  Local database                  SQLite
  Local Windows agent             C# / .NET
  Browser automation              Playwright
  Local AI                        Ollama or compatible runtime
  External AI                     Optional OpenRouter integration
  Hosting                         Vercel for the web interface
  Optional authentication/sync    Supabase
  Version control                 GitHub

These are recommendations, not mandatory choices. Review the existing
OrbINT codebase before replacing technologies or rewriting working
features.

## 10. Development roadmap

Build incrementally. Do not rewrite the entire project at once.

### Phase 1: Review and preserve the existing OrbINT project

-   Inspect the current repository and application structure.
-   Identify existing OSINT tools and working functionality.
-   Document current technologies and dependencies.
-   Identify which features already run locally.
-   Preserve existing privacy-conscious behavior.
-   Create a list of features that can be integrated without rewriting.

### Phase 2: Create the unified interface

-   Establish the OrbINT navigation structure.
-   Integrate the cybersecurity dashboard concept.
-   Create the Command Center.
-   Add module pages and shared UI components.
-   Establish a consistent design system.
-   Keep the application usable without connecting a local agent.

### Phase 3: Establish local data storage

-   Implement local settings and preferences.
-   Add local investigation storage.
-   Add local notes and event records.
-   Implement export and backup.
-   Make cloud synchronization optional.

### Phase 4: Integrate existing OSINT tools

-   Bring existing OrbINT functionality into the new navigation.
-   Preserve working collection and analysis logic.
-   Standardize result formats.
-   Add source URLs and collection timestamps.
-   Connect results to investigations.

### Phase 5: Build Web Intelligence

-   Integrate a local Playwright service.
-   Create a dedicated browser-automation workflow.
-   Display browser activity.
-   Add user-approved web research.
-   Store results locally.
-   Add safeguards for automation and external requests.

### Phase 6: Build the local Windows agent

-   Create a small C#/.NET agent.
-   Establish secure local communication.
-   Add agent connection and health status.
-   Implement granular permissions.
-   Start with read-only system information.
-   Add process and network information after security review.
-   Add selected-file inspection.
-   Add a visible audit log.

### Phase 7: Integrate threat intelligence and AI

-   Add optional threat-intelligence sources.
-   Add local AI integration.
-   Add optional external AI.
-   Implement redaction and data-sharing controls.
-   Allow AI to analyze selected investigation findings.
-   Keep evidence and AI-generated conclusions clearly distinguished.

### Phase 8: Testing and release

-   Test browser-only operation.
-   Test local-agent connection and disconnection.
-   Test permission enforcement.
-   Test local data persistence.
-   Test behavior when internet access is unavailable.
-   Test external-request transparency.
-   Review security boundaries.
-   Document installation, permissions, limitations, and removal.

## 11. Key product principles

1.  Local-first: prioritize local processing and storage.
2.  Browser-first: orbint.net is the primary user interface.
3.  Optional agent: deeper system access requires a separately installed
    component.
4.  Explicit permissions: never assume consent to inspect or modify a
    computer.
5.  Read-only by default: make changes only after specific approval.
6.  Transparent networking: disclose external requests and data sharing.
7.  Modular architecture: each capability should be independently
    maintainable.
8.  Preserve existing work: integrate the current OrbINT project instead
    of unnecessarily replacing it.
9.  Evidence-based analysis: distinguish collected evidence,
    external-source claims, and AI-generated assessments.
10. Offline resilience: core local functionality should remain usable
    without an internet connection.

## 12. Recommended initial direction

Start with **Browser + Local Agent** as the long-term architecture, but
build it in stages.

The first usable version should: - Run at orbint.net. - Preserve the
existing OrbINT OSINT tools. - Include the cybersecurity dashboard
modules. - Store investigation data locally. - Perform browser-based
research. - Work without a local agent.

Then introduce the local agent to unlock: - Deeper system information -
Process monitoring - File inspection - Network-connection information -
Local Playwright automation - Additional approved system operations

This approach keeps the initial project manageable while leaving room
for much more advanced functionality.

## 13. Final product definition

**OrbINT is a local-first, browser-based cybersecurity and intelligence
workstation that combines OSINT, web research, system intelligence,
threat analysis, digital forensics, browser automation, and AI-assisted
investigations.**

The browser is the primary interface. The user's computer performs local
operations wherever possible. External services are used selectively for
searches, public intelligence, and optional AI capabilities.

The goal is to make OrbINT powerful without making cloud access or
unrestricted computer permissions a requirement.
