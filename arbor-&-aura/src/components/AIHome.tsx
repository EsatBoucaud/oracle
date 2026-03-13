import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, MessageSquareText, Sparkles } from 'lucide-react';
import { ArborNode } from '../types';

interface AIHomeProps {
  nodes: ArborNode[];
  onSelectRoot: (id: string) => void;
  onCreateRoot: (data: Partial<ArborNode>) => void;
}

type PromptResult =
  | {
      kind: 'select';
      message: string;
      target: ArborNode;
      matches: ArborNode[];
    }
  | {
      kind: 'create';
      message: string;
      payload: Partial<ArborNode>;
    }
  | {
      kind: 'suggest';
      message: string;
      matches: ArborNode[];
      createSuggestion?: Partial<ArborNode>;
    };

const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'how',
  'i',
  'in',
  'into',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'our',
  'please',
  'root',
  'roots',
  'show',
  'start',
  'that',
  'the',
  'this',
  'to',
  'up',
  'we',
  'with',
  'workspace',
  'workspaces',
]);

const promptSuggestions = [
  'Open the research and evidence root',
  'Show me the roots tied to district partnerships',
  'Create a root for donor storytelling and development',
  'Start a new root for family engagement pilots',
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const extractKeywords = (value: string) =>
  Array.from(
    new Set(
      normalizeText(value)
        .split(' ')
        .filter((word) => word.length > 2 && !stopWords.has(word)),
    ),
  );

const extractCandidateTitle = (prompt: string) => {
  const quoted = prompt.match(/["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1].trim();

  const patterns = [
    /\b(?:create|add|make|start|build|spin up|set up)\b(?:\s+(?:a|an|new))?\s+(?:root|workspace|branch)?\s*(?:for|about|on|around)?\s*(.+)$/i,
    /\b(?:root|workspace|branch)\s+(?:for|about|on|called|named)\s+(.+)$/i,
    /\b(?:create|add|make|start|build)\b\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(/\bplease\b/gi, '')
        .replace(/[.?!]+$/g, '')
        .trim();
    }
  }

  return '';
};

const inferColor = (value: string) => {
  const normalized = normalizeText(value);

  if (/\b(research|evidence|impact|data)\b/.test(normalized)) return '#24678d';
  if (/\b(partner|district|adoption|campaign|outreach)\b/.test(normalized)) return '#3f8f6b';
  if (/\b(student|family|community|summer|afterschool)\b/.test(normalized)) return '#ef8e3b';
  if (/\b(platform|access|security|classroom|google)\b/.test(normalized)) return '#2f6f9b';
  return '#059fc5';
};

const inferTags = (prompt: string, candidateTitle: string) => {
  const inferred = extractKeywords(`${prompt} ${candidateTitle}`).slice(0, 5);
  return inferred.length > 0 ? inferred : ['generated-root'];
};

const scoreRoot = (root: ArborNode, prompt: string, keywords: string[]) => {
  const title = normalizeText(root.title);
  const tags = normalizeText((root.tags ?? []).join(' '));
  const content = normalizeText(root.content ?? '');
  const normalizedPrompt = normalizeText(prompt);

  let score = 0;

  if (title.includes(normalizedPrompt) || normalizedPrompt.includes(title)) score += 8;

  keywords.forEach((keyword) => {
    if (title.includes(keyword)) score += 4;
    if (tags.includes(keyword)) score += 3;
    if (content.includes(keyword)) score += 1;
  });

  return score;
};

const interpretPrompt = (prompt: string, roots: ArborNode[]): PromptResult => {
  const trimmedPrompt = prompt.trim();
  const keywords = extractKeywords(trimmedPrompt);
  const normalizedPrompt = normalizeText(trimmedPrompt);
  const isCreateIntent = /\b(create|add|make|start|build|spin up|set up|new)\b/i.test(trimmedPrompt);
  const isOpenIntent = /\b(open|go to|take me to|jump to|focus|enter)\b/i.test(trimmedPrompt);
  const isListIntent =
    /\b(list|which|what|browse|explore|find|show)\b/i.test(trimmedPrompt) &&
    /\b(root|roots|branch|branches|workspace|workspaces)\b/i.test(trimmedPrompt);

  const rankedRoots = roots
    .map((root) => ({ root, score: scoreRoot(root, trimmedPrompt, keywords) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (isCreateIntent) {
    const candidate = extractCandidateTitle(trimmedPrompt);
    const fallbackTitle = keywords.slice(0, 4).join(' ');
    const rawTitle = candidate || fallbackTitle;

    if (!rawTitle) {
      return {
        kind: 'suggest',
        message: 'Name the new root in plain language and I can create it.',
        matches: roots.slice(0, 4),
      };
    }

    const formattedTitle = titleCase(rawTitle);
    const existing = roots.find((root) => normalizeText(root.title) === normalizeText(formattedTitle));

    if (existing) {
      return {
        kind: 'select',
        message: `That root already exists. Opening ${existing.title}.`,
        target: existing,
        matches: [existing],
      };
    }

    return {
      kind: 'create',
      message: `I can create ${formattedTitle} as a new top-level root.`,
      payload: {
        title: formattedTitle,
        type: 'concept',
        color: inferColor(rawTitle),
        content: `Workspace created from AI home for ${formattedTitle}.`,
        tags: inferTags(trimmedPrompt, formattedTitle),
      },
    };
  }

  if (isListIntent) {
    return {
      kind: 'suggest',
      message: 'These roots are the closest fit for that request.',
      matches: rankedRoots.length > 0 ? rankedRoots.slice(0, 6).map((entry) => entry.root) : roots.slice(0, 6),
    };
  }

  if (rankedRoots.length > 0) {
    const [top] = rankedRoots;
    const matches = rankedRoots.slice(0, 4).map((entry) => entry.root);

    if (isOpenIntent || top.score >= 8 || matches.length === 1) {
      return {
        kind: 'select',
        message: `Opening ${top.root.title}.`,
        target: top.root,
        matches,
      };
    }

    return {
      kind: 'suggest',
      message: 'I found a few roots that look relevant.',
      matches,
    };
  }

  const candidate = extractCandidateTitle(trimmedPrompt) || keywords.slice(0, 4).join(' ');

  return {
    kind: 'suggest',
    message: 'No current root matched that request. I can create a new one from it.',
    matches: [],
    createSuggestion: candidate
      ? {
          title: titleCase(candidate),
          type: 'concept',
          color: inferColor(candidate),
          content: `Workspace created from AI home for ${titleCase(candidate)}.`,
          tags: inferTags(trimmedPrompt, candidate),
        }
      : undefined,
  };
};

export const AIHome: React.FC<AIHomeProps> = ({ nodes, onSelectRoot, onCreateRoot }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<PromptResult | null>(null);

  const roots = useMemo(
    () =>
      nodes
        .filter((node) => node.parentId === null && !node.tags?.includes('ai-home'))
        .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')),
    [nodes],
  );

  const featuredRoots = roots.slice(0, 6);
  const rootCount = roots.length;
  const artifactCount = nodes.filter((node) => node.parentId !== null).length;

  const runPrompt = (rawPrompt?: string) => {
    const nextPrompt = (rawPrompt ?? prompt).trim();
    if (!nextPrompt) return;

    const nextResult = interpretPrompt(nextPrompt, roots);
    setPrompt(nextPrompt);
    setResult(nextResult);

    if (nextResult.kind === 'select') {
      onSelectRoot(nextResult.target.id);
      return;
    }

    if (nextResult.kind === 'create') {
      onCreateRoot(nextResult.payload);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-8 md:px-6 xl:px-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[30px] border border-white/10 bg-[#081017]/94 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)] md:p-8"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/54">
            <Sparkles className="h-3.5 w-3.5" />
            AI Root Console
          </div>

          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-[0.98] tracking-tight text-white md:text-5xl">
            Ask the tree what to open or what to create next.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/56 md:text-base">
            This home surface is the natural-language entry point for the ReadWorks portal. Query the existing roots,
            or describe a new top-level workspace and I will create it.
          </p>

          <div className="mt-8 w-full rounded-[26px] border border-white/10 bg-black/22 p-4 text-left md:p-5">
            <label className="group flex flex-col rounded-[22px] border border-white/8 bg-white/[0.025] p-4 transition-colors focus-within:border-white/18">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/34">
                <MessageSquareText className="h-4 w-4" />
                Natural Language Prompt
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault();
                    runPrompt();
                  }
                }}
                placeholder="Open the research root, show partner branches, or create a root for district pilots."
                className="mt-3 min-h-[116px] resize-none bg-transparent text-base leading-7 text-white outline-none placeholder:text-white/24"
              />
              <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/26">
                Cmd/Ctrl + Enter to run
              </div>
            </label>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/40">
                {rootCount} roots and {artifactCount} attached artifacts are searchable from here.
              </div>
              <button
                onClick={() => runPrompt()}
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Run prompt
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => runPrompt(suggestion)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/62 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {result && (
          <motion.section
            key={`${result.kind}-${result.message}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/34">AI response</div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/82 md:text-base">{result.message}</p>
              </div>

              {result.kind === 'create' && (
                <button
                  onClick={() => onCreateRoot(result.payload)}
                  className="rounded-full border border-white/10 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                >
                  Create root
                </button>
              )}
            </div>

            {(result.kind === 'select' || result.kind === 'suggest') && result.matches.length > 0 && (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {result.matches.map((root) => (
                  <button
                    key={root.id}
                    onClick={() => onSelectRoot(root.id)}
                    className="rounded-[18px] border border-white/10 bg-black/18 p-4 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-medium text-white">{root.title}</div>
                        <div className="mt-1.5 line-clamp-2 text-sm leading-6 text-white/55">
                          {root.content || 'Open this root'}
                        </div>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/32" />
                    </div>
                    {root.tags && root.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {root.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {result.kind === 'suggest' && result.createSuggestion && (
              <div className="mt-5 rounded-[18px] border border-dashed border-white/12 bg-black/18 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Create {result.createSuggestion.title}
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      No existing root matched cleanly. I can create this as a new top-level workspace.
                    </div>
                  </div>
                  <button
                    onClick={() => onCreateRoot(result.createSuggestion)}
                    className="rounded-full border border-white/10 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                  >
                    Create suggested root
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/34">Current roots</div>
            <h2 className="mt-2 font-serif text-2xl text-white md:text-3xl">Open a workspace directly</h2>
          </div>
          <div className="text-sm text-white/48">Top-level branches only</div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {featuredRoots.map((root) => (
            <button
              key={root.id}
              onClick={() => onSelectRoot(root.id)}
              className="group rounded-[18px] border border-white/10 bg-black/18 px-4 py-4 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1.5 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: root.color || '#059fc5' }}
                  />
                  <div>
                    <div className="text-lg font-medium leading-tight text-white">{root.title}</div>
                    <div className="mt-1.5 line-clamp-2 text-sm leading-6 text-white/55">
                      {root.content || 'Open this root'}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/28 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              {root.tags && root.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {root.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/38"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
