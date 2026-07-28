========================================================================
             SANJEEVNI AI - CINEMATIC PRODUCT DEMO DOCUMENTATION
========================================================================

Project Name: Sanjeevni AI
Tagline: Intelligent Healthcare at the Edge
Subtitle: Empowering Industries with AI-Driven Emergency Care
Theme: Cyber-Healthcare (Blue, Cyan, and White Palette)
Video Duration: 2-3 Minutes (Cinematic Scale) / 45 Seconds (Record Mode)

------------------------------------------------------------------------
1. ABOUT THE PLATFORM
------------------------------------------------------------------------
Sanjeevni AI is an advanced, bandwidth-resilient telemedicine and 
emergency triage ecosystem designed for heavy industrial environments, 
remote factories, mines, and rural outposts. 

Key Features:
* AI Voice Emergency Triage: Evaluates clinical symptoms instantly.
* Offline Edge AI Inference: TFLite running client-side with 0 network dependency.
* Multilingual Support: Switch diagnostics dynamically between English, 
  Hindi, Tamil, and Bengali.
* Hospital & Ambulance Routing: Computes proximity and triggers outposts.
* Local Storage Replication: Secured Dexie/IndexedDB cache that auto-syncs 
  once connection is restored.

------------------------------------------------------------------------
2. SCENE-BY-SCENE FLOW BREAKDOWN
------------------------------------------------------------------------
* Scene 1 - Opening (0-10s):
  Industrial environment silhouette, transition to glowing Sanjeevni AI 
  heartbeat cardiac logo. Text: "Every second matters during a medical emergency."

* Scene 2 - The Problem (10-25s):
  Highlights lack of medical guidance, delayed SOS response (average 
  45 mins+ delay), and connectivity challenges. Infographics count 
  up to show risk levels.

* Scene 3 - Introducing Sanjeevni AI (25-40s):
  Simulated laptop and mobile dashboard frames revealing responsive 
  telemetry widgets, line charts, and the SOS button.

* Scene 4 - Live Emergency Demo (40-90s):
  A worker reports a burn and dizziness via voice. The AI assistant 
  analyzes, tags the severity as "HIGH" (neon pulse), gives first-aid 
  instructions, highlights routes on a map, and triggers the supervisor's 
  alert panel.

* Scene 5 - Edge AI / Offline Mode (90-120s):
  Simulated cellular disconnection ("No Network"). The platform adaptively 
  shifts to local offline inference. Reconnection triggers a green "Data 
  Securely Synced" chimes animation.

* Scene 6 - Multilingual AI Assistant (120-145s):
  AI conversational dialogue processes "chest pain". Translates clinical 
  advice in real-time between English, Hindi, Tamil, and Bengali.

* Scene 7 - Architecture & Technology Stack (145-165s):
  glowing topological architecture diagram featuring Next.js, Node.js, 
  Express.js, MongoDB, Redis, Python, TensorFlow Lite, LLMs, RAG, AWS, 
  Docker, and JWT Authentication.

* Scene 8 - Impact Metrics (165-180s):
  Infographic stats counting up to targets: 70% Faster Response, 100% 
  Offline Assistance, 99% Decision Support, 85% Improved Worker Safety.

* Scene 9 - Closing (180s+):
  Cinematic cardiac pulse wave logo with tagline and medical grid fade-out.

