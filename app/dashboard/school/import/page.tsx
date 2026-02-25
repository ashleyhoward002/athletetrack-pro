"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { SPORT_LIST, SportId } from "@/lib/sports/config";

type ImportType = "roster" | "game-stats";

interface ImportResult {
  success: boolean;
  name?: string;
  player?: string;
  error?: string;
  athlete_id?: string;
  student_id?: string;
  game_id?: string;
  matched_athlete?: string;
}

interface ImportSummary {
  total: number;
  success: number;
  failed: number;
  columns_detected?: string[];
  stats_detected?: string[];
}

export default function ImportPage() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("school");

  const [importType, setImportType] = useState<ImportType>("roster");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Roster import options
  const [defaultSport, setDefaultSport] = useState<SportId>("basketball");
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Game stats options
  const [gameDate, setGameDate] = useState(new Date().toISOString().split("T")[0]);
  const [opponent, setOpponent] = useState("");
  const [gameSport, setGameSport] = useState<SportId>("basketball");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      if (!validTypes.includes(selected.type) && !selected.name.endsWith(".csv")) {
        toast.error("Please upload an Excel (.xlsx) or CSV file");
        return;
      }
      setFile(selected);
      setResults(null);
      setSummary(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setResults(null);
      setSummary(null);
    }
  };

  const handleImport = async () => {
    if (!file || !schoolId) return;

    if (importType === "game-stats" && !opponent.trim()) {
      toast.error("Please enter the opponent name");
      return;
    }

    setIsUploading(true);
    setResults(null);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (importType === "roster") {
        formData.append("default_sport", defaultSport);
        formData.append("skip_duplicates", skipDuplicates.toString());
      } else {
        formData.append("game_date", gameDate);
        formData.append("opponent", opponent);
        formData.append("sport", gameSport);
      }

      const endpoint = importType === "roster"
        ? `/api/schools/${schoolId}/import/roster`
        : `/api/schools/${schoolId}/import/game-stats`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Import failed");
        if (data.detected_columns) {
          setSummary({ total: 0, success: 0, failed: 0, columns_detected: data.detected_columns });
        }
        return;
      }

      toast.success(data.message);
      setResults(data.results);
      setSummary(data.summary);

    } catch (error: any) {
      toast.error(error.message || "Import failed");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResults(null);
    setSummary(null);
    setOpponent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!schoolId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-base-content/60">No school selected.</p>
        <Link href="/dashboard/school" className="btn btn-primary mt-4">
          Go to Schools
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Import Data</h1>
          <p className="text-base-content/60 mt-1">
            Bulk import players or game stats from Excel/CSV files
          </p>
        </div>
        <Link
          href={`/dashboard/school/students?school=${schoolId}`}
          className="btn btn-ghost"
        >
          Back to Students
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Import Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Import Type Selector */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">What do you want to import?</h2>
              <div className="tabs tabs-boxed mt-4">
                <button
                  className={`tab ${importType === "roster" ? "tab-active" : ""}`}
                  onClick={() => { setImportType("roster"); resetForm(); }}
                >
                  Player Roster
                </button>
                <button
                  className={`tab ${importType === "game-stats" ? "tab-active" : ""}`}
                  onClick={() => { setImportType("game-stats"); resetForm(); }}
                >
                  Game Stats
                </button>
              </div>

              <p className="text-sm text-base-content/60 mt-4">
                {importType === "roster"
                  ? "Upload a spreadsheet with player names, birth dates, grades, positions, and jersey numbers."
                  : "Upload a stat sheet from a single game to create game records for each player."}
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Upload File</h2>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  file ? "border-success bg-success/5" : "border-base-300 hover:border-primary"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="text-4xl">📄</div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-base-content/60">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={resetForm}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl">📁</div>
                    <p className="font-medium">
                      Drag & drop your file here, or click to browse
                    </p>
                    <p className="text-sm text-base-content/60">
                      Supports Excel (.xlsx) and CSV files
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Import Options */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Import Options</h2>

              {importType === "roster" ? (
                <div className="space-y-4 mt-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Default Sport</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={defaultSport}
                      onChange={(e) => setDefaultSport(e.target.value as SportId)}
                    >
                      {SPORT_LIST.map(sport => (
                        <option key={sport.id} value={sport.id}>
                          {sport.icon} {sport.name}
                        </option>
                      ))}
                    </select>
                    <label className="label">
                      <span className="label-text-alt">
                        Used when sport column is missing
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={skipDuplicates}
                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                      />
                      <span className="label-text">Skip duplicate names</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Game Date *</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={gameDate}
                      onChange={(e) => setGameDate(e.target.value)}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Opponent *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Central High School"
                      className="input input-bordered"
                      value={opponent}
                      onChange={(e) => setOpponent(e.target.value)}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Sport</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={gameSport}
                      onChange={(e) => setGameSport(e.target.value as SportId)}
                    >
                      {SPORT_LIST.map(sport => (
                        <option key={sport.id} value={sport.id}>
                          {sport.icon} {sport.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="card-actions justify-end mt-6">
                <button
                  className={`btn btn-primary ${isUploading ? "loading" : ""}`}
                  onClick={handleImport}
                  disabled={!file || isUploading}
                >
                  {isUploading ? "Importing..." : "Import"}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {(results || summary) && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Import Results</h2>

                {summary && (
                  <div className="stats shadow mt-4">
                    <div className="stat">
                      <div className="stat-title">Total</div>
                      <div className="stat-value">{summary.total}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Success</div>
                      <div className="stat-value text-success">{summary.success}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Failed</div>
                      <div className="stat-value text-error">{summary.failed}</div>
                    </div>
                  </div>
                )}

                {summary?.columns_detected && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold">Detected columns:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {summary.columns_detected.map((col, i) => (
                        <span key={i} className="badge badge-ghost">{col}</span>
                      ))}
                    </div>
                  </div>
                )}

                {summary?.stats_detected && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold">Detected stats:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {summary.stats_detected.map((stat, i) => (
                        <span key={i} className="badge badge-primary badge-outline">{stat}</span>
                      ))}
                    </div>
                  </div>
                )}

                {results && results.length > 0 && (
                  <div className="overflow-x-auto mt-4">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>{importType === "roster" ? "Name" : "Player"}</th>
                          {importType === "game-stats" && <th>Matched To</th>}
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={i}>
                            <td>
                              {r.success ? (
                                <span className="badge badge-success badge-sm">Success</span>
                              ) : (
                                <span className="badge badge-error badge-sm">Failed</span>
                              )}
                            </td>
                            <td>{r.name || r.player}</td>
                            {importType === "game-stats" && (
                              <td>{r.matched_athlete || "-"}</td>
                            )}
                            <td className="text-sm text-base-content/60">
                              {r.error || (r.success ? "Imported" : "")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Help */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">File Format Help</h2>

              {importType === "roster" ? (
                <div className="space-y-4 text-sm">
                  <p>Your roster file should have columns for:</p>
                  <ul className="list-disc list-inside space-y-1 text-base-content/80">
                    <li><strong>Name</strong> (required) - Player's full name</li>
                    <li><strong>Birth Date</strong> - Date of birth (MM/DD/YYYY)</li>
                    <li><strong>Grade</strong> - K, 1-12</li>
                    <li><strong>Position</strong> - Playing position</li>
                    <li><strong>Jersey Number</strong> - Jersey/uniform number</li>
                    <li><strong>Sport</strong> - Primary sport</li>
                  </ul>

                  <div className="divider">Example</div>

                  <div className="overflow-x-auto">
                    <table className="table table-xs">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>DOB</th>
                          <th>Grade</th>
                          <th>#</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>John Smith</td>
                          <td>03/15/2010</td>
                          <td>8</td>
                          <td>23</td>
                        </tr>
                        <tr>
                          <td>Jane Doe</td>
                          <td>07/22/2011</td>
                          <td>7</td>
                          <td>15</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <p>Your stat sheet should have columns for:</p>
                  <ul className="list-disc list-inside space-y-1 text-base-content/80">
                    <li><strong>Name or Jersey #</strong> (required) - To match players</li>
                    <li><strong>Stats</strong> - Any stat columns (PTS, REB, AST, etc.)</li>
                  </ul>

                  <div className="divider">Recognized Stats</div>

                  <div className="space-y-2">
                    <p className="font-semibold">Basketball:</p>
                    <p className="text-base-content/60">
                      PTS, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, OREB, DREB, AST, STL, BLK, TO, PF
                    </p>
                  </div>

                  <div className="divider">Example</div>

                  <div className="overflow-x-auto">
                    <table className="table table-xs">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>PTS</th>
                          <th>REB</th>
                          <th>AST</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>John Smith</td>
                          <td>18</td>
                          <td>7</td>
                          <td>4</td>
                        </tr>
                        <tr>
                          <td>Jane Doe</td>
                          <td>12</td>
                          <td>5</td>
                          <td>8</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold">Tips</h3>
              <ul className="text-sm text-base-content/80 space-y-2">
                <li>• Column names are matched automatically</li>
                <li>• Extra columns are ignored</li>
                <li>• Empty rows are skipped</li>
                {importType === "roster" && (
                  <li>• Players 13+ can create their own accounts</li>
                )}
                {importType === "game-stats" && (
                  <li>• Players must exist in your roster first</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
