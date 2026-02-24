"use client";

import { useState, useEffect, useCallback } from "react";
import { SPORT_LIST, SportId } from "@/lib/sports/config";
import {
  RULEBOOK_DATA,
  RULEBOOK_SECTIONS,
  RulebookSection,
} from "@/lib/sports/rulebook-data";

const COACH_NOTES_KEY = "athletetrack-coach-notes";

export default function RulebookPage() {
  const [selectedSport, setSelectedSport] = useState<SportId>("basketball");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic-rules"])
  );
  const [coachNotes, setCoachNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Load coach notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COACH_NOTES_KEY);
      if (saved) {
        setCoachNotes(JSON.parse(saved));
      }
    } catch {
      // Corrupted data, ignore
    }
  }, []);

  const rulebook = RULEBOOK_DATA[selectedSport];

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setExpandedSections((prev) => {
      if (prev.size === RULEBOOK_SECTIONS.length) {
        return new Set();
      }
      return new Set(RULEBOOK_SECTIONS.map((s) => s.id));
    });
  }, []);

  const getNoteKey = (sectionId: string) =>
    `${selectedSport}:${sectionId}`;

  const saveNote = useCallback(
    (sectionId: string, text: string) => {
      const key = getNoteKey(sectionId);
      const updated = { ...coachNotes };
      if (text.trim()) {
        updated[key] = text.trim();
      } else {
        delete updated[key];
      }
      setCoachNotes(updated);
      localStorage.setItem(COACH_NOTES_KEY, JSON.stringify(updated));
      setEditingNote(null);
      setNoteText("");
    },
    [coachNotes, selectedSport]
  );

  const startEditing = useCallback(
    (sectionId: string) => {
      const key = getNoteKey(sectionId);
      setEditingNote(sectionId);
      setNoteText(coachNotes[key] || "");
    },
    [coachNotes, selectedSport]
  );

  const cancelEditing = useCallback(() => {
    setEditingNote(null);
    setNoteText("");
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Rulebook</h1>
          <p className="text-base-content/70 mt-1">
            Official rules reference for all sports. Perfect for learning a new
            sport or coaching.
          </p>
        </div>

        {/* Sport Selector */}
        <div className="flex gap-2 flex-wrap">
          {SPORT_LIST.map((s) => (
            <button
              key={s.id}
              className={`btn btn-sm ${
                selectedSport === s.id ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => {
                setSelectedSport(s.id);
                setExpandedSections(new Set(["basic-rules"]));
                cancelEditing();
              }}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        {/* Sport Header */}
        <div className="card bg-primary/10 border border-primary/20">
          <div className="card-body py-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="card-title text-2xl">
                  {rulebook.sportIcon} {rulebook.sportName} Rulebook
                </h2>
                <p className="text-base-content/60 text-sm">
                  Governing body: {rulebook.officialBody}
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={toggleAll}
              >
                {expandedSections.size === RULEBOOK_SECTIONS.length
                  ? "Collapse All"
                  : "Expand All"}
              </button>
            </div>
          </div>
        </div>

        {/* Rule Sections */}
        <div className="space-y-3">
          {rulebook.sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const noteKey = getNoteKey(section.id);
            const hasNote = !!coachNotes[noteKey];
            const isEditing = editingNote === section.id;

            return (
              <div key={section.id} className="card bg-base-200">
                {/* Section Header */}
                <div
                  className="card-body py-4 cursor-pointer select-none"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-transform duration-200 text-base-content/50 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        ▶
                      </span>
                      <span className="text-xl">{section.icon}</span>
                      <h3 className="font-bold text-lg">{section.title}</h3>
                      {hasNote && (
                        <span className="badge badge-secondary badge-sm">
                          Note
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isExpanded) toggleSection(section.id);
                        startEditing(section.id);
                      }}
                      title="Add coach note"
                    >
                      📝
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="card-body pt-0">
                    <div className="border-t border-base-300 pt-4 space-y-4">
                      {/* Rule Content */}
                      {section.id === "glossary" ? (
                        <GlossaryContent section={section} />
                      ) : (
                        <RuleContent section={section} />
                      )}

                      {/* Saved Coach Note (display mode) */}
                      {hasNote && !isEditing && (
                        <div className="border-t border-dashed border-secondary/30 pt-4 mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-secondary">
                              Coach Notes
                            </span>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => startEditing(section.id)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => saveNote(section.id, "")}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-base-content/80 whitespace-pre-wrap bg-secondary/5 p-3 rounded-lg text-sm">
                            {coachNotes[noteKey]}
                          </p>
                        </div>
                      )}

                      {/* Coach Note Editor */}
                      {isEditing && (
                        <div className="border-t border-dashed border-secondary/30 pt-4 mt-4">
                          <label className="label">
                            <span className="label-text font-semibold text-secondary">
                              Coach Notes
                            </span>
                          </label>
                          <textarea
                            className="textarea textarea-bordered w-full h-24 text-sm"
                            placeholder="Add your notes, reminders, or custom rules for your team..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2 justify-end">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => saveNote(section.id, noteText)}
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

// ============ RULE CONTENT RENDERER ============
function RuleContent({ section }: { section: RulebookSection }) {
  return (
    <ul className="space-y-2">
      {section.entries.flatMap((entry) =>
        entry.content.map((line, i) => {
          // Check for "Bold part — rest" pattern
          const dashIndex = line.indexOf(" — ");
          if (dashIndex > -1) {
            const term = line.substring(0, dashIndex);
            const desc = line.substring(dashIndex + 3);
            return (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary mt-1 shrink-0">•</span>
                <span>
                  <strong className="text-base-content">{term}</strong>
                  <span className="text-base-content/70"> — {desc}</span>
                </span>
              </li>
            );
          }
          return (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary mt-1 shrink-0">•</span>
              <span className="text-base-content/80">{line}</span>
            </li>
          );
        })
      )}
    </ul>
  );
}

// ============ GLOSSARY CONTENT RENDERER ============
function GlossaryContent({ section }: { section: RulebookSection }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {section.entries.flatMap((entry) =>
        entry.content.map((line, i) => {
          const dashIndex = line.indexOf(" — ");
          const term = dashIndex > -1 ? line.substring(0, dashIndex) : line;
          const def =
            dashIndex > -1 ? line.substring(dashIndex + 3) : "";
          return (
            <div
              key={i}
              className="bg-base-300/50 rounded-lg p-3"
            >
              <span className="font-bold text-primary text-sm">{term}</span>
              {def && (
                <p className="text-base-content/70 text-xs mt-1">{def}</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