------------------------------------------------------------------------
3. PROJECT FILE STRUCTURE
------------------------------------------------------------------------
All presentation and video engine code is located in the workspace under:
`c:\Local Disk - D\AIT-Sanjeevani-AI\sanjeevni-demo-video\`

Main Files:
* index.html: Interactive cinematic presentation web engine built using 
  Tailwind CSS, GSAP (GreenSock), Canvas particles, and Web Audio API.
* server.js: Pure Node.js static HTTP server script.
* README.txt: This documentation file.

------------------------------------------------------------------------
4. HOW TO RUN THE VIDEO ENGINE LOCALLY
------------------------------------------------------------------------
You can run the interactive presentation locally with full audio synth sweeps, 
heartbeat alarms, and customizable animation speed modifiers:

1. Open a terminal (command prompt or terminal window).
2. Start the local server:
   node sanjeevni-demo-video/server.js
3. Open your web browser and navigate to:
   * Full 3-minute Presentation: http://localhost:3002/
   * Fast 45-second Recording Mode: http://localhost:3002/?speed=fast
4. Click the "Play Demo" button in the bottom right corner of the window.
5. Ensure your speakers are turned on to experience the interface sound effects.

------------------------------------------------------------------------
5. SAVED MEDIA ASSETS
------------------------------------------------------------------------
The recorded cinematic demo video is saved in the IDE brain directory:
* MP4 Widescreen Video: C:\Users\Sumit\.gemini\antigravity-ide\brain\0833ef17-956c-4b39-a81c-3afbd58ee428\sanjeevni_product_demo.mp4
* Source WebP Animation: C:\Users\Sumit\.gemini\antigravity-ide\brain\0833ef17-956c-4b39-a81c-3afbd58ee428\sanjeevni_product_demo_1784651542988.webp

------------------------------------------------------------------------
6. OVERVIEW OF THE SANJEEVNI PLATFORM (MAIN PROJECT)
------------------------------------------------------------------------
Sanjeevni is a complete village-focused telemedicine and rural healthcare 
solution built to support low-bandwidth and zero-internet environments. 

Key Platform Pillars:

1. Bandwidth-Adaptive Consultations:
   * Enables patients to consult with certified doctors via video or audio.
   * Dynamically downgrades to voice-only calls under weak signals (2G/3G) 
     to ensure connectivity never cuts.

2. Offline-First Prescriptions (QR Engine):
   * Doctors generate digital prescriptions encoded into high-density 
     QR codes.
   * These QR codes are saved directly to the patient's device and can be 
     accessed and scanned by chemists offline, requiring 0% internet.

3. Village Pharmacy Stock Integration:
   * Allows patients to view the real-time medicine inventory of local 
     village chemist shops.
   * Promotes travel savings by allowing users to check stock and reserve 
     medicines online before walking to the pharmacy.

4. Emergency ICU & Ambulance Dispatching:
   * Tap-to-alert SOS system that notifies nearby regional outposts, 
     locates active ICU beds, and tracks ambulance coordinates.
   * Routes ambulances to hospitals with available ventilators.

5. Offline Sync & Local Cache:
   * Uses IndexedDB/Dexie on client browsers to queue diagnostic reports, 
     prescriptions, and offline changes.
   * Automatically replicates and synchronizes the local database when 
     connectivity returns.

Target Users & Interface Portals:
* Patients: Consult doctors, view prescriptions offline, check chemist inventory.
* Doctors: Review patient medical history, consult, and issue QR-coded prescriptions.
* Chemists: Scan client QR codes offline, verify treatments, and update inventory count.
* Administrators: Coordinate village outposts, approve doctor credentials, and track regional ICU counts.

------------------------------------------------------------------------
7. COMPLETE PRESENTATION SOURCE CODE (index.html)
------------------------------------------------------------------------
Below is the full source code for the animated product demo interface. You 
can save this block as a separate 'index.html' file to run it.

--- START OF index.html ---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sanjeevni AI - Cinematic Product Demo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Orbitron:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            outfit: ['Outfit', 'sans-serif'],
            orbitron: ['Orbitron', 'sans-serif'],
          },
          colors: {
            medblue: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              500: '#0284c7',
              600: '#0369a1',
              900: '#0c4a6e',
            },
            cyanmed: {
              400: '#22d3ee',
              500: '#06b6d4',
            }
          }
        }
      }
    }
  </script>
  <style>
    .glass-panel {
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .glow-cyan { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
    .glow-blue { box-shadow: 0 0 25px rgba(2, 132, 199, 0.25); }
    .glow-red { box-shadow: 0 0 25px rgba(239, 68, 68, 0.4); }
    .glow-green { box-shadow: 0 0 25px rgba(34, 197, 94, 0.4); }
    .text-glow-cyan { text-shadow: 0 0 10px rgba(6, 182, 212, 0.5); }
    .text-glow-blue { text-shadow: 0 0 10px rgba(2, 132, 199, 0.5); }
    ::-webkit-scrollbar { display: none; }
    html, body { scrollbar-width: none; overflow: hidden; background-color: #030712; }
    .grid-bg {
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    @keyframes heartbeat {
      0% { transform: scale(1); opacity: 0.8; }
      14% { transform: scale(1.12); opacity: 1; }
      28% { transform: scale(1); opacity: 0.8; }
      42% { transform: scale(1.12); opacity: 1; }
      70% { transform: scale(1); opacity: 0.8; }
    }
    .pulse-heart { animation: heartbeat 1.6s infinite ease-in-out; }
  </style>
</head>
<body class="w-screen h-screen font-sans text-slate-100 flex items-center justify-center bg-gray-950 relative overflow-hidden select-none">
  <canvas id="particle-canvas" class="absolute top-0 left-0 w-full h-full pointer-events-none z-0"></canvas>
  <div class="absolute top-0 left-0 w-full h-full grid-bg pointer-events-none z-0"></div>
  <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.95))] pointer-events-none z-0"></div>

  <div id="viewport" class="relative w-full max-w-[1280px] aspect-video glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between z-10">
    <div class="w-full px-6 py-4 flex items-center justify-between border-b border-white/5 z-20 glass-card">
      <div class="flex items-center gap-3">
        <span id="status-dot" class="w-3 h-3 rounded-full bg-cyan-500 pulse-heart shadow-[0_0_10px_#06b6d4]"></span>
        <span id="status-title" class="font-outfit font-semibold text-sm tracking-wider uppercase text-cyan-400">Sanjeevni AI Engine</span>
      </div>
      <div class="flex items-center gap-4 text-xs font-semibold text-slate-400">
        <div id="speed-indicator" class="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">1.0x Speed</div>
        <div id="network-status" class="flex items-center gap-1.5 text-cyan-400">
          <svg id="network-icon" class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.42 0-8 3.58-8 8 0 2.03.76 3.87 2 5.28l1.41-1.41C6.54 13.78 6 12.45 6 11c0-3.31 2.69-6 6-6s6 2.69 6 6c0 1.45-.54 2.78-1.41 3.87l1.41 1.41c1.24-1.41 2-3.25 2-5.28 0-4.42-3.58-8-8-8zm0 4c-2.21 0-4 1.79-4 4 0 1.01.37 1.93 1 2.64l1.41-1.41C10.16 11.83 10 11.43 10 11c0-1.1.9-2 2-2s2 .9 2 2c0 .43-.16.83-.41 1.23l1.41 1.41c.63-.71 1-1.63 1-2.64 0-2.21-1.79-4-4-4zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
          <span id="network-text">SYS_ONLINE</span>
        </div>
      </div>
    </div>

    <div id="scenes-container" class="relative w-full flex-1 overflow-hidden">
      <div id="scene1" class="scene absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-3xl space-y-6">
          <p id="s1-subtitle" class="text-xl md:text-2xl text-slate-300 font-light italic leading-relaxed tracking-wide">
            "Every second matters during a medical emergency."
          </p>
          <div id="s1-logo-container" class="opacity-0 translate-y-8 space-y-2">
            <div class="flex justify-center mb-4">
              <div class="relative w-20 h-20 flex items-center justify-center rounded-full bg-medblue-500/10 border border-medblue-500/30 glow-blue">
                <svg class="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 12h2l2-3 2 6 2-3h2" class="stroke-cyan-400" />
                </svg>
              </div>
            </div>
            <h1 class="text-5xl md:text-6xl font-extrabold font-outfit tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-medblue-100 to-cyan-400 text-glow-cyan">
              Sanjeevni AI
            </h1>
            <p class="text-lg md:text-xl text-cyan-400 font-orbitron tracking-widest font-medium uppercase mt-2">
              Edge AI Powered Intelligent Healthcare Platform
            </p>
          </div>
        </div>
      </div>

      <div id="scene2" class="scene absolute inset-0 w-full h-full flex flex-col justify-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full max-w-5xl mx-auto">
          <div class="space-y-6">
            <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Critical Challenge</span>
            <h2 class="text-3xl md:text-4xl font-bold font-outfit text-white leading-tight">
              Rural Industrial Sites Lack Immediate Medical Access
            </h2>
            <div class="space-y-4 text-slate-300 text-sm md:text-base">
              <div class="flex items-start gap-3">
                <span class="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-semibold text-xs mt-0.5">!</span>
                <p>Factories, mines, and remote sites face extremely delayed emergency support.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-semibold text-xs mt-0.5">!</span>
                <p>Slow internet, cellular dead zones, and zero immediate guidance put lives at risk.</p>
              </div>
            </div>
          </div>
          <div class="glass-card rounded-2xl p-6 border border-white/5 glow-red flex flex-col justify-between h-[250px] relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase text-slate-400 font-semibold tracking-wider font-outfit">Telemetry Analysis</span>
              <span class="w-2 h-2 rounded-full bg-red-500 pulse-heart"></span>
            </div>
            <div class="flex items-center justify-around my-2">
              <div class="text-center">
                <div class="text-4xl md:text-5xl font-extrabold text-red-500 font-orbitron text-glow-red" id="s2-stat1">0%</div>
                <div class="text-[9px] text-slate-400 mt-1 uppercase font-semibold">Immediate Guidance</div>
              </div>
              <div class="h-16 w-[1px] bg-white/10"></div>
              <div class="text-center">
                <div class="text-4xl md:text-5xl font-extrabold text-slate-300 font-orbitron" id="s2-stat2">0s</div>
                <div class="text-[9px] text-slate-400 mt-1 uppercase font-semibold">Average SOS Delay</div>
              </div>
            </div>
            <div class="text-xs text-red-400/90 font-medium flex items-center gap-2 bg-red-500/5 p-2.5 rounded border border-red-500/10">
              <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 5a1 1 0 112 0v5a1 1 0 11-2 0V5zm1 9a1 1 0 100-2 1 1 0 000 2z"/></svg>
              <span>Delayed response increases critical health risks by 60% in remote locations.</span>
            </div>
          </div>
        </div>
      </div>

      <div id="scene3" class="scene absolute inset-0 w-full h-full flex flex-col justify-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div class="space-y-5 col-span-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">Introducing The Solution</span>
            <h2 class="text-4xl font-bold font-outfit text-white leading-tight">
              Sanjeevni AI Platform
            </h2>
            <p class="text-slate-300 text-sm md:text-base">
              A comprehensive intelligence medical layer providing continuous, resilient healthcare access at the industrial edge.
            </p>
            <div class="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div class="glass-card p-3 rounded border border-white/5 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>AI Emergency Triage</div>
              <div class="glass-card p-3 rounded border border-white/5 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Offline Edge AI</div>
              <div class="glass-card p-3 rounded border border-white/5 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Multilingual Assistant</div>
              <div class="glass-card p-3 rounded border border-white/5 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Local Sync Center</div>
            </div>
          </div>
          <div class="col-span-3 relative h-[300px] flex items-center justify-center">
            <div id="s3-laptop" class="glass-panel w-[380px] h-[220px] rounded-xl border border-white/10 glow-blue overflow-hidden relative translate-x-[-20px] scale-95 shadow-2xl">
              <div class="w-full h-5 bg-white/5 border-b border-white/5 flex items-center px-2 gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span class="text-[9px] text-slate-500 ml-2 font-mono">sanjeevni.ai/dashboard</span>
              </div>
              <div class="p-3 grid grid-cols-4 gap-2 h-full text-[9px]">
                <div class="col-span-1 border-r border-white/5 space-y-1">
                  <div class="font-bold text-[8px] text-cyan-400 uppercase tracking-wide">Sanjeevni</div>
                  <div class="bg-white/5 rounded p-1 text-[8px] text-slate-200">Overview</div>
                  <div class="rounded p-1 text-[8px] text-slate-400">SOS Alerts</div>
                  <div class="rounded p-1 text-[8px] text-slate-400">Inventory</div>
                </div>
                <div class="col-span-3 space-y-2">
                  <div class="flex justify-between items-center bg-white/5 p-1 rounded">
                    <span class="text-slate-300">Live Outpost Status</span>
                    <span class="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[7px]">Active</span>
                  </div>
                  <div class="h-20 bg-slate-900/60 rounded border border-white/5 p-1 flex flex-col justify-between">
                    <span class="text-slate-500 text-[7px]">Active Local Node Telemetry</span>
                    <svg class="w-full h-12 stroke-cyan-400 fill-cyan-400/10" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path d="M 0,25 Q 15,10 30,18 T 60,8 T 90,20 T 100,5 L 100,30 L 0,30 Z" stroke-width="1.5"></path>
                    </svg>
                  </div>
                  <div class="grid grid-cols-2 gap-1 text-[7px]">
                    <div class="bg-white/5 p-1 rounded border border-white/5">Local Cache: 100%</div>
                    <div class="bg-white/5 p-1 rounded border border-white/5">Triage State: Ready</div>
                  </div>
                </div>
              </div>
            </div>
            <div id="s3-phone" class="absolute glass-panel w-[130px] h-[240px] rounded-[20px] border-2 border-white/20 glow-cyan overflow-hidden right-8 top-6 shadow-2xl flex flex-col justify-between">
              <div class="w-full h-4 bg-black/60 flex items-center justify-center gap-1.5 px-3">
                <div class="w-8 h-1 rounded-full bg-white/25"></div>
                <div class="w-1 h-1 rounded-full bg-white/25"></div>
              </div>
              <div class="flex-1 p-2 flex flex-col justify-between bg-gray-950/80">
                <div class="flex items-center justify-between text-[7px] text-slate-400 border-b border-white/5 pb-1">
                  <span>SOS Triage</span>
                  <span class="text-cyan-400 font-semibold">Offline Ready</span>
                </div>
                <div class="my-auto text-center space-y-2">
                  <div class="w-14 h-14 rounded-full bg-red-600 border-2 border-red-500/50 mx-auto flex items-center justify-center text-[10px] font-bold text-white shadow-lg pulse-heart cursor-pointer">SOS</div>
                  <div class="text-[7px] text-slate-400">Tap to Alert Medical Team</div>
                </div>
                <div class="bg-white/5 rounded p-1 border border-white/5 text-[7px] text-center text-slate-300">
                  Adaptive 2G/3G Network Active
                </div>
              </div>
              <div class="w-full h-3 bg-black/40 flex items-center justify-center">
                <div class="w-12 h-0.5 rounded bg-white/30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="scene4" class="scene absolute inset-0 w-full h-full flex flex-col justify-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div class="md:col-span-5 glass-panel rounded-2xl border border-white/10 glow-cyan h-[300px] flex flex-col justify-between overflow-hidden relative">
            <div class="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span class="text-xs font-bold font-outfit text-slate-200">Sanjeevni AI Assistant</span>
              </div>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase tracking-wider animate-pulse">Severity: HIGH</span>
            </div>
            <div class="flex-1 p-3 overflow-y-auto space-y-3 text-[10px] flex flex-col justify-end" id="s4-chat-box">
              <div id="s4-msg-user" class="self-end bg-cyan-600/30 text-cyan-100 p-2 rounded-xl rounded-tr-none max-w-[85%] border border-cyan-500/20 opacity-0 translate-y-4">
                <div class="font-semibold text-[8px] text-cyan-400 mb-0.5">Worker (Voice input)</div>
                "I've burned my hand and feel dizzy."
              </div>
              <div id="s4-msg-thinking" class="self-start bg-white/5 text-slate-300 p-2.5 rounded-xl rounded-tl-none max-w-[85%] border border-white/5 flex items-center gap-2 opacity-0 translate-y-4">
                <svg class="animate-spin h-3.5 w-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Analyzing diagnostic symptoms...</span>
              </div>
              <div id="s4-msg-ai" class="self-start bg-slate-900/80 text-slate-200 p-2.5 rounded-xl rounded-tl-none max-w-[90%] border border-white/10 opacity-0 translate-y-4 space-y-1.5 shadow-md">
                <div class="font-bold text-[8px] text-red-400 tracking-wider uppercase">Triage System: Severity Level High</div>
                <p class="font-semibold text-slate-100">Immediate Action Steps:</p>
                <ul class="list-disc list-inside space-y-1 text-slate-300 text-[9px]">
                  <li>Run cool water over burn for 10-15 mins</li>
                  <li>Sit down immediately & hydrate to prevent shock</li>
                  <li>Ambulance dispatched; Outpost Supervisor notified</li>
                </ul>
              </div>
            </div>
            <div class="p-2 bg-white/5 border-t border-white/5 flex items-center gap-2">
              <div class="flex-1 bg-black/40 rounded-full h-7 flex items-center px-3 border border-white/5">
                <div class="flex items-center gap-0.5 w-full justify-center" id="s4-waveform">
                  <span class="w-1 h-3 bg-cyan-400/50 rounded-full"></span>
                  <span class="w-1 h-2 bg-cyan-400/50 rounded-full"></span>
                  <span class="w-1 h-4 bg-cyan-500 rounded-full"></span>
                  <span class="w-1 h-1 bg-cyan-400/50 rounded-full"></span>
                  <span class="w-1 h-5 bg-cyan-400 rounded-full"></span>
                  <span class="w-1 h-3 bg-cyan-400/50 rounded-full"></span>
                </div>
              </div>
              <div class="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-white glow-cyan">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
              </div>
            </div>
          </div>

          <div class="md:col-span-7 space-y-4">
            <div id="s4-map-card" class="glass-card rounded-2xl p-4 border border-white/5 h-[190px] relative overflow-hidden opacity-0 translate-y-4 shadow-lg">
              <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[8px] font-bold text-cyan-400 uppercase tracking-wider z-10 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 pulse-heart"></span>Emergency Navigation
              </div>
              <div class="absolute inset-0 bg-slate-950/80">
                <svg class="w-full h-full opacity-60" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <path d="M 0,40 L 200,40" stroke="#ffffff" stroke-width="0.7" stroke-dasharray="2,2"></path>
                  <path d="M 50,0 L 50,100" stroke="#ffffff" stroke-width="0.7" stroke-dasharray="2,2"></path>
                  <path d="M 140,0 L 140,100" stroke="#ffffff" stroke-width="0.7" stroke-dasharray="2,2"></path>
                  <path d="M 0,80 Q 80,60 200,80" stroke="#ffffff" stroke-width="0.5" fill="none"></path>
                  <circle cx="50" cy="40" r="1.5" fill="#f43f5e"></circle>
                  <circle cx="50" cy="40" r="6" stroke="#f43f5e" stroke-width="0.5" fill="none" class="animate-ping" style="transform-origin: 50px 40px;"></circle>
                  <circle cx="140" cy="80" r="1.5" fill="#06b6d4"></circle>
                  <path id="s4-route-path" d="M 50,40 L 50,75 L 140,78" stroke="#06b6d4" stroke-width="1.5" fill="none" stroke-dasharray="100" stroke-dashoffset="100"></path>
                </svg>
              </div>
              <div class="absolute bottom-2 right-2 left-2 glass-panel p-2 rounded-lg border border-white/10 flex justify-between items-center text-[8px]">
                <div class="space-y-0.5">
                  <div class="font-bold text-slate-200">AIT Outpost Hospital</div>
                  <div class="text-slate-400">ETA: 6 Minutes | Distance: 1.2 km</div>
                </div>
                <div class="px-2 py-1 bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 rounded uppercase tracking-wider">Dispatched</div>
              </div>
            </div>

            <div id="s4-sup-alert" class="glass-panel p-3.5 rounded-xl border border-red-500/20 glow-red flex items-center justify-between opacity-0 translate-y-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                </div>
                <div>
                  <div class="text-[10px] font-bold text-slate-100 uppercase tracking-wide">Supervisor Terminal Dispatch</div>
                  <p class="text-[9px] text-slate-300">ALERT: Worker collapse telemetry in Sector B. Hospital dispatch confirmed.</p>
                </div>
              </div>
              <span class="text-[8px] font-bold text-red-400 uppercase border border-red-500/30 px-2 py-0.5 rounded bg-red-500/10">Active SOS</span>
            </div>
          </div>
        </div>
      </div>

      <div id="scene5" class="scene absolute inset-0 w-full h-full flex flex-col justify-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="space-y-6">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-500 text-white font-orbitron" id="s5-status-badge">Online</span>
              <span class="text-xs font-semibold text-slate-400 font-mono">Telemetry Status Loop</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold font-outfit text-white leading-tight">
              Offline Edge Resilience
            </h2>
            <p class="text-slate-300 text-sm md:text-base">
              Even in cellular dead zones or sub-zero internet locations, Sanjeevni continues diagnostic processing locally. No cloud latency. No downtime.
            </p>
            <div class="space-y-2.5 text-xs">
              <div class="flex items-center gap-2.5 text-slate-300" id="s5-check1">
                <span class="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-[10px]">✔</span>
                <span>Local TFLite Inference (Zero Cloud Dependency)</span>
              </div>
              <div class="flex items-center gap-2.5 text-slate-300" id="s5-check2">
                <span class="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-[10px]">✔</span>
                <span>Local Database Caching (Secured Dexie/IndexedDB Store)</span>
              </div>
              <div class="flex items-center gap-2.5 text-slate-300" id="s5-check3">
                <span class="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-[10px]">✔</span>
                <span>Automatic Reconciliation Sync when Connection Restores</span>
              </div>
            </div>
          </div>
          <div class="glass-card rounded-2xl p-6 border border-white/5 glow-cyan h-[240px] flex flex-col justify-between relative overflow-hidden">
            <div class="absolute inset-0 opacity-15">
              <svg class="w-full h-full stroke-cyan-500" fill="none" viewBox="0 0 100 50">
                <path d="M10,10 H90 V40 H10 Z M30,10 V40 M60,10 V40 M10,25 H90" stroke-width="0.5"></path>
                <circle cx="30" cy="25" r="2" fill="currentColor"></circle>
                <circle cx="60" cy="25" r="2" fill="currentColor"></circle>
              </svg>
            </div>
            <div class="flex justify-between items-center z-10">
              <span class="text-xs uppercase text-slate-400 font-semibold tracking-wider font-orbitron">Edge Hardware Diagnostics</span>
              <span class="px-2 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" id="s5-sync-indicator">Standby</span>
            </div>
            <div class="flex items-center justify-center gap-6 my-auto z-10">
              <div class="w-20 h-20 rounded-xl bg-slate-900 border-2 border-cyan-500/40 flex flex-col items-center justify-center text-center shadow-lg relative glow-cyan" id="s5-chip">
                <span class="text-[9px] font-orbitron font-extrabold text-cyan-400">EDGE AI</span>
                <span class="text-[7px] text-slate-400 uppercase mt-0.5">Inference</span>
                <div class="absolute -top-1 -left-1 w-2.5 h-2.5 bg-cyan-400 rounded-sm"></div>
                <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-sm"></div>
              </div>
              <div class="space-y-1.5 text-xs">
                <div class="text-[10px] text-slate-400">Inference Device Node</div>
                <div class="text-sm font-bold text-white font-mono" id="s5-inference-metrics">Client CPU (Active)</div>
                <div class="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider" id="s5-network-overlay-text">Local Engine Mode</div>
              </div>
            </div>
            <div class="text-[9px] text-slate-300 z-10" id="s5-footer-text">
              Network state stable. Sync active.
            </div>
          </div>
        </div>
      </div>

      <div id="scene6" class="scene absolute inset-0 w-full h-full flex flex-col justify-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="space-y-6">
            <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">AI Symptom Assistant</span>
            <h2 class="text-3xl md:text-4xl font-bold font-outfit text-white leading-tight">
              Intelligent Multilingual Diagnostics
            </h2>
            <p class="text-slate-300 text-sm md:text-base">
              The AI conversational engine translates technical health diagnostics instantly into localized regional languages, bridging the literacy and linguistic divide in heavy industrial sectors.
            </p>
            <div class="flex flex-wrap gap-2 text-xs font-semibold">
              <span id="s6-badge-en" class="px-3 py-1 rounded-full bg-cyan-500 text-white shadow-sm border border-cyan-400">English</span>
              <span id="s6-badge-hi" class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">हिन्दी (Hindi)</span>
              <span id="s6-badge-ta" class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">தமிழ் (Tamil)</span>
              <span id="s6-badge-bn" class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">বাঙালি (Bengali)</span>
            </div>
          </div>
          <div class="glass-card rounded-2xl p-5 border border-white/5 glow-cyan h-[240px] flex flex-col justify-between relative overflow-hidden">
            <div class="flex justify-between items-center text-xs text-slate-400 border-b border-white/5 pb-2">
              <span class="font-semibold uppercase tracking-wider font-outfit">AI Language Model Translator</span>
              <span id="s6-curr-lang" class="font-mono text-cyan-400 font-bold">LANG_EN</span>
            </div>
            <div class="my-auto space-y-4">
              <div class="bg-white/5 border border-white/5 p-2 rounded-lg text-[10px]">
                <div class="text-slate-400 text-[8px] uppercase font-bold tracking-wider mb-0.5">Symptom Query</div>
                <div id="s6-text-query" class="font-semibold text-white">"I have chest pain."</div>
              </div>
              <div class="bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-lg text-[10px] shadow-sm">
                <div class="text-cyan-400 text-[8px] uppercase font-bold tracking-wider mb-0.5">Clinical Response Guidance</div>
                <div id="s6-text-response" class="text-slate-200 leading-normal">"Possible acute cardiac symptom. Sit down immediately. Outpost dispatched."</div>
              </div>
            </div>
            <div class="text-[7px] text-slate-500 uppercase tracking-widest text-center">
              Translation mapping matrix active
            </div>
          </div>
        </div>
      </div>

      <div id="scene7" class="scene absolute inset-0 w-full h-full flex flex-col justify-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-5xl mx-auto w-full text-center space-y-6">
          <div class="space-y-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">Core Architecture</span>
            <h2 class="text-3xl md:text-4xl font-bold font-outfit text-white">
              The Technology Stack
            </h2>
          </div>
          <div class="relative w-full max-w-3xl mx-auto h-[220px] flex items-center justify-center overflow-hidden">
            <svg class="absolute inset-0 w-full h-full" id="s7-lines" viewBox="0 0 800 220" fill="none">
              <path class="s7-path" d="M 400,110 L 150,50" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="5,5"></path>
              <path class="s7-path" d="M 400,110 L 150,170" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="5,5"></path>
              <path class="s7-path" d="M 400,110 L 650,50" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="5,5"></path>
              <path class="s7-path" d="M 400,110 L 650,170" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="5,5"></path>
            </svg>
            <div id="s7-center" class="absolute w-24 h-24 rounded-full bg-slate-900 border-2 border-cyan-500 flex flex-col items-center justify-center z-10 glow-cyan">
              <span class="text-[9px] font-orbitron font-extrabold text-cyan-400">EDGE</span>
              <span class="text-[8px] font-outfit text-slate-400 font-bold">GATEWAY</span>
            </div>
            <div class="s7-node absolute left-12 top-4 w-28 bg-slate-950/90 border border-white/10 rounded-lg p-2 text-left text-[9px] space-y-1">
              <div class="text-cyan-400 font-bold font-outfit">Frontend Layer</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>Next.js</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>Tailwind CSS</div>
            </div>
            <div class="s7-node absolute left-12 bottom-4 w-28 bg-slate-950/90 border border-white/10 rounded-lg p-2 text-left text-[9px] space-y-1">
              <div class="text-cyan-400 font-bold font-outfit">Services Layer</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>Node / Express</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>JWT Auth</div>
            </div>
            <div class="s7-node absolute right-12 top-4 w-32 bg-slate-950/90 border border-white/10 rounded-lg p-2 text-left text-[9px] space-y-1">
              <div class="text-cyan-400 font-bold font-outfit">AI & Local Inference</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>TensorFlow Lite</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>Local LLM RAG</div>
            </div>
            <div class="s7-node absolute right-12 bottom-4 w-32 bg-slate-950/90 border border-white/10 rounded-lg p-2 text-left text-[9px] space-y-1">
              <div class="text-cyan-400 font-bold font-outfit">Database & Cache</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>MongoDB / Prisma</div>
              <div class="text-slate-300 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-cyan-400"></span>Redis Cache</div>
            </div>
          </div>
        </div>
      </div>

      <div id="scene8" class="scene absolute inset-0 w-full h-full flex flex-col justify-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="space-y-6">
            <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">Societal Impact</span>
            <h2 class="text-3xl md:text-4xl font-bold font-outfit text-white leading-tight">
              Quantifiable Healthcare Outcomes
            </h2>
            <p class="text-slate-300 text-sm md:text-base">
              Providing low-latency emergency triage decision support and secure messaging protocols to drastically minimize workspace health incidents.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="glass-card p-4 rounded-xl border border-white/5 text-center space-y-1 glow-cyan">
              <div class="text-4xl font-bold font-orbitron text-cyan-400 text-glow-cyan" id="s8-metric1">0%</div>
              <div class="text-[9px] uppercase font-bold text-slate-400">Faster Initial Response</div>
            </div>
            <div class="glass-card p-4 rounded-xl border border-white/5 text-center space-y-1">
              <div class="text-4xl font-bold font-orbitron text-slate-200" id="s8-metric2">0%</div>
              <div class="text-[9px] uppercase font-bold text-slate-400">Offline Resilience</div>
            </div>
            <div class="glass-card p-4 rounded-xl border border-white/5 text-center space-y-1">
              <div class="text-4xl font-bold font-orbitron text-slate-200" id="s8-metric3">0%</div>
              <div class="text-[9px] uppercase font-bold text-slate-400">Decision Support</div>
            </div>
            <div class="glass-card p-4 rounded-xl border border-white/5 text-center space-y-1 glow-cyan">
              <div class="text-4xl font-bold font-orbitron text-cyan-400 text-glow-cyan" id="s8-metric4">0%</div>
              <div class="text-[9px] uppercase font-bold text-slate-400">Improved Worker Safety</div>
            </div>
          </div>
        </div>
      </div>

      <div id="scene9" class="scene absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center px-12 z-10 opacity-0 pointer-events-none">
        <div class="max-w-2xl space-y-6">
          <div class="flex justify-center mb-6">
            <div id="s9-logo-ring" class="relative w-24 h-24 flex items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/40 glow-cyan pulse-heart">
              <svg class="w-14 h-14 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 12h2l2-3 2 6 2-3h2" />
              </svg>
            </div>
          </div>
          <h1 class="text-5xl md:text-6xl font-extrabold font-outfit text-white tracking-tight text-glow-cyan">
            Sanjeevni AI
          </h1>
          <p class="text-xl text-cyan-400 font-orbitron tracking-widest uppercase font-semibold">
            Intelligent Healthcare at the Edge
          </p>
          <p class="text-sm md:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            Empowering Industries with AI-Driven Emergency Care.
          </p>
          <div class="pt-4">
            <button id="restart-btn" class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 font-semibold rounded-full text-xs text-slate-950 uppercase tracking-widest glow-cyan border border-cyan-400 transition cursor-pointer">
              Restart Demo
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full px-6 py-4 flex items-center justify-between border-t border-white/5 z-20 glass-card">
      <div class="flex-1 mr-4">
        <span class="text-[9px] uppercase font-bold text-cyan-400 tracking-widest font-mono">Narrator Visual Audio:</span>
        <div id="narrator-caption" class="text-sm font-medium text-slate-200 h-8 mt-1 italic flex items-center leading-normal">
          Initializing Sanjeevni AI presentation sequence...
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="mode-toggle-btn" class="px-3 py-1.5 rounded-full border border-white/10 hover:border-cyan-400/50 bg-white/5 text-[10px] font-bold uppercase text-slate-300 transition cursor-pointer">
          Switch to Fast (45s)
        </button>
        <button id="play-pause-btn" class="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider glow-cyan transition cursor-pointer">
          Play Demo
        </button>
      </div>
    </div>
  </div>

  <div id="demo-state" class="hidden">IDLE</div>

  <script>
    const AudioEngine = {
      ctx: null,
      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) this.ctx = new AudioContext();
        }
      },
      playSwoosh() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
      },
      playAlert() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.setValueAtTime(660, this.ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.55);
      },
      playHeartbeatPulse() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(65, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
      }
    };

    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 65;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.size = Math.random() * 2 + 1;
        this.color = Math.random() > 0.8 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(2, 132, 199, 0.3)';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) particles.push(new Particle());

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();

    let isFastMode = false;
    let speedFactor = 1;
    let timeline = null;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('speed') === 'fast' || urlParams.get('mode') === 'record') {
      isFastMode = true;
      speedFactor = 4;
      document.getElementById('mode-toggle-btn').innerText = "Switch to Normal (180s)";
      document.getElementById('speed-indicator').innerText = "4.0x Speed (Record Mode)";
    }

    document.getElementById('mode-toggle-btn').addEventListener('click', () => {
      isFastMode = !isFastMode;
      if (isFastMode) {
        speedFactor = 4;
        document.getElementById('mode-toggle-btn').innerText = "Switch to Normal (180s)";
        document.getElementById('speed-indicator').innerText = "4.0x Speed (Record Mode)";
      } else {
        speedFactor = 1;
        document.getElementById('mode-toggle-btn').innerText = "Switch to Fast (45s)";
        document.getElementById('speed-indicator').innerText = "1.0x Speed";
      }
      if (timeline && timeline.isActive()) playDemo();
    });

    const playPauseBtn = document.getElementById('play-pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const demoStateDiv = document.getElementById('demo-state');

    playPauseBtn.addEventListener('click', () => {
      if (timeline && timeline.isActive()) {
        timeline.pause();
        playPauseBtn.innerText = "Resume";
        demoStateDiv.innerText = "PAUSED";
      } else if (timeline && timeline.paused()) {
        timeline.resume();
        playPauseBtn.innerText = "Pause";
        demoStateDiv.innerText = "RUNNING";
      } else {
        playDemo();
      }
    });

    restartBtn.addEventListener('click', () => { playDemo(); });

    function playDemo() {
      if (timeline) timeline.kill();
      gsap.killTweensOf("*");
      gsap.set(".scene", { opacity: 0, pointerEvents: "none" });
      document.getElementById('status-dot').className = "w-3 h-3 rounded-full bg-cyan-500 pulse-heart shadow-[0_0_10px_#06b6d4]";
      document.getElementById('status-title').className = "font-outfit font-semibold text-sm tracking-wider uppercase text-cyan-400";
      document.getElementById('status-title').innerText = "Sanjeevni AI Engine";
      document.getElementById('network-status').className = "flex items-center gap-1.5 text-cyan-400";
      document.getElementById('network-text').innerText = "SYS_ONLINE";
      document.getElementById('network-icon').classList.remove("text-red-500", "text-emerald-400");
      document.getElementById('network-icon').classList.add("text-cyan-400");
      
      document.getElementById('s6-curr-lang').innerText = "LANG_EN";
      document.getElementById('s6-text-query').innerText = `"I have chest pain."`;
      document.getElementById('s6-text-response').innerText = `"Possible acute cardiac symptom. Sit down immediately. Outpost dispatched."`;
      document.getElementById('s6-badge-en').className = "px-3 py-1 rounded-full bg-cyan-500 text-white shadow-sm border border-cyan-400";
      document.getElementById('s6-badge-hi').className = "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400";
      document.getElementById('s6-badge-ta').className = "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400";
      document.getElementById('s6-badge-bn').className = "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400";

      document.getElementById('s5-status-badge').innerText = "Online";
      document.getElementById('s5-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-500 text-white font-orbitron";
      document.getElementById('s5-sync-indicator').innerText = "Standby";
      document.getElementById('s5-sync-indicator').className = "px-2 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      document.getElementById('s5-network-overlay-text').innerText = "Local Engine Mode";
      document.getElementById('s5-footer-text').innerText = "Network state stable. Sync active.";

      timeline = gsap.timeline({
        onStart: () => { demoStateDiv.innerText = "RUNNING"; playPauseBtn.innerText = "Pause"; },
        onComplete: () => { demoStateDiv.innerText = "FINISHED"; playPauseBtn.innerText = "Play Demo"; }
      });

      function narrate(text, timeAt) {
        timeline.add(() => { document.getElementById('narrator-caption').innerText = text; }, timeAt);
      }

      function playSfx(type, timeAt) {
        timeline.add(() => {
          if (type === 'swoosh') AudioEngine.playSwoosh();
          if (type === 'alert') AudioEngine.playAlert();
          if (type === 'heart') AudioEngine.playHeartbeatPulse();
        }, timeAt);
      }

      const sec = (normalSec) => normalSec / speedFactor;

      const S1_START = 0;
      narrate("Every second matters in a medical emergency. Introducing Sanjeevni AI.", sec(S1_START));
      playSfx('swoosh', sec(S1_START));
      timeline.to("#scene1", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S1_START));
      timeline.fromTo("#s1-subtitle", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: sec(2.5) }, sec(S1_START + 0.5));
      timeline.to("#s1-subtitle", { opacity: 0, y: -15, duration: sec(1) }, sec(S1_START + 4.5));
      timeline.to("#s1-logo-container", { opacity: 1, y: 0, duration: sec(2) }, sec(S1_START + 5.5));
      playSfx('heart', sec(S1_START + 5.5));
      timeline.to("#scene1", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S1_START + 9.5));

      const S2_START = 10;
      narrate("Remote industrial sites face severe communication latency, leaving worker health critically exposed.", sec(S2_START));
      playSfx('swoosh', sec(S2_START));
      timeline.add(() => {
        document.getElementById('status-title').innerText = "EMERGENCY DISCONNECT SEARCH";
        document.getElementById('status-title').className = "font-outfit font-semibold text-sm tracking-wider uppercase text-red-500 animate-pulse";
        document.getElementById('status-dot').className = "w-3 h-3 rounded-full bg-red-500 pulse-heart shadow-[0_0_10px_rgba(239,68,68,0.8)]";
      }, sec(S2_START));
      timeline.to("#scene2", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S2_START));
      timeline.fromTo("#s2-stat1", { textContent: "0%" }, { textContent: "60%", duration: sec(3.5), ease: "power1.out", snap: { textContent: 1 }, modifiers: { textContent: val => val + "%" } }, sec(S2_START + 2));
      timeline.fromTo("#s2-stat2", { textContent: "0s" }, { textContent: "45m", duration: sec(4.5), ease: "power1.out", snap: { textContent: 1 }, modifiers: { textContent: val => val + "+" } }, sec(S2_START + 2));
      timeline.to("#scene2", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S2_START + 14.5));

      const S3_START = 25;
      narrate("Introducing Sanjeevni AI. An Edge AI powered medical ecosystem designed for instant diagnosis.", sec(S3_START));
      playSfx('swoosh', sec(S3_START));
      timeline.add(() => {
        document.getElementById('status-title').innerText = "SANJEEVNI CORE ACTIVE";
        document.getElementById('status-title').className = "font-outfit font-semibold text-sm tracking-wider uppercase text-cyan-400";
        document.getElementById('status-dot').className = "w-3 h-3 rounded-full bg-cyan-500 pulse-heart shadow-[0_0_10px_#06b6d4]";
      }, sec(S3_START));
      timeline.to("#scene3", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S3_START));
      timeline.fromTo("#s3-laptop", { rotateY: -15, scale: 0.9 }, { rotateY: 0, scale: 1, duration: sec(2.5), ease: "back.out(1.2)" }, sec(S3_START + 0.5));
      timeline.fromTo("#s3-phone", { rotateY: 15, scale: 0.9 }, { rotateY: 0, scale: 1, duration: sec(2.5), ease: "back.out(1.2)" }, sec(S3_START + 1.2));
      timeline.to("#scene3", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S3_START + 14.5));

      const S4_START = 40;
      narrate("Demo: A worker collapses due to a severe burn. The voice-triage analyzes and responds instantly.", sec(S4_START));
      playSfx('swoosh', sec(S4_START));
      timeline.to("#scene4", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S4_START));
      timeline.to("#s4-msg-user", { opacity: 1, y: 0, duration: sec(1.5), ease: "power2.out" }, sec(S4_START + 2));
      playSfx('heart', sec(S4_START + 2));
      timeline.to("#s4-msg-thinking", { opacity: 1, y: 0, duration: sec(1) }, sec(S4_START + 5.5));
      timeline.to("#s4-msg-thinking", { opacity: 0, y: -10, duration: sec(0.5) }, sec(S4_START + 12));
      timeline.to("#s4-msg-ai", { opacity: 1, y: 0, duration: sec(2), ease: "power2.out" }, sec(S4_START + 12.5));
      playSfx('alert', sec(S4_START + 12.5));
      timeline.to("#s4-map-card", { opacity: 1, y: 0, duration: sec(2) }, sec(S4_START + 16.5));
      timeline.to("#s4-route-path", { strokeDashoffset: 0, duration: sec(4), ease: "none" }, sec(S4_START + 18.5));
      timeline.to("#s4-sup-alert", { opacity: 1, y: 0, duration: sec(2) }, sec(S4_START + 24.5));
      playSfx('alert', sec(S4_START + 24.5));
      timeline.to("#scene4", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S4_START + 49.5));

      const S5_START = 90;
      narrate("Simulating communication breakdown: The system adaptively processes diagnostics local-first.", sec(S5_START));
      playSfx('swoosh', sec(S5_START));
      timeline.to("#scene5", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S5_START));
      timeline.add(() => {
        document.getElementById('network-status').className = "flex items-center gap-1.5 text-red-500 animate-pulse";
        document.getElementById('network-text').innerText = "DISCONNECTED";
        document.getElementById('network-icon').className = "w-4 h-4 text-red-500 fill-current";
        document.getElementById('s5-status-badge').innerText = "Offline Mode";
        document.getElementById('s5-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-500 text-white font-orbitron";
        document.getElementById('s5-sync-indicator').innerText = "Cached Local";
        document.getElementById('s5-sync-indicator').className = "px-2 py-0.5 rounded text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
        document.getElementById('s5-network-overlay-text').innerText = "OFFLINE INFERENCE LOOP";
      }, sec(S5_START + 2));
      playSfx('alert', sec(S5_START + 2.1));
      timeline.fromTo("#s5-chip", { scale: 1 }, { scale: 1.1, repeat: 5, yoyo: true, duration: sec(1) }, sec(S5_START + 3.5));
      timeline.add(() => {
        document.getElementById('network-status').className = "flex items-center gap-1.5 text-emerald-400";
        document.getElementById('network-text').innerText = "SYS_SYNCED";
        document.getElementById('network-icon').className = "w-4 h-4 text-emerald-400 fill-current";
        document.getElementById('s5-status-badge').innerText = "Synced";
        document.getElementById('s5-status-badge').className = "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 font-orbitron";
        document.getElementById('s5-sync-indicator').innerText = "Success Sync";
        document.getElementById('s5-sync-indicator').className = "px-2 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        document.getElementById('s5-network-overlay-text').innerText = "RECONCILIATION COMPLETE";
        document.getElementById('s5-footer-text').innerText = "Database replication completed successfully.";
      }, sec(S5_START + 14));
      playSfx('heart', sec(S5_START + 14.1));
      timeline.to("#scene5", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S5_START + 29.5));

      const S6_START = 120;
      narrate("Sanjeevni translates diagnostic guidelines automatically into regional local languages.", sec(S6_START));
      playSfx('swoosh', sec(S6_START));
      timeline.add(() => { document.getElementById('status-title').innerText = "TRANSLATION ENGINE ACTIVE"; }, sec(S6_START));
      timeline.to("#scene6", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S6_START));
      timeline.add(() => {
        document.getElementById('s6-curr-lang').innerText = "LANG_HI";
        document.getElementById('s6-text-query').innerText = `"मेरे सीने में दर्द है।"`;
        document.getElementById('s6-text-response').innerText = `"अति गंभीर हृदय लक्षण होने की संभावना है। कृपया तुरंत बैठ जाएं। संजीवनी आउटपोस्ट टीम रवाना हो चुकी है।"`;
        document.getElementById('s6-badge-en').className = "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400";
        document.getElementById('s6-badge-hi').className = "px-3 py-1 rounded-full bg-cyan-500 text-white shadow-sm border border-cyan-400";
      }, sec(S6_START + 5));
      playSfx('swoosh', sec(S6_START + 5.1));
      timeline.add(() => {
        document.getElementById('s6-curr-lang').innerText = "LANG_TA";
        document.getElementById('s6-text-query').innerText = `"எனக்கு நெஞ்சு வலி இருக்கிறது."`;
        document.getElementById('s6-text-response').innerText = `"கடுமையான இதய பாதிப்பு அறிகுறி இருக்கலாம். உடனே அமரவும். பாதுகாப்பு குழு வரவழைக்கப்படுகிறது."`;
        document.getElementById('s6-badge-hi').className = "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400";
        document.getElementById('s6-badge-ta').className = "px-3 py-1 rounded-full bg-cyan-500 text-white shadow-sm border border-cyan-400";
      }, sec(S6_START + 11));
      playSfx('swoosh', sec(S6_START + 11.1));
      timeline.add(() => {
        document.getElementById('s6-curr-lang').innerText = "LANG_BN";
        document.getElementById('s6-text-query').innerText = `"আমার বুকে ব্যথা করছে।"`;
        document.getElementById('s6-text-response').innerText = `"তীব্র কার্ডিয়াক লক্ষণ হতে পারে। অনুগ্রহ করে এখনই বসে পড়ুন। এমার্জেন্সি টিম পাঠানো হচ্ছে।"`;
        document.getElementById('s6-badge-ta').className = "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400";
        document.getElementById('s6-badge-bn').className = "px-3 py-1 rounded-full bg-cyan-500 text-white shadow-sm border border-cyan-400";
      }, sec(S6_START + 17));
      playSfx('swoosh', sec(S6_START + 17.1));
      timeline.to("#scene6", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S6_START + 24.5));

      const S7_START = 145;
      narrate("Built with robust and scalable developer tools: Node.js, TensorFlow Lite, Next.js, and local model caching.", sec(S7_START));
      playSfx('swoosh', sec(S7_START));
      timeline.add(() => { document.getElementById('status-title').innerText = "CORE ARCHITECTURE TELEMETRY"; }, sec(S7_START));
      timeline.to("#scene7", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S7_START));
      timeline.fromTo(".s7-node", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, stagger: sec(0.6), duration: sec(1.5), ease: "back.out(1.2)" }, sec(S7_START + 1));
      timeline.to("#scene7", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S7_START + 19.5));

      const S8_START = 165;
      narrate("Our platform brings measurable outcomes, decreasing response times and improving worker safety guidelines.", sec(S8_START));
      playSfx('swoosh', sec(S8_START));
      timeline.add(() => { document.getElementById('status-title').innerText = "PLATFORM IMPACT ANALYTICS"; }, sec(S8_START));
      timeline.to("#scene8", { opacity: 1, pointerEvents: "auto", duration: sec(0.8) }, sec(S8_START));
      timeline.fromTo("#s8-metric1", { textContent: "0%" }, { textContent: "70%", duration: sec(3.5), ease: "power1.out", snap: { textContent: 1 }, modifiers: { textContent: val => val + "%" } }, sec(S8_START + 1));
      timeline.fromTo("#s8-metric2", { textContent: "0%" }, { textContent: "100%", duration: sec(3.5), ease: "power1.out", snap: { textContent: 1 }, modifiers: { textContent: val => val + "%" } }, sec(S8_START + 1));
      timeline.fromTo("#s8-metric3", { textContent: "0%" }, { textContent: "99%", duration: sec(3.5), ease: "power1.out", snap: { textContent: 1 }, modifiers: { textContent: val => val + "%" } }, sec(S8_START + 1.2));
      timeline.fromTo("#s8-metric4", { textContent: "0%" }, { textContent: "85%", duration: sec(3.5), ease: "power1.out", snap: { textContent: 1 }, modifiers: { textContent: val => val + "%" } }, sec(S8_START + 1.2));
      timeline.to("#scene8", { opacity: 0, scale: 0.95, duration: sec(1) }, sec(S8_START + 14.5));

      const S9_START = 180;
      narrate("Sanjeevni AI. Intelligent Healthcare at the Edge. Thank you.", sec(S9_START));
      playSfx('heart', sec(S9_START));
      timeline.add(() => {
        document.getElementById('status-title').innerText = "DEMO COMPLETE";
        document.getElementById('status-dot').className = "w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]";
      }, sec(S9_START));
      timeline.to("#scene9", { opacity: 1, pointerEvents: "auto", duration: sec(1) }, sec(S9_START));
    }
  </script>
</body>
</html>
--- END OF index.html ---

------------------------------------------------------------------------
8. SERVER SOURCE CODE (server.js)
------------------------------------------------------------------------
Below is the pure Node.js HTTP server code that hosts 'index.html'. You 
can save this block as 'server.js' and run it using 'node server.js'.

--- START OF server.js ---
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading page: ' + err.code);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Sanjeevni Video Demo Server running at http://localhost:${PORT}`);
});
--- END OF server.js ---
========================================================================
