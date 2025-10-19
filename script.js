class NewsStreamApp {
  constructor() {
    // Performance tracking
    this.performanceMetrics = {
      startTime: performance.now(),
      lastInteraction: 0,
      feedbackBudget: 100,
      navigationBudget: 1000,
      loadingBudget: 10000
    };

    // Application state
    this.currentCategory = 'all';
    this.articles = [];
    this.allArticles = [];
    this.isLoading = false;
    this.loadedSources = 0;
    this.totalSources = 0;
    this.lastUpdateTime = null;

    // Content limits
    this.maxArticles = 50;
    this.maxCategoriesUser = 15;
    this.maxSourcesPerCategory = 5;
    this.maxArticlesPerSource = 2;

    // User preferences with localStorage persistence
    this.userPreferences = this.loadUserPreferences();

    // Fixed RSS sources with proper URLs
    this.defaultSources = {
      breaking: [
        { id: 'foxnews-breaking', name: 'Fox News', url: 'https://moxie.foxnews.com/google-publisher/latest.xml', verified: true },
        { id: 'ndtv', name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', verified: true },
        { id: 'bbc-breaking', name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', verified: true },
        { id: 'cnn-breaking', name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', verified: true }
      ],
      world: [
        { id: 'bbc-world', name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', verified: true },
        { id: 'foxnews-world', name: 'Fox News', url: 'https://moxie.foxnews.com/google-publisher/world.xml', verified: true},
        { id: 'guardian-world', name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', verified: true },
        { id: 'firstpost', name: 'First Post', url: 'https://www.firstpost.com/commonfeeds/v1/mfp/rss/world.xml', verified: true }
      ],
      politics: [
        { id: 'politico', name: 'Politico', url: 'https://www.politico.com/rss/politics08.xml', verified: true },
        { id: 'foxnews-politics', name: 'Fox News Politics', url: 'https://moxie.foxnews.com/google-publisher/politics.xml', verified: true },
        { id: 'npr-politics', name: 'NPR Politics', url: 'https://feeds.npr.org/1014/rss.xml', verified: true },
        { id: 'hill-politics', name: 'The Hill', url: 'https://thehill.com/rss/syndicator/19109', verified: true }
      ],
      business: [
        { id: 'yahoo-finance', name: 'Yahoo Finance', url: 'https://feeds.finance.yahoo.com/rss/2.0/headline', verified: true },
        { id: 'businessstandard-business', name: 'Business Standard', url: 'https://www.business-standard.com/rss/home_page_top_stories.rss', verified: true },
        { id: 'marketwatch', name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', verified: true },
        { id: 'firstpost-business', name: 'First Post', url: 'https://www.firstpost.com/commonfeeds/v1/mfp/rss/business.xml', verified: true }
      ],
      technology: [
        { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', verified: true },
        { id: 'theverge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', verified: true },
        { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', verified: true },
        { id: 'arstechnica', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', verified: true }
      ],
      sports: [
        { id: 'espn', name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', verified: true },
        { id: 'bbc-sport', name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', verified: true },
        { id: 'cbs-sports', name: 'CBS Sports', url: 'https://www.cbssports.com/rss/headlines/', verified: true }
      ]
    };

    // Category metadata
    this.categoryMetadata = {
      breaking: { name: 'Breaking News', icon: 'exclamation-circle', color: 'danger' },
      world: { name: 'World', icon: 'globe-alt', color: 'primary' },
      politics: { name: 'Politics', icon: 'library', color: 'secondary' },
      business: { name: 'Business', icon: 'briefcase', color: 'success' },
      technology: { name: 'Technology', icon: 'desktop-computer', color: 'primary' },
      sports: { name: 'Sports', icon: 'lightning-bolt', color: 'warning' }
    };

    // CORS proxy for RSS feeds
    this.corsProxy = 'https://api.allorigins.win/raw?url=';

    // Initialize application
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing NewsStream...');
      this.setupEventListeners();
      this.setupPerformanceMonitoring();
      this.updateActiveSourcesDisplay();
      await this.startProgressiveLoading();
      console.log('✅ NewsStream initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize NewsStream:', error);
    }
  }

  loadUserPreferences() {
    const defaults = {
      categories: ['breaking', 'world', 'business', 'technology'],
      sources: {
        breaking: ['foxnews-breaking', 'ndtv'],
        world: ['bbc-world', 'foxnews-world'],
        business: ['yahoo-finance', 'businessstandard-business'],
        technology: ['techcrunch', 'theverge']
      },
      customCategories: [],
      customSources: {}
    };

    try {
      const saved = localStorage.getItem('newsstream-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    }
    return defaults;
  }

  saveUserPreferences() {
    try {
      localStorage.setItem('newsstream-preferences', JSON.stringify(this.userPreferences));
      console.log('💾 Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      this.showNotification('Failed to save preferences', 'error');
    }
  }

  setupEventListeners() {
    // Settings modal controls - CORRECTED
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const cancelSettingsBtn = document.getElementById('cancelSettings');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');
    const settingsModal = document.getElementById('settingsModal');

    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSettings();
      });
    }

    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeSettings();
      });
    }

    if (cancelSettingsBtn) {
      cancelSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeSettings();
      });
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetSettings();
      });
    }

    // Close modal when clicking outside
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
          this.closeSettings();
        }
      });
    }

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSettings();
      }
    });

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshNews();
      });
    }

    // Custom category and source management
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addSourceBtn = document.getElementById('addSourceBtn');
    
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => {
        this.addCustomCategory();
      });
    }

    if (addSourceBtn) {
      addSourceBtn.addEventListener('click', () => {
        this.addCustomSource();
      });
    }

    this.setupCategoryListeners();
    console.log('🎧 Event listeners setup complete');
  }

  setupCategoryListeners() {
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        this.switchCategory(category);
      });

      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      });
    });
  }

  setupPerformanceMonitoring() {
    console.log('📊 Performance monitoring active');
  }

  // CORRECTED MODAL METHODS
  openSettings() {
    console.log('Opening settings modal...');
    const modal = document.getElementById('settingsModal');
    
    if (!modal) {
      console.error('Settings modal not found!');
      return;
    }
    
    // Show modal with proper display and opacity
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    
    // Populate with current settings
    this.populateSettingsModal();
    
    // Focus management
    setTimeout(() => {
      const firstInput = modal.querySelector('input, button');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  closeSettings() {
    console.log('Closing settings modal...');
    const modal = document.getElementById('settingsModal');
    
    if (!modal) return;
    
    // Hide modal
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    
    // Hide completely after animation
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }

  populateSettingsModal() {
    this.populateCategoryGrid();
    this.populateSourcesGrid();
    this.populateCustomLists();
    this.updateSelectionCounts();
  }

  populateCategoryGrid() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Add default categories
    Object.entries(this.categoryMetadata).forEach(([key, metadata]) => {
      const isSelected = this.userPreferences.categories.includes(key);
      const item = this.createCheckboxItem(key, metadata.name, 'Available categories', isSelected, false);
      item.classList.add('category-checkbox-item');
      item.querySelector('input').classList.add('category-checkbox');
      grid.appendChild(item);
    });
  }

  populateSourcesGrid() {
    const grid = document.getElementById('sourcesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    this.userPreferences.categories.forEach(category => {
      const categoryKey = category.replace(/\s+/g, '').toLowerCase();
      
      if (this.defaultSources[categoryKey]) {
        this.defaultSources[categoryKey].forEach(source => {
          const isSelected = (this.userPreferences.sources[categoryKey] || []).includes(source.id);
          const item = this.createCheckboxItem(source.id, source.name, `${category} • Verified source`, isSelected, false);
          item.classList.add('source-checkbox-item');
          item.querySelector('input').classList.add('source-checkbox');
          item.querySelector('input').setAttribute('data-category', categoryKey);
          grid.appendChild(item);
        });
      }
    });
  }

  createCheckboxItem(value, label, description, checked, isCustom) {
    const item = document.createElement('label');
    item.className = 'checkbox-item';
    
    if (isCustom) {
      item.setAttribute('data-custom', 'true');
    }

    item.innerHTML = `
      <input type="checkbox" value="${value}" ${checked ? 'checked' : ''}>
      <div>
        <div class="checkbox-label">${label}</div>
        <div class="checkbox-description">${description}</div>
      </div>
    `;

    return item;
  }

  populateCustomLists() {
    // Populate custom categories list
    const categoriesList = document.getElementById('customCategoriesList');
    if (categoriesList) {
      categoriesList.innerHTML = '';
    }

    // Populate custom sources list  
    const sourcesList = document.getElementById('customSourcesList');
    if (sourcesList) {
      sourcesList.innerHTML = '';
    }

    // Populate category select
    const select = document.getElementById('customSourceCategory');
    if (select) {
      select.innerHTML = '<option value="">Select category</option>';
      this.userPreferences.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = this.categoryMetadata[category]?.name || category;
        select.appendChild(option);
      });
    }
  }

  updateSelectionCounts() {
    const categoriesCount = document.getElementById('selectedCategoriesCount');
    const sourcesCount = document.getElementById('selectedSourcesCount');
    
    if (categoriesCount) {
      categoriesCount.textContent = this.userPreferences.categories.length;
    }
    
    if (sourcesCount) {
      const totalSources = Object.values(this.userPreferences.sources)
        .reduce((sum, sources) => sum + sources.length, 0);
      sourcesCount.textContent = totalSources;
    }
  }

  saveSettings() {
    // Collect selected categories
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
      .map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
      this.showNotification('Please select at least 1 category', 'error');
      return;
    }
    
    // Collect selected sources by category
    const selectedSources = {};
    selectedCategories.forEach(category => {
      const categorySources = Array.from(document.querySelectorAll(`.source-checkbox[data-category="${category}"]:checked`))
        .map(cb => cb.value);
      
      if (categorySources.length > 0) {
        selectedSources[category] = categorySources;
      }
    });
    
    // Update preferences
    this.userPreferences.categories = selectedCategories;
    this.userPreferences.sources = selectedSources;
    
    // Save preferences
    this.saveUserPreferences();
    
    // Close modal
    this.closeSettings();
    
    // Update UI and refresh news
    this.updateActiveSourcesDisplay();
    this.showNotification('Settings saved! Refreshing news...', 'success');
    
    // Refresh news with new settings
    setTimeout(() => {
      this.refreshNews();
    }, 500);
  }

  resetSettings() {
    this.userPreferences = {
      categories: ['breaking', 'world', 'business', 'technology'],
      sources: {
        breaking: ['foxnews-breaking', 'ndtv'],
        world: ['bbc-world', 'foxnews-world'],
        business: ['yahoo-finance', 'businessstandard-business'],
        technology: ['techcrunch', 'theverge']
      },
      customCategories: [],
      customSources: {}
    };
    this.saveUserPreferences();
    this.populateSettingsModal();
    this.showNotification('Settings reset to defaults', 'info');
  }

  addCustomCategory() {
    const input = document.getElementById('customCategoryInput');
    const name = input.value.trim();
    
    if (!name) {
      this.showNotification('Please enter a category name', 'warning');
      input.focus();
      return;
    }
    
    this.userPreferences.customCategories.push(name);
    input.value = '';
    this.saveUserPreferences();
    this.populateCustomLists();
    this.populateCategoryGrid();
    this.showNotification(`Added custom category: ${name}`, 'success');
  }

  addCustomSource() {
    this.showNotification('Custom source functionality coming soon', 'info');
  }

  refreshNews() {
    console.log('🔄 Refreshing news...');
    this.startProgressiveLoading();
  }

  switchCategory(category) {
    if (this.currentCategory === category) return;

    console.log(`🔄 Switching to category: ${category}`);
    this.currentCategory = category;
    this.updateCategoryUI(category);
    this.filterAndDisplayArticles();
  }

  updateCategoryUI(activeCategory) {
    document.querySelectorAll('.category-tab').forEach(tab => {
      const isActive = tab.dataset.category === activeCategory;
      tab.classList.toggle('category-tab--active', isActive);
      tab.setAttribute('aria-pressed', isActive);
    });
  }

  async startProgressiveLoading() {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      this.updateProgressBar(0);
      this.updateLoadingStatus('Initializing news sources...');

      const activeSources = this.getActiveSources();
      this.totalSources = activeSources.length;

      if (this.totalSources === 0) {
        console.log('No active sources configured');
        return;
      }

      console.log(`📡 Loading news from ${this.totalSources} sources`);

      this.allArticles = [];
      this.loadedSources = 0;

      const loadPromises = activeSources.map((source, index) => 
        this.loadSourceWithDelay(source, index * 200)
      );

      await Promise.allSettled(loadPromises);

      this.processAllArticles();
      this.updateCategoryButtons();
      this.filterAndDisplayArticles();
      this.lastUpdateTime = new Date();
      this.updateLastUpdatedTime();

      if (this.allArticles.length > 0) {
        this.showNotification(`Loaded ${this.allArticles.length} articles from ${this.totalSources} sources`, 'success');
      }

    } catch (error) {
      console.error('❌ Failed to load news:', error);
    } finally {
      this.isLoading = false;
      this.updateProgressBar(100);
      setTimeout(() => this.updateProgressBar(0), 1000);
    }
  }

  async loadSourceWithDelay(source, delay) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return this.loadSingleSource(source);
  }

  async loadSingleSource(source) {
    try {
      this.updateLoadingStatus(`Loading ${source.name}...`);

      const response = await fetch(`${this.corsProxy}${encodeURIComponent(source.url)}`, {
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const articles = this.parseRSSFeed(xmlText, source);

      if (articles.length > 0) {
        const limitedArticles = articles.slice(0, this.maxArticlesPerSource);
        this.allArticles.push(...limitedArticles);
        console.log(`📰 Loaded ${limitedArticles.length} articles from ${source.name}`);
      }

      this.loadedSources++;
      this.updateProgressBar((this.loadedSources / this.totalSources) * 100);

      return articles;

    } catch (error) {
      console.error(`❌ Failed to load ${source.name}:`, error);
      this.loadedSources++;
      this.updateProgressBar((this.loadedSources / this.totalSources) * 100);
      return [];
    }
  }

  parseRSSFeed(xmlText, source) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing failed');
      }

      const items = xmlDoc.querySelectorAll('item');
      const articles = [];

      items.forEach((item, index) => {
        if (index < 10) {
          const article = this.extractArticleFromItem(item, source);
          if (article) {
            articles.push(article);
          }
        }
      });

      return articles;

    } catch (error) {
      console.error('RSS parsing failed:', error);
      return [];
    }
  }

  extractArticleFromItem(item, source) {
    try {
      const title = this.getElementText(item, 'title');
      const description = this.getElementText(item, 'description');
      const link = this.getElementText(item, 'link') || this.getElementText(item, 'guid');
      const pubDate = this.getElementText(item, 'pubDate');

      if (!title || !link) {
        return null;
      }

      const imageUrl = this.extractImageUrl(item, description);

      return {
        id: this.generateArticleId(title, link),
        title: this.sanitizeText(title),
        summary: this.sanitizeText(description) || this.generateSummary(title),
        url: this.sanitizeUrl(link),
        imageUrl: imageUrl,
        publishedAt: this.parseDate(pubDate),
        source: {
          id: source.id,
          name: source.name,
          verified: source.verified || false,
          isCustom: source.isCustom || false
        },
        category: source.category,
        loadedAt: Date.now()
      };

    } catch (error) {
      console.error('Failed to extract article:', error);
      return null;
    }
  }

  getElementText(parent, tagName) {
    const element = parent.querySelector(tagName);
    return element ? element.textContent.trim() : '';
  }

  extractImageUrl(item, description) {
    // Try media:content or media:thumbnail
    let mediaContent = item.querySelector('content, thumbnail');
    if (mediaContent) {
      const url = mediaContent.getAttribute('url');
      if (url && this.isValidImageUrl(url)) {
        return url;
      }
    }

    // Try enclosure
    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
      const url = enclosure.getAttribute('url');
      if (url && this.isValidImageUrl(url)) {
        return url;
      }
    }

    // Try to extract from description
    if (description) {
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && this.isValidImageUrl(imgMatch[1])) {
        return imgMatch[1];
      }
    }

    return null;
  }

  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname);
    } catch {
      return false;
    }
  }

  generateArticleId(title, url) {
    const combined = (title + url).toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  sanitizeText(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:' ? urlObj.toString() : null;
    } catch {
      return null;
    }
  }

  parseDate(dateString) {
    if (!dateString) return new Date().toISOString();
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  generateSummary(title) {
    return title.length > 100 ? title.substring(0, 100) + '...' : title;
  }

  getActiveSources() {
    const sources = [];

    this.userPreferences.categories.forEach(category => {
      const categoryKey = category.replace(/\s+/g, '').toLowerCase();

      if (this.defaultSources[categoryKey]) {
        const selectedSources = this.userPreferences.sources[categoryKey] || [];
        this.defaultSources[categoryKey].forEach(source => {
          if (selectedSources.includes(source.id)) {
            sources.push({
              ...source,
              category: categoryKey,
              isCustom: false
            });
          }
        });
      }
    });

    return sources;
  }

  processAllArticles() {
    const uniqueArticles = this.deduplicateArticles(this.allArticles);
    uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    this.articles = uniqueArticles.slice(0, this.maxArticles);

    console.log(`📊 Processed ${this.articles.length} unique articles from ${this.allArticles.length} total`);
  }

  deduplicateArticles(articles) {
    const seen = new Set();
    const unique = [];

    articles.forEach(article => {
      const key = article.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50);

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    });

    return unique;
  }

  filterAndDisplayArticles() {
    let filteredArticles = this.articles;

    if (this.currentCategory !== 'all') {
      filteredArticles = this.articles.filter(article => 
        article.category === this.currentCategory
      );
    }

    console.log(`🎯 Displaying ${filteredArticles.length} articles for category: ${this.currentCategory}`);
    this.displayArticles(filteredArticles);
    this.updateArticleCount(filteredArticles.length);
  }

  displayArticles(articles) {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.style.display = 'grid';
    newsGrid.innerHTML = '';

    articles.forEach((article, index) => {
      setTimeout(() => {
        const articleElement = this.createArticleElement(article);
        newsGrid.appendChild(articleElement);
      }, index * 50);
    });
  }

  createArticleElement(article) {
    const articleElement = document.createElement('article');
    articleElement.className = 'news-card';
    articleElement.setAttribute('data-article-id', article.id);

    const timeAgo = this.getTimeAgo(article.publishedAt);
    const categoryClass = article.category === 'breaking' ? 'news-card__category--breaking' : '';
    const customSourceAttr = article.source.isCustom ? 'data-custom="true"' : '';

    articleElement.innerHTML = `
      ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" class="news-card__image" loading="lazy">` : ''}
      <div class="news-card__content">
        <span class="news-card__category ${categoryClass}">${this.categoryMetadata[article.category]?.name || article.category}</span>
        <h3 class="news-card__title">
          <a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a>
        </h3>
        <p class="news-card__summary">${article.summary}</p>
        <div class="news-card__meta">
          <span class="news-card__source" ${customSourceAttr}>${article.source.name}</span>
          <span class="news-card__time">${timeAgo}</span>
        </div>
      </div>
    `;

    return articleElement;
  }

  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  updateActiveSourcesDisplay() {
    this.updateCategoryButtons();
  }

  updateCategoryButtons() {
    const categoryNav = document.querySelector('.category-nav__container');
    if (!categoryNav) return;

    // Clear existing buttons except "All News"
    const allNewsTab = categoryNav.querySelector('[data-category="all"]');
    categoryNav.innerHTML = '';
    if (allNewsTab) {
      categoryNav.appendChild(allNewsTab);
    }

    // Add category buttons based on user preferences
    this.userPreferences.categories.forEach(category => {
      const categoryKey = category.replace(/\s+/g, '').toLowerCase();
      const metadata = this.categoryMetadata[categoryKey];
      
      if (metadata) {
        const tab = this.createCategoryTab(categoryKey, metadata.name, false);
        categoryNav.appendChild(tab);
      }
    });

    this.setupCategoryListeners();
  }

  createCategoryTab(categoryKey, displayName, isCustom) {
    const tab = document.createElement('button');
    tab.className = 'category-tab';
    tab.setAttribute('data-category', categoryKey);
    tab.setAttribute('aria-pressed', 'false');
    
    if (isCustom) {
      tab.setAttribute('data-custom', 'true');
    }

    tab.innerHTML = `
      <svg class="icon__heroicon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/>
      </svg>
      <span>${displayName}</span>
    `;

    return tab;
  }

  updateLastUpdatedTime() {
    const element = document.getElementById('lastUpdated');
    if (element && this.lastUpdateTime) {
      element.textContent = `Last updated: ${this.lastUpdateTime.toLocaleTimeString()}`;
    }
  }

  updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.transform = `scaleX(${percentage / 100})`;
    }
  }

  updateLoadingStatus(message) {
    const element = document.getElementById('loadingText');
    if (element) {
      element.textContent = message;
    }
  }

  updateArticleCount(count) {
    const element = document.getElementById('articleCount');
    if (element) {
      element.textContent = `${count} article${count !== 1 ? 's' : ''}`;
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#059669' : 
                   type === 'error' ? '#dc2626' : 
                   type === 'warning' ? '#d97706' : '#2563eb'};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10000;
      max-width: 300px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌐 DOM loaded, initializing NewsStream...');
  
  try {
    window.newsApp = new NewsStreamApp();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});
