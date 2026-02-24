"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { SchoolStudent, School } from "@/types/school";

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("school");

  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SchoolStudent | null>(null);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolAndStudents();
    }
  }, [schoolId]);

  const fetchSchoolAndStudents = async () => {
    try {
      // Fetch school details
      const schoolRes = await fetch(`/api/schools/${schoolId}`);
      const schoolData = await schoolRes.json();
      if (schoolRes.ok) {
        setSchool(schoolData.school);
      }

      // Fetch students
      const studentsRes = await fetch(`/api/schools/${schoolId}/students`);
      const studentsData = await studentsRes.json();
      if (studentsRes.ok) {
        setStudents(studentsData.students || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (data: {
    name: string;
    birth_date: string;
    grade?: string;
    primary_sport?: string;
  }) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to add student");
        return;
      }

      toast.success("Student enrolled successfully!");
      setShowAddModal(false);
      fetchSchoolAndStudents();
    } catch (error) {
      console.error("Add student error:", error);
      toast.error("Failed to add student");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;

    try {
      const response = await fetch(
        `/api/schools/${schoolId}/students/${studentId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to remove student");
        return;
      }

      toast.success("Student removed");
      fetchSchoolAndStudents();
    } catch (error) {
      console.error("Delete student error:", error);
      toast.error("Failed to remove student");
    }
  };

  const handleGenerateCode = async (
    studentId: string,
    type: "parent" | "student"
  ) => {
    try {
      const response = await fetch(
        `/api/schools/${schoolId}/students/${studentId}/generate-codes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to generate code");
        return;
      }

      navigator.clipboard.writeText(data.invite_code);
      toast.success(`${type === "parent" ? "Parent" : "Student"} code copied: ${data.invite_code}`);
      fetchSchoolAndStudents();
    } catch (error) {
      console.error("Generate code error:", error);
      toast.error("Failed to generate code");
    }
  };

  if (!schoolId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-base-content/60">No school selected.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{school?.name || "School"}</h1>
          <p className="text-base-content/60 mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-12">
            <h2 className="text-xl font-semibold">No Students Yet</h2>
            <p className="text-base-content/60 mt-2">
              Add students to start tracking their athletic performance.
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => setShowAddModal(true)}
            >
              Add First Student
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table bg-base-100">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Age</th>
                <th>Sport</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="font-medium">{student.athlete?.name}</td>
                  <td>{student.grade || "-"}</td>
                  <td>{student.age}</td>
                  <td className="capitalize">{student.athlete?.primary_sport}</td>
                  <td>
                    {student.has_account ? (
                      <span className="badge badge-success badge-sm">
                        Account Linked
                      </span>
                    ) : student.can_have_account ? (
                      <span className="badge badge-warning badge-sm">
                        Pending (13+)
                      </span>
                    ) : (
                      <span className="badge badge-ghost badge-sm">
                        Parent Only
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-xs">
                          Invite Codes
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                          <li>
                            <button
                              onClick={() =>
                                handleGenerateCode(student.id, "parent")
                              }
                            >
                              Generate Parent Code
                            </button>
                          </li>
                          {student.can_have_account && (
                            <li>
                              <button
                                onClick={() =>
                                  handleGenerateCode(student.id, "student")
                                }
                              >
                                Generate Student Code
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStudent}
        />
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          schoolId={schoolId}
          onClose={() => setSelectedStudent(null)}
          onRefresh={fetchSchoolAndStudents}
        />
      )}
    </div>
  );
}

function AddStudentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: {
    name: string;
    birth_date: string;
    grade?: string;
    primary_sport?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [grade, setGrade] = useState("");
  const [sport, setSport] = useState("basketball");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;
    setLoading(true);
    await onAdd({
      name,
      birth_date: birthDate,
      grade: grade || undefined,
      primary_sport: sport,
    });
    setLoading(false);
  };

  // Calculate age from birth date
  const calculateAge = (date: string) => {
    if (!date) return null;
    const today = new Date();
    const birth = new Date(date);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const age = calculateAge(birthDate);

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Enroll New Student</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Student Name *</span>
            </label>
            <input
              type="text"
              placeholder="Full name"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Birth Date *</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
            {age !== null && (
              <label className="label">
                <span className="label-text-alt">
                  Age: {age} years
                  {age >= 13 && (
                    <span className="text-success ml-2">
                      (Can have own account)
                    </span>
                  )}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Grade</span>
            </label>
            <select
              className="select select-bordered"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select grade</option>
              <option value="K">Kindergarten</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g.toString()}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Primary Sport</span>
            </label>
            <select
              className="select select-bordered"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            >
              <option value="basketball">Basketball</option>
              <option value="baseball">Baseball</option>
              <option value="soccer">Soccer</option>
              <option value="football">Football</option>
              <option value="tennis">Tennis</option>
              <option value="volleyball">Volleyball</option>
            </select>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading || !name.trim() || !birthDate}
            >
              Enroll Student
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

function StudentDetailsModal({
  student,
  schoolId,
  onClose,
  onRefresh,
}: {
  student: SchoolStudent;
  schoolId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [codes, setCodes] = useState<{
    student_invite_code: string | null;
    parent_invite_codes: Array<{
      id: string;
      invite_code: string;
      relationship: string;
      verified: boolean;
      claimed: boolean;
    }>;
  } | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await fetch(
        `/api/schools/${schoolId}/students/${student.id}/generate-codes`
      );
      const data = await response.json();
      if (response.ok) {
        setCodes(data);
      }
    } catch (error) {
      console.error("Fetch codes error:", error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{student.athlete?.name}</h3>
        <p className="text-base-content/60">
          Grade {student.grade} | Age {student.age}
        </p>

        <div className="mt-6 space-y-4">
          <h4 className="font-semibold">Invite Codes</h4>

          {codes?.student_invite_code && (
            <div className="p-3 bg-base-200 rounded-lg">
              <p className="text-sm text-base-content/60 mb-1">
                Student Code (13+)
              </p>
              <div className="flex items-center gap-2">
                <code className="font-mono bg-base-300 px-2 py-1 rounded flex-1">
                  {codes.student_invite_code}
                </code>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => copyCode(codes.student_invite_code!)}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-base-content/60">Parent Codes</p>
            {codes?.parent_invite_codes.map((pc) => (
              <div
                key={pc.id}
                className="flex items-center justify-between p-2 bg-base-200 rounded"
              >
                <div>
                  <code className="font-mono text-sm">{pc.invite_code}</code>
                  <span className="text-xs text-base-content/60 ml-2">
                    ({pc.relationship})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {pc.claimed ? (
                    <span className="badge badge-success badge-sm">Claimed</span>
                  ) : (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => copyCode(pc.invite_code)}
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
