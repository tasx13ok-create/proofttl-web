import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-foundry-key",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function requiredAgents(taskType: string) {
  const map: Record<string, [string,string]> = {
    discovery: ["scout-a","scout-b"],
    validation: ["validator","scout-b"],
    strategy: ["strategist","finance"],
    build: ["builder-a","builder-b"],
    listing: ["sales","risk"],
    distribution: ["distribution","risk"],
    analytics: ["finance","risk"],
  };
  return map[taskType] ?? ["strategist","risk"];
}


function stripHtml(value: string) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function opportunityProfile(text: string) {
  const value = text.toLowerCase();
  const hardReject = /(firearm|ammunition|weapon|casino|gambl|porn|sex toy|spyware|malware|phishing|stolen|counterfeit|cannabis|marijuana|thc|cocaine|opioid|election campaign|political persuasion)/i.test(value);
  const highRisk = /(legal advice|lawsuit|medical|diagnos|prescription|tax advice|investment advice|securities|insurance claim)/i.test(value);
  const buyer = /(client|customer|business|company|team|agency|freelanc|founder|operator|shop|store|landlord|creator|developer)/i.test(value);
  const intent = /(looking for|recommend|need a|need an|need help|would pay|pay for|budget|buy|purchase|alternative to|replace|tool for|software for|service for)/i.test(value);
  const pain = /(manual|tedious|waste time|time-consuming|frustrat|pain|problem|broken|expensive|slow|annoy|struggl|difficult|hard to|can't find|cannot find)/i.test(value);
  const recurring = /(every day|every week|every month|repeated|recurring|each client|each customer|workflow|process|pipeline)/i.test(value);
  const vague = /(endgame|what do you think|thoughts on|future of|who is|why is everyone|general discussion|career advice|navigate career|job search|resume|outside tech|favorite hobby|what do you do outside|is there a market for)/i.test(value);

  let relevance = 0;
  if (buyer) relevance += 2;
  if (intent) relevance += 3;
  if (pain) relevance += 2;
  if (recurring) relevance += 1;
  if (vague) relevance -= 3;

  const commercialSignal = intent || (pain && recurring && buyer);
  return {
    reject: hardReject || vague || relevance < 2 || !commercialSignal,
    highRisk,
    buyer_intent: Math.max(1, Math.min(10, 4 + (buyer ? 2 : 0) + (intent ? 2 : 0) + (pain ? 1 : 0))),
    speed_to_launch: 8,
    monetization_ease: Math.max(3, Math.min(9, 5 + (intent ? 2 : 0) + (buyer ? 1 : 0))),
    competition: 6,
    margin: 9,
    compliance_risk: highRisk ? 9 : 3,
    maintenance_burden: recurring ? 4 : 3,
    distribution_difficulty: buyer ? 5 : 7,
    automation_potential: recurring ? 9 : 8,
    first_dollar_speed: Math.max(4, Math.min(9, 6 + (intent ? 2 : 0) + (pain ? 1 : 0))),
    intent,
    pain,
    recurring,
  };
}

async function discover(supabase: any) {
  const { count: backlog, error: backlogError } = await supabase
    .from("f10_tasks")
    .select("id", { count: "exact", head: true })
    .in("state", ["queued","claimed","researching","validating","building","reviewing","launching","tracking","scaling"]);
  if (backlogError) throw backlogError;
  if (Number(backlog || 0) >= 12) {
    return { insertedSignals: 0, insertedExperiments: 0, rejected: 0, skipped: "backlog_cap", backlog: Number(backlog || 0) };
  }

  const sources = [
    {
      source_type: "hackernews_ask",
      url: "https://hn.algolia.com/api/v1/search_by_date?tags=ask_hn&hitsPerPage=30",
    },
  ];

  let insertedSignals = 0;
  let insertedExperiments = 0;
  let rejected = 0;
  const maxNewExperiments = 3;

  for (const source of sources) {
    const response = await fetch(source.url, {
      headers: { accept: "application/json", "user-agent": "FOUNDRY-10/1" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("discovery source HTTP " + response.status);
    const body = await response.json();
    const hits = Array.isArray(body?.hits) ? body.hits : [];

    for (const hit of hits) {
      if (insertedExperiments >= maxNewExperiments) break;
      const externalId = String(hit?.objectID || "").trim();
      const title = stripHtml(String(hit?.title || hit?.story_title || ""));
      if (!externalId || !title) continue;
      const excerpt = stripHtml(String(hit?.story_text || hit?.comment_text || "")).slice(0, 1200);
      const profile = opportunityProfile(title + " " + excerpt);
      if (profile.reject) {
        rejected += 1;
        continue;
      }

      let { data: signal, error: signalReadError } = await supabase
        .from("f10_signals")
        .select("id")
        .eq("source_type", source.source_type)
        .eq("external_id", externalId)
        .maybeSingle();
      if (signalReadError) throw signalReadError;

      if (!signal) {
        const { data: createdSignal, error: signalInsertError } = await supabase
          .from("f10_signals")
          .insert({
            source_type: source.source_type,
            external_id: externalId,
            url: "https://news.ycombinator.com/item?id=" + externalId,
            title,
            excerpt,
            author: hit?.author ? String(hit.author) : null,
            observed_at: hit?.created_at || new Date().toISOString(),
            payload: {
              points: Number(hit?.points || 0),
              num_comments: Number(hit?.num_comments || 0),
              source_query: source.url,
            },
          })
          .select("id")
          .single();
        if (signalInsertError) throw signalInsertError;
        signal = createdSignal;
        insertedSignals += 1;
      }

      const { data: existingExperiment, error: expReadError } = await supabase
        .from("f10_experiments")
        .select("id")
        .eq("source_signal_id", signal.id)
        .maybeSingle();
      if (expReadError) throw expReadError;
      if (existingExperiment) continue;

      const slug = "hn-" + externalId;
      const whyPay = profile.intent
        ? "The source contains direct solution-seeking language; payment intent is still unproven and must pass validation."
        : "The source shows concrete operational pain; willingness to pay is unproven and must pass validation.";

      const { data: experiment, error: experimentError } = await supabase
        .from("f10_experiments")
        .insert({
          slug,
          title: title.slice(0, 180),
          description: excerpt || "Public Ask HN demand signal. FOUNDRY-10 has not yet validated willingness to pay.",
          target_buyer: "Operators adjacent to the public problem signal",
          why_pay: whyPay,
          monetization_method: "small paid experiment to be designed after validation",
          estimated_build_minutes: profile.highRisk ? 240 : 90,
          estimated_margin_pct: 95,
          status: "idea",
          risk_notes: profile.highRisk
            ? "Regulated/high-consequence domain detected. Human approval required and automated launch is blocked."
            : "Public signal only. Do not treat the post as proof of buyer demand or payment intent.",
          buyer_intent: profile.buyer_intent,
          speed_to_launch: profile.speed_to_launch,
          monetization_ease: profile.monetization_ease,
          competition: profile.competition,
          margin: profile.margin,
          compliance_risk: profile.compliance_risk,
          maintenance_burden: profile.maintenance_burden,
          distribution_difficulty: profile.distribution_difficulty,
          automation_potential: profile.automation_potential,
          first_dollar_speed: profile.first_dollar_speed,
          source_signal_id: signal.id,
        })
        .select("id,score")
        .single();
      if (experimentError) throw experimentError;

      await supabase.from("f10_tasks").insert({
        experiment_id: experiment.id,
        title: "Validate live demand signal: " + title.slice(0, 140),
        task_type: "validation",
        state: "queued",
        priority: Number(experiment.score) >= 70 ? 9 : 7,
        important: true,
        required_touches: 2,
        input: {
          source_signal_id: signal.id,
          source_type: source.source_type,
          source_url: "https://news.ycombinator.com/item?id=" + externalId,
          source_title: title,
          payment_intent_proven: false,
        },
      });
      insertedExperiments += 1;
    }
  }

  return { insertedSignals, insertedExperiments, rejected };
}

function nextTaskSpec(taskType: string) {
  const map: Record<string, { type: string; title: string; priority: number } | null> = {
    validation: { type: "strategy", title: "Design smallest monetizable experiment", priority: 8 },
    strategy: { type: "build", title: "Build minimum sellable product", priority: 8 },
    build: { type: "listing", title: "Prepare truthful offer, price, and launch package", priority: 8 },
    listing: null,
    distribution: { type: "analytics", title: "Track traffic, conversions, revenue, and cost", priority: 6 },
    analytics: null,
  };
  return map[taskType] ?? null;
}

async function enqueueNextTask(supabase: any, exp: any, currentTask: any) {
  const spec = nextTaskSpec(currentTask.task_type);
  if (!spec) return null;

  const { data: existing, error: existingError } = await supabase
    .from("f10_tasks")
    .select("id")
    .eq("experiment_id", exp.id)
    .eq("task_type", spec.type)
    .neq("state", "killed")
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing.id;

  const { data: created, error } = await supabase.from("f10_tasks").insert({
    experiment_id: exp.id,
    title: spec.title + ": " + exp.title,
    task_type: spec.type,
    state: "queued",
    priority: spec.priority,
    important: true,
    required_touches: 2,
    input: { parent_task_id: currentTask.id, score: exp.score, price_cents: exp.price_cents }
  }).select("id").single();
  if (error) throw error;
  return created.id;
}


function chooseOfferFormat(exp: any, signal: any) {
  const text = (String(exp?.title || "") + " " + String(exp?.description || "") + " " + String(signal?.title || "")).toLowerCase();
  if (/(price|quote|rate|margin|cost|budget)/.test(text)) return "calculator";
  if (/(template|wording|email|message|copy|faq)/.test(text)) return "template-pack";
  if (/(audit|review|check|verify|log|security|compliance)/.test(text)) return "review-checklist";
  if (/(sync|migrate|setup|workflow|process)/.test(text)) return "workflow-kit";
  return "focused-checklist";
}

async function createStageArtifact(supabase: any, task: any, exp: any, signal: any, creatorId: string) {
  if (!["strategy","build","listing","distribution","analytics"].includes(task.task_type)) return null;

  const { data: existing, error: existingError } = await supabase
    .from("f10_artifacts")
    .select("*")
    .eq("task_id", task.id)
    .eq("artifact_type", task.task_type === "build" ? "product" : task.task_type)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;

  const format = chooseOfferFormat(exp, signal);
  const sourceUrl = signal?.url || task?.input?.source_url || null;
  const sourceTitle = signal?.title || task?.input?.source_title || null;
  let artifactType = task.task_type === "build" ? "product" : task.task_type;
  let content: any = {};

  if (task.task_type === "strategy") {
    content = {
      buyer: exp.target_buyer,
      problem: exp.description,
      source_title: sourceTitle,
      source_url: sourceUrl,
      evidence_status: signal ? "public_problem_signal_only" : "seeded_hypothesis",
      offer_format: format,
      smallest_sellable_outcome: "Deliver one narrow, inspectable result tied to the stated problem without claiming demand is proven.",
      price_hypothesis_cents: exp.price_cents || 500,
      assumptions_to_test: [
        "The target user has this problem often enough to care.",
        "The proposed artifact saves enough time or risk to justify payment.",
        "The buyer can understand the value without custom onboarding.",
      ],
      kill_conditions: [
        "No direct buyer-intent signal after validation.",
        "Delivery requires regulated professional judgment.",
        "Support burden exceeds the low-ticket economics.",
      ],
    };
  } else if (task.task_type === "build") {
    content = {
      product_name: exp.title,
      format,
      version: "v1",
      buyer: exp.target_buyer,
      source_title: sourceTitle,
      what_you_get: [
        "A concise problem-to-action worksheet tied to the validated source signal.",
        "A step-by-step execution checklist that separates known facts from assumptions.",
        "A failure-mode section showing when the workflow should stop or escalate.",
        "A reusable output template so the buyer can repeat the process without rebuilding it.",
      ],
      how_to_use: [
        "Write the concrete outcome you need.",
        "Fill only facts you can support; mark unknowns explicitly.",
        "Run each checklist item in order and record blockers.",
        "Use the failure-mode gate before relying on the output.",
        "Save the completed record for repeat use or human review.",
      ],
      quality_gates: [
        "No invented customer facts.",
        "No legal, medical, financial, or safety conclusions.",
        "No guarantee of revenue, ranking, accuracy, or platform approval.",
        "Every unresolved assumption remains visible.",
      ],
      fulfillment_note: "Draft artifact. It is not public and not purchasable until operator approval and a real checkout are attached.",
    };
  } else if (task.task_type === "listing") {
    content = {
      headline: exp.title,
      subheadline: "A narrow self-serve tool for a concrete workflow problem — with assumptions and limits kept visible.",
      buyer: exp.target_buyer,
      price_cents: exp.price_cents || 500,
      bullets: [
        "Built for one specific outcome instead of a broad all-in-one promise.",
        "Includes a repeatable checklist/template and explicit stop conditions.",
        "Designed for fast self-serve use with no fabricated proof or guaranteed result.",
      ],
      source_disclosure: signal
        ? "Inspired by a public problem signal. That signal is not proof of market size or willingness to pay."
        : "Seeded internal hypothesis. Buyer demand must be validated separately.",
      checkout_url: exp.checkout_url || null,
      launch_state: exp.checkout_url ? "checkout_attached" : "needs_checkout",
      approval_required: true,
    };
  } else if (task.task_type === "distribution") {
    content = {
      allowed_channels: [
        "Owned landing page / SEO",
        "Public educational posts that disclose what the product does",
        "Replies only where someone explicitly asks for a relevant solution",
      ],
      blocked_channels: [
        "Mass unsolicited DMs or email",
        "Fake testimonials, fake users, or invented traction",
        "Platform automation that violates rate limits or terms",
      ],
      source_community: signal?.source_type || null,
      source_url: sourceUrl,
      first_test: "Use one high-signal public explanation with a direct product link; measure clicks and paid conversions before expanding.",
      success_metric: "realized_paid_checkout",
    };
  } else if (task.task_type === "analytics") {
    const clicks = Number(exp.clicks || 0);
    const conversions = Number(exp.conversions || 0);
    const revenue = Number(exp.revenue_cents || 0);
    const cost = Number(exp.cost_cents || 0);
    content = {
      clicks,
      conversions,
      conversion_rate: clicks > 0 ? conversions / clicks : 0,
      revenue_cents: revenue,
      cost_cents: cost,
      net_profit_cents: revenue - cost,
      decision: revenue > cost && conversions > 0 ? "continue_or_scale_cautiously" : "hold_or_retest",
      note: "Only realized economics count. Missing traffic data is not treated as zero buyer interest.",
    };
  }

  const { data: created, error } = await supabase
    .from("f10_artifacts")
    .insert({
      experiment_id: exp.id,
      task_id: task.id,
      artifact_type: artifactType,
      status: "draft",
      created_by_agent_id: creatorId,
      content,
    })
    .select("*")
    .single();
  if (error) throw error;
  return created;
}

function deterministicReview(task: any, exp: any, reviewerSlug: string, signal: any = null, artifact: any = null) {
  const score = Number(exp?.score ?? task?.input?.score ?? 0);
  const highRisk = Number(exp?.compliance_risk ?? 0) >= 7;
  const weak = score < 58;
  const strictReviewer = reviewerSlug === "scout-b" || reviewerSlug === "risk" || reviewerSlug === "finance";
  const isValidation = task?.task_type === "validation";
  const sourceProfile = signal ? opportunityProfile(String(signal.title || "") + " " + String(signal.excerpt || "")) : null;
  const sourceRejected = Boolean(isValidation && sourceProfile?.reject);
  const artifactRequired = ["strategy","build","listing","distribution","analytics"].includes(task?.task_type);
  const missingArtifact = artifactRequired && !artifact;
  const missingPrice = task?.task_type === "listing" && Number(exp?.price_cents || 0) <= 0;
  const weakCommercialProof = Boolean(
    isValidation &&
    signal &&
    strictReviewer &&
    !sourceProfile?.intent &&
    !(sourceProfile?.pain && sourceProfile?.recurring)
  );

  const decision = highRisk
    ? "escalate"
    : (weak || sourceRejected || weakCommercialProof || missingArtifact || missingPrice)
    ? "reject"
    : "advance";

  const rationale = highRisk
    ? "Compliance risk requires operator review before launch."
    : sourceRejected
    ? "The live source does not clear FOUNDRY-10's commercial-signal floor."
    : weakCommercialProof
    ? "Independent reviewer found pain but not enough direct or recurring commercial intent."
    : missingArtifact
    ? "Required stage artifact was not produced."
    : missingPrice
    ? "Listing cannot advance without a positive price hypothesis."
    : weak
    ? "Weighted opportunity score is below the current experiment threshold."
    : "Opportunity clears the weighted score, artifact, and independent commercial-signal gates.";

  return {
    reviewer: reviewerSlug,
    provider: "deterministic-v2",
    decision,
    rationale,
    score,
    source_signal_id: signal?.id || null,
    artifact_id: artifact?.id || null,
    checked_at: new Date().toISOString(),
  };
}

async function ownerAuth(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  if (!cookie) return false;
  try {
    const response = await fetch("https://proofttl.tasx13ok.workers.dev/owner/overview", {
      method: "GET",
      headers: {
        cookie,
        accept: "application/json",
        "user-agent": "foundry10-edge/1",
      },
      redirect: "manual",
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function auth(req: Request, supabase: any) {
  const key = req.headers.get("x-foundry-key") ?? "";
  if (key) {
    const hash = await sha256(key);
    const { data, error } = await supabase.rpc("f10_operator_key_valid", { p_hash: hash });
    if (!error && data === true) return true;
  }
  return ownerAuth(req);
}

async function loadState(supabase: any) {
  const [agents, tasks, experiments, approvals, settings, recentEvents, recentSignals, recentArtifacts] = await Promise.all([
    supabase.from("f10_agents").select("*").order("name"),
    supabase.from("f10_tasks").select("*").order("priority", { ascending: false }).order("created_at"),
    supabase.from("f10_experiments").select("*").order("score", { ascending: false }),
    supabase.from("f10_approvals").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("f10_settings").select("paused,spending_cap_cents,revenue_goal_cents,risk_tolerance,earned_revenue_cents,total_cost_cents,reinvestment_cap_cents,updated_at").eq("id", true).single(),
    supabase.from("f10_events").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("f10_signals").select("*").order("observed_at", { ascending: false }).limit(50),
    supabase.from("f10_artifacts").select("*").order("created_at", { ascending: false }).limit(50),
  ]);
  for (const r of [agents,tasks,experiments,approvals,settings,recentEvents,recentSignals,recentArtifacts]) {
    if (r.error) throw r.error;
  }
  return {
    agents: agents.data,
    tasks: tasks.data,
    experiments: experiments.data,
    approvals: approvals.data,
    settings: settings.data,
    recentEvents: recentEvents.data,
    recentSignals: recentSignals.data,
    recentArtifacts: recentArtifacts.data,
  };
}

async function tick(supabase: any) {
  const { data: settings, error: settingsError } = await supabase
    .from("f10_settings").select("*").eq("id", true).single();
  if (settingsError) throw settingsError;
  if (settings.paused) return { action: "paused" };

  const { data: task, error: taskError } = await supabase
    .from("f10_tasks")
    .select("*")
    .eq("state", "queued")
    .order("priority", { ascending: false })
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (taskError) throw taskError;
  if (!task) return { action: "idle", reason: "no queued tasks" };

  const { data: exp, error: expError } = await supabase
    .from("f10_experiments").select("*").eq("id", task.experiment_id).single();
  if (expError) throw expError;

  let signal = null;
  if (exp.source_signal_id) {
    const { data: signalRow, error: signalError } = await supabase
      .from("f10_signals").select("*").eq("id", exp.source_signal_id).maybeSingle();
    if (signalError) throw signalError;
    signal = signalRow;
  }

  const [primarySlug, secondarySlug] = requiredAgents(task.task_type);
  const { data: agentRows, error: agentError } = await supabase
    .from("f10_agents").select("*").in("slug", [primarySlug, secondarySlug]);
  if (agentError) throw agentError;

  const primary = agentRows.find((a:any) => a.slug === primarySlug);
  const secondary = agentRows.find((a:any) => a.slug === secondarySlug);
  if (!primary || !secondary) throw new Error("required agents missing");

  await supabase.from("f10_tasks").update({
    state: "validating",
    claimed_by: primary.id,
    reviewer_id: task.important ? secondary.id : null,
    attempts: task.attempts + 1,
    updated_at: new Date().toISOString(),
  }).eq("id", task.id);

  await supabase.from("f10_agents").update({
    status: "busy", current_task_id: task.id, last_action: "claimed " + task.title, updated_at: new Date().toISOString()
  }).eq("id", primary.id);

  const artifact = await createStageArtifact(supabase, task, exp, signal, primary.id);
  const first = deterministicReview(task, exp, primary.slug, signal, artifact);
  const second = task.important ? deterministicReview(task, exp, secondary.slug, signal, artifact) : null;
  const decisions = [first, second].filter(Boolean) as any[];
  const finalDecision = decisions.some((d) => d.decision === "escalate")
    ? "escalate"
    : decisions.some((d) => d.decision === "reject")
    ? "reject"
    : "advance";

  let nextTaskState = "done";
  let nextExperimentStatus = exp.status;
  let approvalCreated = false;

  if (finalDecision === "escalate") {
    nextTaskState = "reviewing";
    const { data: existing } = await supabase.from("f10_approvals")
      .select("id").eq("task_id", task.id).eq("status", "pending").maybeSingle();
    if (!existing) {
      await supabase.from("f10_approvals").insert({
        task_id: task.id,
        experiment_id: exp.id,
        approval_type: "launch",
        request_payload: { reason: "compliance escalation", decisions }
      });
      approvalCreated = true;
    }
  } else if (finalDecision === "reject") {
    nextTaskState = "killed";
    nextExperimentStatus = "killed";
    await supabase.from("f10_experiments").update({
      status: "killed",
      kill_reason: "Failed deterministic two-agent validation gate",
      updated_at: new Date().toISOString()
    }).eq("id", exp.id);
  } else {
    const statusByTask: Record<string,string> = {
      validation: "queued",
      strategy: "building",
      build: "reviewing",
      distribution: "tracking",
      analytics: "tracking"
    };
    nextExperimentStatus = statusByTask[task.task_type] ?? exp.status;
    if (task.task_type === "analytics" && artifact?.content) {
      const revenue = Number(artifact.content.revenue_cents || 0);
      const cost = Number(artifact.content.cost_cents || 0);
      const conversions = Number(artifact.content.conversions || 0);
      nextExperimentStatus = conversions > 0 && revenue > cost ? "scaling" : "tracking";
    }

    if (task.task_type === "listing") {
      nextTaskState = "reviewing";
      nextExperimentStatus = "reviewing";
      const { data: existingApproval } = await supabase.from("f10_approvals")
        .select("id").eq("task_id", task.id).eq("status", "pending").maybeSingle();
      if (!existingApproval) {
        await supabase.from("f10_approvals").insert({
          task_id: task.id,
          experiment_id: exp.id,
          approval_type: "public_listing",
          request_payload: {
            title: exp.title,
            price_cents: exp.price_cents,
            monetization_method: exp.monetization_method,
            note: "Approval accepts the drafted public offer. Payment-link creation remains a separate approval."
          }
        });
        approvalCreated = true;
      }
    } else if (task.task_type === "distribution") {
      nextTaskState = "reviewing";
      nextExperimentStatus = ["launched","tracking","scaling"].includes(exp.status) ? exp.status : "tracking";
      const { data: existingApproval } = await supabase.from("f10_approvals")
        .select("id").eq("task_id", task.id).eq("status", "pending").maybeSingle();
      if (!existingApproval) {
        await supabase.from("f10_approvals").insert({
          task_id: task.id,
          experiment_id: exp.id,
          approval_type: "outbound_message",
          request_payload: {
            title: exp.title,
            checkout_url: exp.checkout_url,
            artifact_id: artifact?.id || null,
            note: "Approval authorizes one compliant distribution test only. It does not authorize spam, bulk DMs, or fake engagement."
          }
        });
        approvalCreated = true;
      }
    } else {
      await enqueueNextTask(supabase, exp, task);
    }

    await supabase.from("f10_experiments").update({
      status: nextExperimentStatus,
      updated_at: new Date().toISOString()
    }).eq("id", exp.id);
  }

  if (artifact && finalDecision === "advance") {
    await supabase.from("f10_artifacts").update({
      status: (task.task_type === "listing" || task.task_type === "distribution") ? "reviewed" : "approved",
      reviewed_by_agent_id: task.important ? secondary.id : primary.id,
      updated_at: new Date().toISOString()
    }).eq("id", artifact.id);
  }

  await supabase.from("f10_tasks").update({
    state: nextTaskState,
    touch_count: task.important ? 2 : 1,
    output: { decisions, final_decision: finalDecision, artifact_id: artifact?.id || null },
    confidence: Math.min(...decisions.map((d) => d.score / 100)),
    completed_at: nextTaskState === "done" || nextTaskState === "killed" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("id", task.id);

  await supabase.from("f10_agents").update({
    status: "idle", current_task_id: null, last_action: "completed " + task.title, updated_at: new Date().toISOString()
  }).in("id", [primary.id, ...(task.important ? [secondary.id] : [])]);

  await supabase.from("f10_events").insert([
    {
      experiment_id: exp.id, task_id: task.id, agent_id: primary.id,
      event_type: "agent_touch", payload: first
    },
    ...(second ? [{
      experiment_id: exp.id, task_id: task.id, agent_id: secondary.id,
      event_type: "agent_touch", payload: second
    }] : []),
    {
      experiment_id: exp.id, task_id: task.id,
      event_type: "task_decision", payload: { finalDecision, approvalCreated }
    }
  ]);

  await supabase.rpc("f10_refresh_governor");
  return { action: "processed", task_id: task.id, experiment_id: exp.id, finalDecision, approvalCreated };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const url = new URL(req.url);
    const marker = "/foundry10-api";
    const markerIndex = url.pathname.indexOf(marker);
    const path = markerIndex >= 0 ? (url.pathname.slice(markerIndex + marker.length) || "/") : url.pathname;

    if (req.method === "GET" && path === "/health") {
      return json({ ok: true, service: "foundry10-api", version: 12 });
    }

    if (req.method === "GET" && path.startsWith("/public-offer/")) {
      const slug = path.slice("/public-offer/".length);
      if (!/^[a-z0-9-]{3,120}$/.test(slug)) return json({ error: "not found" }, 404);

      const { data: exp, error: expError } = await supabase
        .from("f10_experiments")
        .select("id,slug,title,description,target_buyer,why_pay,monetization_method,status,price_cents,checkout_url")
        .eq("slug", slug)
        .in("status", ["launched","tracking","scaling"])
        .not("checkout_url", "is", null)
        .maybeSingle();
      if (expError) throw expError;
      if (!exp) return json({ error: "not found" }, 404);

      const { data: artifacts, error: artifactError } = await supabase
        .from("f10_artifacts")
        .select("artifact_type,status,content,created_at")
        .eq("experiment_id", exp.id)
        .in("artifact_type", ["listing","product"])
        .in("status", ["approved","reviewed"])
        .order("created_at", { ascending: false });
      if (artifactError) throw artifactError;

      const listing = artifacts?.find((a:any) => a.artifact_type === "listing")?.content || null;
      const product = artifacts?.find((a:any) => a.artifact_type === "product")?.content || null;

      return json({
        offer: {
          slug: exp.slug,
          title: exp.title,
          description: exp.description,
          target_buyer: exp.target_buyer,
          why_pay: exp.why_pay,
          monetization_method: exp.monetization_method,
          price_cents: exp.price_cents,
          checkout_url: exp.checkout_url,
          listing,
          product,
        }
      });
    }

    if (req.method === "GET" && path.startsWith("/delivery/")) {
      const slug = path.slice("/delivery/".length);
      const token = url.searchParams.get("access") || "";
      if (!/^[a-z0-9-]{3,120}$/.test(slug) || token.length < 32 || token.length > 256) {
        return json({ error: "not found" }, 404);
      }

      const tokenHash = await sha256(token);
      const { data: exp, error: expError } = await supabase
        .from("f10_experiments")
        .select("id,slug,title,status,delivery_token_hash,checkout_url")
        .eq("slug", slug)
        .in("status", ["launched","tracking","scaling"])
        .not("checkout_url", "is", null)
        .maybeSingle();
      if (expError) throw expError;
      if (!exp || !exp.delivery_token_hash || exp.delivery_token_hash !== tokenHash) {
        return json({ error: "not found" }, 404);
      }

      const { data: artifact, error: artifactError } = await supabase
        .from("f10_artifacts")
        .select("content,created_at")
        .eq("experiment_id", exp.id)
        .eq("artifact_type", "product")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (artifactError) throw artifactError;
      if (!artifact) return json({ error: "not found" }, 404);

      return json({
        product: {
          slug: exp.slug,
          title: exp.title,
          content: artifact.content,
          delivered_at: new Date().toISOString(),
        }
      });
    }

    if (req.method === "POST" && path === "/scheduled-tick") {
      const { data: claimed, error: claimError } = await supabase.rpc("f10_scheduler_claim");
      if (claimError) throw claimError;
      if (!claimed) return json({ ok: true, action: "rate_limited" });

      let discovery = { action: "skipped" } as any;
      const { data: discoveryClaimed, error: discoveryClaimError } = await supabase.rpc("f10_discovery_claim");
      if (discoveryClaimError) throw discoveryClaimError;
      if (discoveryClaimed) discovery = { action: "ran", ...(await discover(supabase)) };

      return json({ ok: true, discovery, result: await tick(supabase) });
    }

    if (!(await auth(req, supabase))) return json({ error: "unauthorized" }, 401);

    if (req.method === "POST" && path === "/discover") {
      return json({ ok: true, result: await discover(supabase) });
    }

    if (req.method === "GET" && path === "/state") {
      return json(await loadState(supabase));
    }

    if (req.method === "POST" && path === "/tick") {
      return json(await tick(supabase));
    }

    if (req.method === "POST" && path === "/controls") {
      const body = await req.json();
      const allowed = ["paused","spending_cap_cents","revenue_goal_cents","risk_tolerance"];
      const patch: Record<string,unknown> = {};
      for (const key of allowed) if (key in body) patch[key] = body[key];
      patch.updated_at = new Date().toISOString();
      const { data, error } = await supabase.from("f10_settings").update(patch).eq("id", true).select().single();
      if (error) throw error;
      return json({ ok: true, settings: data });
    }

    if (req.method === "POST" && path.startsWith("/approval/")) {
      const id = path.split("/").pop()!;
      const body = await req.json();
      if (!["approved","rejected"].includes(body.status)) return json({ error: "invalid approval status" }, 400);
      const { data: approval, error: aerr } = await supabase.from("f10_approvals")
        .update({ status: body.status, decision_note: body.note ?? null, decided_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (aerr) throw aerr;

      if (approval.task_id) {
        const { data: task, error: taskErr } = await supabase.from("f10_tasks")
          .select("*").eq("id", approval.task_id).single();
        if (taskErr) throw taskErr;

        await supabase.from("f10_tasks").update({
          state: body.status === "approved" ? "done" : "killed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq("id", approval.task_id);

        if (body.status === "approved" && task.task_type === "listing") {
          const { data: exp, error: expErr } = await supabase.from("f10_experiments")
            .select("*").eq("id", approval.experiment_id).single();
          if (expErr) throw expErr;
          await supabase.from("f10_experiments").update({
            status: "approved", updated_at: new Date().toISOString()
          }).eq("id", approval.experiment_id);
          await supabase.from("f10_artifacts").update({
            status: "approved", updated_at: new Date().toISOString()
          }).eq("task_id", task.id).eq("artifact_type", "listing");

          const { data: existingPaymentApproval } = await supabase.from("f10_approvals")
            .select("id").eq("experiment_id", approval.experiment_id)
            .eq("approval_type", "payment_link")
            .in("status", ["pending","approved"]).limit(1).maybeSingle();
          if (!existingPaymentApproval) {
            await supabase.from("f10_approvals").insert({
              experiment_id: approval.experiment_id,
              approval_type: "payment_link",
              request_payload: {
                title: exp.title,
                price_cents: exp.price_cents,
                listing_task_id: task.id,
                note: "Approval authorizes creation of one Stripe Payment Link and buyer delivery token for this experiment."
              }
            });
          }
        }

        if (body.status === "approved" && task.task_type === "distribution") {
          const { data: exp, error: expErr } = await supabase.from("f10_experiments")
            .select("*").eq("id", approval.experiment_id).single();
          if (expErr) throw expErr;
          await supabase.from("f10_artifacts").update({
            status: "approved", updated_at: new Date().toISOString()
          }).eq("task_id", task.id).eq("artifact_type", "distribution");
          await supabase.from("f10_experiments").update({
            status: "tracking", updated_at: new Date().toISOString()
          }).eq("id", approval.experiment_id);

          const { data: existingAnalytics } = await supabase.from("f10_tasks")
            .select("id").eq("experiment_id", approval.experiment_id)
            .eq("task_type", "analytics").neq("state", "killed").limit(1).maybeSingle();
          if (!existingAnalytics) {
            await supabase.from("f10_tasks").insert({
              experiment_id: approval.experiment_id,
              title: "Track traffic, conversions, revenue, and cost: " + exp.title,
              task_type: "analytics",
              state: "queued",
              priority: 6,
              important: true,
              required_touches: 2,
              input: { approved_distribution_task_id: task.id }
            });
          }
        }

        if (body.status === "rejected" && approval.experiment_id) {
          if (approval.approval_type === "outbound_message") {
            await supabase.from("f10_experiments").update({
              status: "launched",
              updated_at: new Date().toISOString()
            }).eq("id", approval.experiment_id);
            await supabase.from("f10_events").insert({
              experiment_id: approval.experiment_id,
              task_id: task.id,
              event_type: "distribution_rejected",
              payload: { approval_id: approval.id, note: body.note ?? null }
            });
          } else {
            await supabase.from("f10_experiments").update({
              status: "killed",
              kill_reason: "Operator rejected required approval",
              updated_at: new Date().toISOString()
            }).eq("id", approval.experiment_id);
          }
        }
      }

      if (!approval.task_id && body.status === "rejected" && approval.experiment_id && approval.approval_type === "payment_link") {
        await supabase.from("f10_experiments").update({
          status: "killed",
          kill_reason: "Operator rejected payment-link creation",
          updated_at: new Date().toISOString()
        }).eq("id", approval.experiment_id);
      }

      await supabase.from("f10_events").insert({
        experiment_id: approval.experiment_id,
        task_id: approval.task_id,
        event_type: "approval_decision",
        payload: {
          approval_id: approval.id,
          approval_type: approval.approval_type,
          status: body.status,
          note: body.note ?? null
        }
      });
      return json({ ok: true, approval });
    }

    if (req.method === "POST" && path === "/revenue") {
      const body = await req.json();
      const amount = Math.trunc(Number(body.revenue_cents ?? 0));
      const cost = Math.trunc(Number(body.cost_cents ?? 0));
      if (!body.experiment_id || !Number.isFinite(amount) || !Number.isFinite(cost) || amount < 0 || cost < 0) {
        return json({ error: "experiment_id and non-negative revenue_cents/cost_cents required" }, 400);
      }
      const { data: exp, error: expError } = await supabase.from("f10_experiments")
        .select("*").eq("id", body.experiment_id).single();
      if (expError) throw expError;

      await supabase.from("f10_events").insert({
        experiment_id: body.experiment_id,
        event_type: "realized_economics",
        channel: body.channel ?? "operator",
        revenue_cents: amount,
        cost_cents: cost,
        payload: { note: body.note ?? null, external_reference: body.external_reference ?? null }
      });

      await supabase.from("f10_experiments").update({
        revenue_cents: Number(exp.revenue_cents || 0) + amount,
        cost_cents: Number(exp.cost_cents || 0) + cost,
        conversions: Number(exp.conversions || 0) + (amount > 0 ? 1 : 0),
        updated_at: new Date().toISOString()
      }).eq("id", body.experiment_id);

      await supabase.rpc("f10_refresh_governor");
      return json({ ok: true });
    }

    if (req.method === "POST" && path.startsWith("/experiment/") && path.endsWith("/checkout")) {
      const id = path.split("/")[2];
      const body = await req.json();
      const checkoutUrl = String(body.checkout_url || "").trim();
      let parsed: URL;
      try { parsed = new URL(checkoutUrl); } catch { return json({ error: "invalid checkout URL" }, 400); }
      if (parsed.protocol !== "https:" || parsed.hostname !== "buy.stripe.com") {
        return json({ error: "checkout must be an https://buy.stripe.com URL" }, 400);
      }

      const { data: exp, error: expError } = await supabase.from("f10_experiments")
        .select("*").eq("id", id).single();
      if (expError) throw expError;
      if (!["approved","launched","tracking"].includes(exp.status)) {
        return json({ error: "experiment requires approved listing before checkout attachment" }, 409);
      }

      const { data: paymentApproval, error: paymentApprovalError } = await supabase.from("f10_approvals")
        .select("id").eq("experiment_id", id).eq("approval_type", "payment_link")
        .eq("status", "approved").limit(1).maybeSingle();
      if (paymentApprovalError) throw paymentApprovalError;
      if (!paymentApproval) return json({ error: "approved payment-link approval required" }, 409);

      const priceCents = body.price_cents == null ? Number(exp.price_cents || 0) : Math.trunc(Number(body.price_cents));
      if (!Number.isFinite(priceCents) || priceCents <= 0) return json({ error: "positive price_cents required" }, 400);

      const patch: any = {
        checkout_url: checkoutUrl,
        price_cents: priceCents,
        status: "launched",
        updated_at: new Date().toISOString()
      };
      if (typeof body.stripe_product_id === "string") patch.stripe_product_id = body.stripe_product_id;
      if (typeof body.stripe_price_id === "string") patch.stripe_price_id = body.stripe_price_id;
      if (typeof body.stripe_payment_link_id === "string") patch.stripe_payment_link_id = body.stripe_payment_link_id;
      if (typeof body.delivery_token_hash === "string") patch.delivery_token_hash = body.delivery_token_hash;

      const { data, error } = await supabase.from("f10_experiments").update(patch)
        .eq("id", id).select().single();
      if (error) throw error;

      await supabase.from("f10_events").insert({
        experiment_id: id,
        event_type: "checkout_attached",
        channel: "stripe_payment_link",
        payload: {
          checkout_url: checkoutUrl,
          price_cents: priceCents,
          stripe_product_id: patch.stripe_product_id ?? null,
          stripe_price_id: patch.stripe_price_id ?? null,
          stripe_payment_link_id: patch.stripe_payment_link_id ?? null,
          payment_approval_id: paymentApproval.id
        }
      });

      const { data: existingDistribution } = await supabase.from("f10_tasks")
        .select("id").eq("experiment_id", id).eq("task_type", "distribution")
        .neq("state", "killed").limit(1).maybeSingle();
      if (!existingDistribution) {
        await supabase.from("f10_tasks").insert({
          experiment_id: id,
          title: "Plan compliant distribution: " + exp.title,
          task_type: "distribution",
          state: "queued",
          priority: 7,
          important: true,
          required_touches: 2,
          input: { payment_approval_id: paymentApproval.id, checkout_url: checkoutUrl }
        });
      }

      return json({
        ok: true,
        experiment: data,
        public_path: "/foundry-offer/" + data.slug,
        delivery_path: data.delivery_token_hash ? "/foundry-delivery/" : null
      });
    }

    if (req.method === "POST" && path.startsWith("/experiment/") && path.endsWith("/kill")) {
      const id = path.split("/")[2];
      const body = await req.json().catch(() => ({}));
      const { data, error } = await supabase.from("f10_experiments").update({
        status: "killed",
        kill_reason: body.reason ?? "Killed by operator",
        updated_at: new Date().toISOString()
      }).eq("id", id).select().single();
      if (error) throw error;
      await supabase.from("f10_tasks").update({ state: "killed", updated_at: new Date().toISOString() })
        .eq("experiment_id", id).not("state", "in", "(done,killed)");
      return json({ ok: true, experiment: data });
    }

    return json({ error: "not found" }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
