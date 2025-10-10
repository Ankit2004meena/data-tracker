import React, { useState, useEffect, createContext, useContext } from 'react';
import { Code, CheckCircle, Circle, Search, Plus, Trash2, Download, Upload, Home, Settings, ChevronDown, ChevronRight, ExternalLink, Loader, AlertCircle } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service
const api = {
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  },

  async createCategory(data) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }
    return response.json();
  },

  async updateCategory(id, data) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  async deleteCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },

  async addSubcategory(categoryId, data) {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add subcategory');
    return response.json();
  },

  async deleteSubcategory(categoryId, subcategoryId) {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete subcategory');
    return response.json();
  },

  async addQuestion(categoryId, subcategoryId, data) {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add question');
    return response.json();
  },

  async updateQuestion(categoryId, subcategoryId, questionId, data) {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update question');
    return response.json();
  },

  async deleteQuestion(categoryId, subcategoryId, questionId) {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}/questions/${questionId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete question');
    return response.json();
  },

  async importData(data) {
    const response = await fetch(`${API_BASE_URL}/categories/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to import data');
    return response.json();
  },

  async seedData() {
    const response = await fetch(`${API_BASE_URL}/seed`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to seed data');
    return response.json();
  }
};

// Data Context
const DataContext = createContext();

const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

// Data Provider Component
const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const categories = await api.getCategories();
      setData(categories);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateQuestionSolved = async (categoryId, subcategoryId, questionId, solved) => {
    try {
      await api.updateQuestion(categoryId, subcategoryId, questionId, { solved });
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addCategory = async (category) => {
    try {
      setError(null);
      await api.createCategory(category);
      await fetchData();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateCategory = async (categoryId, updates) => {
    try {
      await api.updateCategory(categoryId, updates);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await api.deleteCategory(categoryId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addSubcategory = async (categoryId, subcategory) => {
    try {
      await api.addSubcategory(categoryId, subcategory);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSubcategory = async (categoryId, subcategoryId) => {
    try {
      await api.deleteSubcategory(categoryId, subcategoryId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addQuestion = async (categoryId, subcategoryId, question) => {
    try {
      await api.addQuestion(categoryId, subcategoryId, question);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateQuestion = async (categoryId, subcategoryId, questionId, updates) => {
    try {
      await api.updateQuestion(categoryId, subcategoryId, questionId, updates);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteQuestion = async (categoryId, subcategoryId, questionId) => {
    try {
      await api.deleteQuestion(categoryId, subcategoryId, questionId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const importData = async (newData) => {
    try {
      await api.importData(newData);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const seedDatabase = async () => {
    try {
      await api.seedData();
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      loading,
      error,
      fetchData,
      updateQuestionSolved,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubcategory,
      deleteSubcategory,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      importData,
      seedDatabase
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
      <p className="text-red-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

// Router Component
const Router = ({ children }) => {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  return children({ route, navigate });
};

// Home Page
const HomePage = ({ navigate }) => {
  const { data, loading, seedDatabase } = useData();

  const getCategoryStats = (category) => {
    const total = category.subcategories.reduce((acc, sub) => acc + sub.questions.length, 0);
    const solved = category.subcategories.reduce((acc, sub) => 
      acc + sub.questions.filter(q => q.solved).length, 0
    );
    return { total, solved, percentage: total > 0 ? Math.round((solved / total) * 100) : 0 };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">DSA Tracker</h1>
          <p className="text-xl text-gray-600">Master Data Structures & Algorithms</p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Yet</h3>
            <p className="text-gray-500 mb-6">Get started by seeding sample data or adding your own categories</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={seedDatabase}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Seed Sample Data
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Go to Admin Panel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(category => {
              const stats = getCategoryStats(category);
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                  onClick={() => navigate(`/category/${category.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                      <Code className="w-8 h-8 text-indigo-600" />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{stats.solved}/{stats.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-sm font-semibold text-indigo-600 mt-1">
                        {stats.percentage}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      {category.subcategories.slice(0, 3).map(sub => (
                        <div key={sub.id} className="flex items-center text-sm text-gray-600">
                          <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{sub.name}</span>
                          <span className="ml-auto text-gray-400">({sub.questions.length})</span>
                        </div>
                      ))}
                      {category.subcategories.length > 3 && (
                        <div className="text-sm text-gray-400">
                          +{category.subcategories.length - 3} more
                        </div>
                      )}
                    </div>

                    <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
                      Open Category
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Category Page
const CategoryPage = ({ categoryId, navigate }) => {
  const { data, updateQuestionSolved, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [expandedSubs, setExpandedSubs] = useState({});

  const category = data.find(cat => cat.id === categoryId);

  if (loading) return <LoadingSpinner />;

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const toggleSubcategory = (subId) => {
    setExpandedSubs(prev => ({ ...prev, [subId]: !prev[subId] }));
  };

  const filterQuestions = (questions) => {
    return questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    difficultyFilter === diff
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {category.subcategories.map(subcategory => {
            const filteredQuestions = filterQuestions(subcategory.questions);
            const isExpanded = expandedSubs[subcategory.id];

            return (
              <div key={subcategory.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSubcategory(subcategory.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600 mr-3" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600 mr-3" />
                    )}
                    <h3 className="text-xl font-semibold text-gray-900">{subcategory.name}</h3>
                    <span className="ml-3 text-sm text-gray-500">
                      ({filteredQuestions.filter(q => q.solved).length}/{filteredQuestions.length})
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t divide-y">
                    {filteredQuestions.map(question => (
                      <div
                        key={question.id}
                        className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                      >
                        <button
                          onClick={() => updateQuestionSolved(
                            category.id,
                            subcategory.id,
                            question.id,
                            !question.solved
                          )}
                          className="flex-shrink-0"
                        >
                          {question.solved ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${question.solved ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {question.title}
                          </h4>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>

                        {question.link && (
                          <a
                            href={question.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    ))}

                    {filteredQuestions.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No questions match your filters
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Admin Page
const AdminPage = ({ navigate }) => {
  const { data, addCategory, deleteCategory, addSubcategory, deleteSubcategory, addQuestion, deleteQuestion, importData } = useData();
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [notification, setNotification] = useState(null);

  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionLink, setQuestionLink] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('Easy');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      showNotification('Category name is required', 'error');
      return;
    }
    const id = `cat-${Date.now()}`;
    const result = await addCategory({ id, name: categoryName });
    if (result.success) {
      setCategoryName('');
      showNotification('Category added successfully!');
    } else {
      showNotification(result.error || 'Failed to add category', 'error');
    }
  };

  const handleAddSubcategory = async () => {
    if (!subcategoryName.trim() || !selectedCategory) {
      showNotification('Subcategory name and category are required', 'error');
      return;
    }
    const id = `sub-${Date.now()}`;
    await addSubcategory(selectedCategory, { id, name: subcategoryName });
    setSubcategoryName('');
    showNotification('Subcategory added successfully!');
  };

  const handleAddQuestion = async () => {
    if (!questionTitle.trim() || !selectedCategory || !selectedSubcategory) {
      showNotification('Question title, category, and subcategory are required', 'error');
      return;
    }
    const id = `q-${Date.now()}`;
    await addQuestion(selectedCategory, selectedSubcategory, {
      id,
      title: questionTitle,
      link: questionLink,
      difficulty: questionDifficulty
    });
    setQuestionTitle('');
    setQuestionLink('');
    showNotification('Question added successfully!');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dsa-sheet-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (confirm('This will replace all current data. Continue?')) {
          await importData(imported);
          showNotification('Data imported successfully!');
        }
      } catch (error) {
        showNotification('Error importing file. Please check the format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium animate-fade-in`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {['categories', 'subcategories', 'questions', 'import'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'categories' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Category
                  </button>
                </div>

                <div className="space-y-2">
                  {data.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">{cat.name}</span>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete category "${cat.name}"?`)) {
                            await deleteCategory(cat.id);
                            showNotification('Category deleted successfully!');
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'subcategories' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Manage Subcategories</h2>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {data.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {selectedCategory && (
                  <>
                    <div className="flex gap-4 mb-6">
                      <input
                        type="text"
                        placeholder="Subcategory name"
                        value={subcategoryName}
                        onChange={(e) => setSubcategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory()}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleAddSubcategory}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Subcategory
                      </button>
                    </div>

                    <div className="space-y-2">
                      {data.find(c => c.id === selectedCategory)?.subcategories.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">{sub.name}</span>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete subcategory "${sub.name}"?`)) {
                                await deleteSubcategory(selectedCategory, sub.id);
                                showNotification('Subcategory deleted successfully!');
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Manage Questions</h2>
                <div className="space-y-4 mb-6">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory('');
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {data.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  {selectedCategory && (
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Subcategory</option>
                      {data.find(c => c.id === selectedCategory)?.subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  )}

                  {selectedSubcategory && (
                    <>
                      <input
                        type="text"
                        placeholder="Question title"
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Question link (optional)"
                        value={questionLink}
                        onChange={(e) => setQuestionLink(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={questionDifficulty}
                        onChange={(e) => setQuestionDifficulty(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <button
                        onClick={handleAddQuestion}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Question
                      </button>
                    </>
                  )}
                </div>

                {selectedSubcategory && (
                  <div className="space-y-2">
                    {data.find(c => c.id === selectedCategory)?.subcategories
                      .find(s => s.id === selectedSubcategory)?.questions.map(q => (
                        <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{q.title}</div>
                            <div className="text-sm text-gray-500">{q.difficulty}</div>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete question "${q.title}"?`)) {
                                await deleteQuestion(selectedCategory, selectedSubcategory, q.id);
                                showNotification('Question deleted successfully!');
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'import' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Import/Export Data</h2>
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={handleExport}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Export Data as JSON
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Download all your data as a JSON file for backup
                    </p>
                  </div>

                  <div>
                    <label className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-5 h-5" />
                      Import Data from JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a JSON file to replace current data
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> Importing will replace all current data. Make sure to export first!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Bar
const Navbar = ({ navigate, currentRoute }) => {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xl font-bold text-indigo-600"
          >
            <Code className="w-6 h-6" />
            DSA Tracker
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentRoute === '/' || currentRoute.startsWith('/category')
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentRoute === '/admin'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
export default function App() {
  return (
    <DataProvider>
      <Router>
        {({ route, navigate }) => {
          const routeParts = route.split('/');
          
          return (
            <div className="min-h-screen bg-gray-50">
              <Navbar navigate={navigate} currentRoute={route} />
              
              {route === '/' && <HomePage navigate={navigate} />}
              
              {route.startsWith('/category/') && (
                <CategoryPage 
                  categoryId={routeParts[2]} 
                  navigate={navigate}
                />
              )}
              
              {route === '/admin' && <AdminPage navigate={navigate} />}
            </div>
          );
        }}
      </Router>
    </DataProvider>
  );
}