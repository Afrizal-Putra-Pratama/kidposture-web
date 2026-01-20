import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios.js';

function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ Load user dari localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/children');
      console.log('✅ Children data:', response.data);
      
      if (response.data.success) {
        setChildren(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback jika API return array langsung
        setChildren(response.data);
      }
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const totalScreenings = children.reduce(
    (sum, child) => sum + (child.screenings_count || 0),
    0
  );

  const childrenNeedingAttention = children.filter(
    (child) =>
      child.latest_screening &&
      child.latest_screening.category &&
      child.latest_screening.category.toLowerCase().includes('attention')
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2>Gagal Memuat Data</h2>
            <p>{error}</p>
            <button onClick={loadData} style={styles.primaryButton}>
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ✅ Header with User Info & Logout */}
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={styles.title}>
                👋 Halo, {user?.name || 'Orang Tua'}!
              </h1>
              <p style={styles.subtitle}>
                Ringkasan postur dan perkembangan anak berdasarkan hasil screening
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/education" style={styles.btnSecondaryLink}>
                📚 Edukasi
              </Link>
              <button onClick={handleLogout} style={styles.btnLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatCard
            label="Total Anak"
            value={children.length}
            icon="👶"
            color="#4e73df"
          />
          <StatCard
            label="Total Screening"
            value={totalScreenings}
            icon="📊"
            color="#1cc88a"
          />
          <StatCard
            label="Perlu Perhatian"
            value={childrenNeedingAttention.length}
            icon="⚠️"
            color="#e74a3b"
          />
        </div>

        {/* Children Section */}
        <div style={styles.childrenSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Anak & Hasil Screening Terakhir</h2>
            <Link to="/children/new" style={styles.actionLink}>
              + Tambah Anak
            </Link>
          </div>

          {children.length === 0 ? (
            <EmptyState
              icon="👶"
              title="Belum ada data anak"
              description="Tambahkan data anak terlebih dahulu untuk mulai screening postur."
              actionLabel="Tambah Anak"
              onAction={() => navigate('/children/new')}
            />
          ) : (
            <div style={styles.childrenList}>
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onScreeningClick={() =>
                    navigate(`/children/${child.id}/screenings/new`)
                  }
                  onHistoryClick={() =>
                    navigate(`/children/${child.id}/screenings`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================
// COMPONENTS
// ====================================

function StatCard({ label, value, icon, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={styles.statLabel}>{label}</div>
          <div style={styles.statValue}>{value}</div>
        </div>
        <div style={{ ...styles.statIcon, backgroundColor: color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChildCard({ child, onScreeningClick, onHistoryClick }) {
  const latest = child.latest_screening;
  const badge = latest?.category ? getBadgeConfig(latest.category) : null;

  return (
    <div style={styles.childCard}>
      <div style={styles.childInfo}>
        <div style={styles.childAvatar}>
          {child.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={styles.childName}>{child.name}</div>
          <div style={styles.childMeta}>
            {child.age_years ? `${child.age_years} tahun` : ''}{' '}
            {child.gender === 'M' ? '👦 Laki-laki' : child.gender === 'F' ? '👧 Perempuan' : ''}
          </div>
          {child.height && child.weight && (
            <div style={styles.childMeta}>
              📏 {child.height} cm • ⚖️ {child.weight} kg
            </div>
          )}
          <div style={styles.childMeta}>
            Screening: <strong>{child.screenings_count || 0} kali</strong>
          </div>
        </div>
      </div>

      <div style={styles.childResults}>
        {latest ? (
          <>
            <div style={styles.resultScore}>
              Skor {latest.score ?? '-'}
            </div>
            {badge && (
              <div style={{ ...styles.badge, ...badge.style }}>
                {badge.text}
              </div>
            )}
            <div style={styles.resultDate}>
              📅 {new Date(latest.created_at).toLocaleDateString('id-ID')}
            </div>
            {latest.summary && (
              <div style={styles.resultSummary} title={latest.summary}>
                {latest.summary.substring(0, 80)}...
              </div>
            )}
          </>
        ) : (
          <div style={styles.noScreening}>Belum ada screening</div>
        )}
      </div>

      <div style={styles.childActions}>
        <button style={styles.btnSecondary} onClick={onHistoryClick}>
          📋 Riwayat
        </button>
        <button style={styles.btnPrimary} onClick={onScreeningClick}>
          📸 Screening Baru
        </button>
      </div>
    </div>
  );
}

function getBadgeConfig(category) {
  const cat = category.toLowerCase();
  if (cat.includes('good') || cat.includes('baik')) {
    return {
      text: '✅ Baik',
      style: { backgroundColor: '#e6f8f0', color: '#1cc88a' }
    };
  } else if (cat.includes('fair') || cat.includes('cukup')) {
    return {
      text: '⚠️ Cukup',
      style: { backgroundColor: '#fff3cd', color: '#856404' }
    };
  } else {
    return {
      text: '🔴 Perlu Perhatian',
      style: { backgroundColor: '#fdecea', color: '#e74a3b' }
    };
  }
}

function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div style={styles.emptyState}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#2c3e50' }}>{title}</h3>
      <p style={{ margin: 0, color: '#6c757d', marginBottom: actionLabel ? '1.5rem' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button style={styles.btnPrimary} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6c757d' }}>Memuat dashboard...</p>
        </div>
      </div>
    </div>
  );
}

// ====================================
// STYLES
// ====================================

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f9fa',
    padding: '2rem 0',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 1rem',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6c757d',
    marginTop: '0.5rem',
    fontSize: '0.95rem',
  },
  btnLogout: {
    padding: '0.6rem 1.2rem',
    background: '#e74a3b',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  btnSecondaryLink: {
    padding: '0.6rem 1.2rem',
    background: 'white',
    color: '#4e73df',
    border: '1px solid #4e73df',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    display: 'inline-block',
    transition: 'all 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    borderRadius: 12,
    padding: '1.25rem 1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s',
    cursor: 'default',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#6c757d',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    color: 'white',
  },
  childrenSection: {
    marginTop: '2rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.3rem',
    color: '#2c3e50',
  },
  actionLink: {
    color: '#4e73df',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  childrenList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  childCard: {
    background: 'white',
    borderRadius: 12,
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr auto',
    gap: '1.5rem',
    alignItems: 'center',
    transition: 'box-shadow 0.2s',
  },
  childInfo: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
    background: '#4e73df',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  childName: {
    fontWeight: 600,
    fontSize: '1.1rem',
    color: '#2c3e50',
    marginBottom: '0.25rem',
  },
  childMeta: {
    fontSize: '0.85rem',
    color: '#6c757d',
    marginTop: '0.25rem',
  },
  childResults: {
    textAlign: 'center',
  },
  resultScore: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: 999,
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  resultDate: {
    fontSize: '0.8rem',
    color: '#adb5bd',
    marginTop: '0.5rem',
  },
  resultSummary: {
    fontSize: '0.85rem',
    color: '#6c757d',
    marginTop: '0.5rem',
    maxHeight: 40,
    overflow: 'hidden',
  },
  noScreening: {
    fontSize: '0.9rem',
    color: '#6c757d',
    fontStyle: 'italic',
  },
  childActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  btnPrimary: {
    padding: '0.6rem 1.2rem',
    background: '#4e73df',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    padding: '0.6rem 1.2rem',
    background: 'white',
    color: '#4e73df',
    border: '1px solid #4e73df',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    background: '#4e73df',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '1rem',
  },
  errorCard: {
    background: 'white',
    borderRadius: 12,
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyState: {
    background: 'white',
    borderRadius: 12,
    padding: '3rem 2rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
};

export default ParentDashboard;
