import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';

function EducationPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, currentPage]);

  const loadCategories = async () => {
    try {
      const response = await articleService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage
      };
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }

      const response = await articleService.getArticles(params);
      if (response.success) {
        setArticles(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50', marginBottom: '0.5rem' }}>
            📚 Edukasi Postur Anak
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>
            Artikel dan panduan untuk kesehatan postur tubuh anak
          </p>
        </div>

        {/* Category Filter */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleCategoryChange(null)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 20,
                border: selectedCategory === null ? '2px solid #4e73df' : '2px solid #dee2e6',
                background: selectedCategory === null ? '#4e73df' : 'white',
                color: selectedCategory === null ? 'white' : '#495057',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
            >
              Semua Artikel
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 20,
                  border: selectedCategory === category.id ? '2px solid #4e73df' : '2px solid #dee2e6',
                  background: selectedCategory === category.id ? '#4e73df' : 'white',
                  color: selectedCategory === category.id ? 'white' : '#495057',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.3s'
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <p style={{ color: '#6c757d', marginTop: '1rem' }}>Loading articles...</p>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Belum ada artikel</h3>
            <p style={{ color: '#6c757d' }}>Artikel untuk kategori ini akan segera hadir!</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem',
            marginTop: '2rem'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: '1px solid #dee2e6',
                background: currentPage === 1 ? '#f8f9fa' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              Previous
            </button>
            
            <span style={{ 
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              color: '#495057'
            }}>
              Page {currentPage} of {pagination.last_page}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
              disabled={currentPage === pagination.last_page}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: '1px solid #dee2e6',
                background: currentPage === pagination.last_page ? '#f8f9fa' : 'white',
                cursor: currentPage === pagination.last_page ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Article Card Component
function ArticleCard({ article }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to={`/education/${article.slug}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.3s',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        {article.thumbnail ? (
          <img 
            src={article.thumbnail} 
            alt={article.title}
            style={{
              width: '100%',
              height: 200,
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: 200,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem'
          }}>
            📄
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Category Badge */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{
              background: '#f0f0f0',
              padding: '0.25rem 0.75rem',
              borderRadius: 12,
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#495057'
            }}>
              {article.category.icon} {article.category.name}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '0.5rem',
            lineHeight: 1.4
          }}>
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p style={{
              color: '#6c757d',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '1rem',
              flex: 1
            }}>
              {article.excerpt.substring(0, 120)}...
            </p>
          )}

          {/* Meta */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: '#6c757d',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <span>⏱ {article.read_time} min read</span>
            <span>👁 {article.views} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default EducationPage;
