import { useEffect, useMemo, useState } from "react";
import { getAllUsers, type AdminUser } from "../services/admin.users";
import { UserStatsCards } from "../components/UserStatsCards";
import { Pagination } from "../components/Pagination";
import { Badge } from "../components/Badge";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "../styles/AdminQuestions.css";

const ITEMS_PER_PAGE = 10;

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        const learners = data.filter((u) => u.role !== "ADMIN");
        setUsers(learners);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const computed = useMemo(() => {
    const withStats = users.map((u) => {
      const attempts = u.totalQuestionsAttempted || 0;
      const correct = u.totalCorrectAnswers || 0;
      const accuracy =
        attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
      const streak = u.currentStreak || 0;
      const points = u.totalPoints || 0;
      return { ...u, attempts, correct, accuracy, streak, points };
    });

    const ranked = [...withStats].sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return b.points - a.points;
    });

    const term = search.trim().toLowerCase();
    const filtered = term
      ? ranked.filter((u) => (u.name || "").toLowerCase().includes(term))
      : ranked;

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    return { ranked, filtered, pageItems, totalPages, currentPage };
  }, [users, search, page]);

  const totals = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
    const accuracies = users.map((u) => {
      const attempts = u.totalQuestionsAttempted || 0;
      const correct = u.totalCorrectAnswers || 0;
      return attempts > 0 ? (correct / attempts) * 100 : 0;
    });
    const avgAccuracy =
      accuracies.length > 0
        ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
        : 0;
    const longestStreak = users.reduce(
      (max, u) => Math.max(max, u.longestStreak || u.currentStreak || 0),
      0
    );
    return { totalUsers, activeUsers, avgAccuracy, longestStreak };
  }, [users]);

  return (
    <div className="admin-questions-page">
      <div className="admin-questions-sticky-section">
        <div className="admin-questions-header">
          <div className="admin-questions-title">Users</div>
        </div>

        <UserStatsCards
          totalUsers={totals.totalUsers}
          activeUsers={totals.activeUsers}
          avgAccuracy={totals.avgAccuracy}
          longestStreak={totals.longestStreak}
        />

        <div
          className="admin-questions-filters"
          style={{ gridTemplateColumns: "1fr" }}
        >
          <input
            className="admin-input"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
      <div className="admin-table-container">
        <div className="admin-table-wrapper">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="admin-questions-table admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  <th>Attempts</th>
                  <th>Streak</th>
                  <th>Accuracy</th>
                  <th>Points</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {computed.pageItems.map((u) => {
                  const joined =
                    typeof u.createdAt === "string"
                      ? u.createdAt.slice(0, 10)
                      : new Date(u.createdAt).toISOString().slice(0, 10);

                  return (
                    <tr key={u.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div>{u.name}</div>
                        <div style={{ color: "#777", fontSize: "12px" }}>
                          {u.email}
                        </div>
                      </td>
                      <td>{joined}</td>
                      <td>{u.attempts}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {u.streak}
                        {u.streak > 0 && <span style={{ fontSize: "14px" }}> 🔥</span>}
                      </td>
                      <td>{u.accuracy}%</td>
                      <td>{u.points}</td>
                      <td>
                        <Badge label={u.status} variant={u.status === 'ACTIVE' ? 'green' : 'gray'} />
                      </td>
                    </tr>
                  );
                })}
                {computed.pageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: "1rem" }}
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          currentPage={computed.currentPage}
          totalPages={computed.totalPages}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(computed.totalPages, p + 1))}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
