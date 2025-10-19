/**
 * NewsStream - Real-Time News Aggregation Application
 * 
 * Features:
 * - Progressive loading with performance budgets
 * - Customizable categories (up to 15) and sources (up to 5 per category)
 * - Real-time RSS feed aggregation
 * - WCAG AA accessibility compliance
 * - Apple-inspired minimalist design
 * - Maximum 50 articles total with smart limits
 * - No empty states or error messages shown to users
 */
/**
 * NewsStream - Real-Time News Aggregation Application
 * Fixed RSS URLs and consistent UI handling for custom items
 */

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
    
    // Rate limiting
    this.lastFetchTime = 0;
    this.minFetchInterval = 30000;
    
    // Initialize application
    this.init();
  }
  
  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing NewsStream...');
      
      // Hide all error/empty states immediately
      this.hideAllEmptyStates();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      // Update UI with user preferences
      this.updateActiveSourcesDisplay();
      
      // Start progressive news loading
      await this.startProgressiveLoading();
      
      console.log('✅ NewsStream initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize NewsStream:', error);
    }
  }
  
  /**
   * Hide all empty states and error messages
   */
  hideAllEmptyStates() {
    const elementsToHide = ['loadingState', 'errorState', 'noResults'];
    
    elementsToHide.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'none';
        element.setAttribute('aria-hidden', 'true');
      }
    });
    
    // Always show news grid
    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) {
      newsGrid.style.display = 'grid';
    }
  }
  
  /**
   * Load user preferences from localStorage with defaults
   */
  loadUserPreferences() {
    const defaults = {
      categories: ['breaking', 'world', 'business', 'technology'],
      sources: {
        breaking: ['foxnews-breaking', 'ap-breaking'],
        world: ['bbc-world', 'foxnews-world'],
        business: ['yahoo-finance', 'businessnewsstandard-business'],
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
  
  /**
   * Save user preferences to localStorage
   */
  saveUserPreferences() {
    try {
      localStorage.setItem('newsstream-preferences', JSON.stringify(this.userPreferences));
      console.log('💾 Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      this.showNotification('Failed to save preferences', 'error');
    }
  }
  
  /**
   * Setup all event listeners with performance timing
   */
  setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', (e) => {
      this.trackInteractionTime('refresh-click', () => {
        this.refreshNews();
      });
    });
    
    // Settings modal controls
    document.getElementById('settingsBtn').addEventListener('click', (e) => {
      this.trackInteractionTime('settings-open', () => {
        this.openSettings();
      });
    });
    
    document.getElementById('closeSettings').addEventListener('click', () => {
      this.closeSettings();
    });
    
    document.getElementById('cancelSettings').addEventListener('click', () => {
      this.closeSettings();
    });
    
    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveSettings();
    });
    
    document.getElementById('resetSettings').addEventListener('click', () => {
      this.resetSettings();
    });
    
    // Custom category and source management
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
      this.addCustomCategory();
    });
    
    document.getElementById('addSourceBtn').addEventListener('click', () => {
      this.addCustomSource();
    });
    
    // Modal overlay click to close
    document.getElementById('settingsModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeSettings();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSettings();
      }
    });
    
    // Setup initial category listeners
    this.setupCategoryListeners();
    
    console.log('🎧 Event listeners setup complete');
  }
  
  /**
   * Setup category navigation listeners (works for both built-in and custom)
   */
  setupCategoryListeners() {
    document.querySelectorAll('.category-tab').forEach(tab => {
      // Remove existing listeners to prevent duplicates
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      newTab.addEventListener('click', (e) => {
        this.trackInteractionTime('category-switch', () => {
          const category = e.currentTarget.dataset.category;
          this.switchCategory(category);
        });
      });
      
      // Keyboard accessibility
      newTab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      });
    });
  }
  
  /**
   * Setup performance monitoring and budget enforcement
   */
  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        // Longtask not supported, continue silently
      }
    }
    
    console.log('📊 Performance monitoring active');
  }
  
  /**
   * Track interaction timing for performance budgets
   */
  trackInteractionTime(action, callback) {
    const startTime = performance.now();
    this.performanceMetrics.lastInteraction = startTime;
    
    try {
      const result = callback();
      
      if (result instanceof Promise) {
        result.finally(() => {
          const duration = performance.now() - startTime;
          this.logPerformanceMetric(action, duration);
        });
      } else {
        const duration = performance.now() - startTime;
        this.logPerformanceMetric(action, duration);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.logPerformanceMetric(action, duration, error);
      throw error;
    }
  }
  
  /**
   * Log performance metrics and check budgets
   */
  logPerformanceMetric(action, duration, error = null) {
    const budgets = {
      'refresh-click': this.performanceMetrics.feedbackBudget,
      'settings-open': this.performanceMetrics.feedbackBudget,
      'category-switch': this.performanceMetrics.feedbackBudget,
      'news-load': this.performanceMetrics.loadingBudget
    };
    
    const budget = budgets[action] || this.performanceMetrics.feedbackBudget;
    const status = duration <= budget ? '✅' : '⚠️';
    
    console.log(`${status} ${action}: ${duration.toFixed(2)}ms (budget: ${budget}ms)`);
    
    if (duration > budget) {
      console.warn(`Performance budget exceeded for ${action}`);
    }
    
    if (error) {
      console.error(`Error in ${action}:`, error);
    }
  }
  
  /**
   * Switch active category with performance tracking
   */
  switchCategory(category) {
    if (this.currentCategory === category) return;
    
    console.log(`🔄 Switching to category: ${category}`);
    
    this.currentCategory = category;
    this.updateCategoryUI(category);
    this.filterAndDisplayArticles();
    
    // Update URL without navigation (for bookmarking)
    if (history.replaceState) {
      const url = new URL(window.location);
      url.searchParams.set('category', category);
      history.replaceState(null, '', url);
    }
  }
  
  /**
   * Update category navigation UI
   */
  updateCategoryUI(activeCategory) {
    document.querySelectorAll('.category-tab').forEach(tab => {
      const isActive = tab.dataset.category === activeCategory;
      tab.classList.toggle('category-tab--active', isActive);
      tab.setAttribute('aria-pressed', isActive);
    });
  }
  
  /**
   * Start progressive loading of news articles
   */
  async startProgressiveLoading() {
    if (this.isLoading) return;
    
    const startTime = performance.now();
    this.isLoading = true;
    
    try {
      this.updateProgressBar(0);
      this.updateLoadingStatus('Initializing news sources...');
      
      // Get active sources based on user preferences
      const activeSources = this.getActiveSources();
      this.totalSources = activeSources.length;
      
      if (this.totalSources === 0) {
        console.log('No active sources configured');
        return;
      }
      
      console.log(`📡 Loading news from ${this.totalSources} sources`);
      
      // Reset articles
      this.allArticles = [];
      this.loadedSources = 0;
      
      // Progressive loading with small delays to prevent blocking
      const loadPromises = activeSources.map((source, index) => 
        this.loadSourceWithDelay(source, index * 200)
      );
      
      // Wait for all sources to complete
      await Promise.allSettled(loadPromises);
      
      // Process and display articles
      this.processAllArticles();
      this.updateCategoryButtons();
      this.filterAndDisplayArticles();
      
      this.lastUpdateTime = new Date();
      this.updateLastUpdatedTime();
      
      const duration = performance.now() - startTime;
      this.logPerformanceMetric('news-load', duration);
      
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
  
  /**
   * Load source with delay for progressive enhancement
   */
  async loadSourceWithDelay(source, delay) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return this.loadSingleSource(source);
  }
  
  /**
   * Load articles from a single RSS source
   */
  async loadSingleSource(source) {
    try {
      this.updateLoadingStatus(`Loading ${source.name}...`);
      
      const response = await fetch(`${this.corsProxy}${encodeURIComponent(source.url)}`, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
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
  
  /**
   * Parse RSS feed XML and extract articles
   */
  parseRSSFeed(xmlText, source) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parsing errors
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
  
  /**
   * Extract article data from RSS item
   */
  extractArticleFromItem(item, source) {
    try {
      const title = this.getElementText(item, 'title');
      const description = this.getElementText(item, 'description');
      const link = this.getElementText(item, 'link') || this.getElementText(item, 'guid');
      const pubDate = this.getElementText(item, 'pubDate');
      
      if (!title || !link) {
        return null;
      }
      
      // Extract image from description or enclosure
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
  
  /**
   * Get text content from XML element
   */
  getElementText(parent, tagName) {
    const element = parent.querySelector(tagName);
    return element ? element.textContent.trim() : '';
  }
  
  /**
   * Extract image URL from RSS item
   */
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
  
  /**
   * Validate image URL
   */
  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && 
             /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname);
    } catch {
      return false;
    }
  }
  
  /**
   * Generate unique article ID
   */
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
  
  /**
   * Sanitize text content
   */
  sanitizeText(text) {
    if (!text) return '';
    
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Sanitize and validate URLs
   */
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:' 
        ? urlObj.toString() 
        : null;
    } catch {
      return null;
    }
  }
  
  /**
   * Parse date string to ISO format
   */
  parseDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  
  /**
   * Generate summary from title if description not available
   */
  generateSummary(title) {
    return title.length > 100 ? title.substring(0, 100) + '...' : title;
  }
  
  /**
   * Get active sources based on user preferences
   */
  getActiveSources() {
    const sources = [];
    
    this.userPreferences.categories.forEach(category => {
      const categoryKey = category.replace(/\s+/g, '').toLowerCase();
      
      // Add default sources for this category
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
      
      // Add custom sources for this category
      if (this.userPreferences.customSources[categoryKey]) {
        this.userPreferences.customSources[categoryKey].forEach(customSource => {
          sources.push({
            ...customSource,
            category: categoryKey,
            verified: false,
            isCustom: true
          });
        });
      }
    });
    
    return sources;
  }
  
  /**
   * Process all loaded articles with deduplication and limits
   */
  processAllArticles() {
    // Remove duplicates based on title similarity
    const uniqueArticles = this.deduplicateArticles(this.allArticles);
    
    // Sort by publish date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Apply global article limit
    this.articles = uniqueArticles.slice(0, this.maxArticles);
    
    console.log(`📊 Processed ${this.articles.length} unique articles from ${this.allArticles.length} total`);
  }
  
  /**
   * Remove duplicate articles based on title similarity
   */
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
  
  /**
   * Filter and display articles based on current category
   */
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
  
  /**
   * Display articles in the news grid
   */
  displayArticles(articles) {
    const newsGrid = document.getElementById('newsGrid');
    
    // Always show news grid
    newsGrid.style.display = 'grid';
    
    // Clear existing articles
    newsGrid.innerHTML = '';
    
    // Add articles with progressive animation
    articles.forEach((article, index) => {
      setTimeout(() => {
        const articleElement = this.createArticleElement(article);
        newsGrid.appendChild(articleElement);
      }, index * 50);
    });
  }
  
  /**
   * Create HTML element for news article (with custom source identification)
   */
  createArticleElement(article) {
    const article_element = document.createElement('article');
    article_element.className = 'news-card';
    article_element.setAttribute('data-article-id', article.id);
    
    const timeAgo = this.getTimeAgo(article.publishedAt);
    const categoryClass = article.category === 'breaking' ? 'news-card__category--breaking' : '';
    const customSourceAttr = article.source.isCustom ? 'data-custom="true"' : '';
    
    article_element.innerHTML = `
      ${article.imageUrl ? `
        <img 
          src="${article.imageUrl}" 
          alt="" 
          class="news-card__image"
          loading="lazy"
          onerror="this.style.display='none'"
        >
      ` : ''}
      
      <div class="news-card__content">
        <div class="news-card__category ${categoryClass}">
          ${this.getCategoryDisplayName(article.category)}
        </div>
        
        <h2 class="news-card__title">
          <a 
            href="${article.url}" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Read full article: ${article.title}"
          >
            ${article.title}
          </a>
        </h2>
        
        <p class="news-card__summary">${article.summary}</p>
        
        <div class="news-card__meta">
          <span class="news-card__source" ${customSourceAttr}>
            ${article.source.name}
            ${article.source.verified ? '✓' : ''}
          </span>
          <time datetime="${article.publishedAt}" title="${new Date(article.publishedAt).toLocaleString()}">
            ${timeAgo}
          </time>
        </div>
      </div>
    `;
    
    return article_element;
  }
  
  /**
   * Get display name for category (handle both built-in and custom)
   */
  getCategoryDisplayName(category) {
    if (this.categoryMetadata[category]) {
      return this.categoryMetadata[category].name;
    }
    
    // Check custom categories
    const customCategory = this.userPreferences.customCategories.find(cat => 
      cat.toLowerCase().replace(/\s+/g, '') === category
    );
    
    return customCategory || category.charAt(0).toUpperCase() + category.slice(1);
  }
  
  /**
   * Calculate time ago string
   */
  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
  
    /**
     * Update category buttons based on available articles (fixed to prevent duplicates)
     */
    updateCategoryButtons() {
        const availableCategories = new Set(['all']);
        
        // Find categories with articles
        this.articles.forEach(article => {
            if (article.category) {
            availableCategories.add(article.category);
            }
        });
        
        const categoryNav = document.querySelector('.category-nav__container');
        const allButton = categoryNav.querySelector('[data-category="all"]');
        
        // Clear existing buttons except "All"
        categoryNav.innerHTML = '';
        categoryNav.appendChild(allButton);
        
        // Create a map to track unique categories and their properties
        const uniqueCategories = new Map();
        
        // Add user's selected categories (both built-in and custom)
        this.userPreferences.categories.forEach(category => {
            const categoryKey = category.replace(/\s+/g, '').toLowerCase();
            
            if (availableCategories.has(categoryKey)) {
            // Check if this is a built-in category
            const isBuiltIn = this.categoryMetadata.hasOwnProperty(categoryKey);
            
            // Check if this is a custom category
            const customCategory = this.userPreferences.customCategories.find(cat => 
                cat.toLowerCase().replace(/\s+/g, '') === categoryKey
            );
            
            // Only add to map if not already present (first occurrence wins)
            if (!uniqueCategories.has(categoryKey)) {
                uniqueCategories.set(categoryKey, {
                key: categoryKey,
                displayName: this.getCategoryDisplayName(categoryKey),
                isCustom: !isBuiltIn && !!customCategory
                });
            }
            }
        });
    
    // Add custom categories that don't conflict with selected built-in categories
        this.userPreferences.customCategories.forEach(customCategory => {
            const categoryKey = customCategory.toLowerCase().replace(/\s+/g, '');
            
            if (availableCategories.has(categoryKey) && !uniqueCategories.has(categoryKey)) {
            uniqueCategories.set(categoryKey, {
                key: categoryKey,
                displayName: customCategory,
                isCustom: true
            });
            }
        });
    
    // Render unique categories
        uniqueCategories.forEach(categoryInfo => {
            const button = this.createCategoryButton(
            categoryInfo.key, 
            categoryInfo.isCustom, 
            categoryInfo.displayName
            );
            categoryNav.appendChild(button);
        });
        
        // Setup listeners for new buttons
        this.setupCategoryListeners();
        
        // Restore active state
        this.updateCategoryUI(this.currentCategory);
        }

    /**
     * Create category button element (updated to handle custom identification properly)
     */
    createCategoryButton(category, isCustom = false, displayName = null) {
        const button = document.createElement('button');
        button.className = 'category-tab';
        button.dataset.category = category;
        button.setAttribute('aria-pressed', 'false');
        
        // Only add custom attribute if it's truly a custom category
        if (isCustom) {
            button.setAttribute('data-custom', 'true');
        }
        
        const finalDisplayName = displayName || this.getCategoryDisplayName(category);
        
        if (category === 'breaking') {
            button.innerHTML = `
            <svg class="icon__heroicon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>${finalDisplayName}</span>
            <div style="width: 6px; height: 6px; background: #dc2626; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
            `;
        } else {
            button.innerHTML = `
            <svg class="icon__heroicon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
            <span>${finalDisplayName}</span>
            `;
        }
        
        return button;
        }

    /**
     * Get display name for category (updated to handle both built-in and custom properly)
     */
    getCategoryDisplayName(category) {
        // First check built-in categories
        if (this.categoryMetadata[category]) {
            return this.categoryMetadata[category].name;
        }
        
        // Then check custom categories (case-insensitive match)
        const customCategory = this.userPreferences.customCategories.find(cat => 
            cat.toLowerCase().replace(/\s+/g, '') === category.toLowerCase().replace(/\s+/g, '')
        );
        
        if (customCategory) {
            return customCategory;
        }
        
        // Fallback to formatted category name
        return category.charAt(0).toUpperCase() + category.slice(1);
        }

    /**
     * Normalize category key for consistent comparison
     */
    normalizeCategoryKey(categoryName) {
    return categoryName.toLowerCase().replace(/\s+/g, '').trim();
    }

    /**
     * Check if category exists (either built-in or custom)
     */
    categoryExists(categoryName) {
    const normalizedKey = this.normalizeCategoryKey(categoryName);
    
    // Check built-in categories
        if (this.categoryMetadata.hasOwnProperty(normalizedKey)) {
            return true;
        }
    
    // Check custom categories
    return this.userPreferences.customCategories.some(cat => 
            this.normalizeCategoryKey(cat) === normalizedKey
        );
        }

    /**
     * Updated addCustomCategory to prevent conflicts
     */
    addCustomCategory() {
    const input = document.getElementById('customCategoryInput');
    const name = input.value.trim();
    
    if (!name) {
            this.showNotification('Please enter a category name', 'warning');
            input.focus();
            return;
        }
        
        if (this.userPreferences.customCategories.length >= 9) {
            this.showNotification('Maximum 9 custom categories allowed', 'warning');
            return;
        }
        
        // Check for conflicts with existing categories (case-insensitive)
        if (this.categoryExists(name)) {
            this.showNotification('A category with this name already exists', 'warning');
            input.focus();
            return;
        }
        
        this.userPreferences.customCategories.push(name);
        input.value = '';
        
        this.populateCustomLists();
        this.populateCustomCategorySelect();
        this.populateCategoryGrid(); // Refresh to show new custom category
        
        this.showNotification(`Added custom category: ${name}`, 'success');
        }
  /**
   * Create category button element (with custom identification)
   */
  createCategoryButton(category, isCustom = false) {
        const button = document.createElement('button');
        button.className = 'category-tab';
        button.dataset.category = category;
        button.setAttribute('aria-pressed', 'false');
        
        if (isCustom) {
        button.setAttribute('data-custom', 'true');
        }
        
        const metadata = this.categoryMetadata[category];
        const displayName = this.getCategoryDisplayName(category);
        
        if (category === 'breaking') {
        button.innerHTML = `
            <svg class="icon__heroicon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>${displayName}</span>
            <div style="width: 6px; height: 6px; background: #dc2626; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
        `;
        } else {
        button.innerHTML = `
            <svg class="icon__heroicon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
            <span>${displayName}</span>
        `;
        }
        
        return button;
    }
    
  /**
   * Refresh news (manual trigger)
   */
  async refreshNews() {
    const now = Date.now();
    if (now - this.lastFetchTime < this.minFetchInterval) {
      const remainingTime = Math.ceil((this.minFetchInterval - (now - this.lastFetchTime)) / 1000);
      this.showNotification(`Please wait ${remainingTime} seconds before refreshing`, 'warning');
      return;
    }
    
    this.lastFetchTime = now;
    console.log('🔄 Manual refresh triggered');
    
    // Animate refresh button
    const refreshIcon = document.getElementById('refreshIcon');
    refreshIcon.style.animation = 'spin 1s linear infinite';
    
    try {
      await this.startProgressiveLoading();
    } finally {
      refreshIcon.style.animation = '';
    }
  }
  
  /**
   * Update progress bar
   */
  updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBar');
    progressBar.style.transform = `scaleX(${percentage / 100})`;
  }
  
  /**
   * Update loading status text
   */
  updateLoadingStatus(message) {
    const statusElement = document.getElementById('loadingStatus');
    statusElement.textContent = message;
  }
  
  /**
   * Update article count display
   */
  updateArticleCount(count) {
    const countElement = document.getElementById('articleCount');
    countElement.textContent = `${count} articles`;
  }
  
  /**
   * Update last updated time display
   */
  updateLastUpdatedTime() {
    if (!this.lastUpdateTime) return;
    
    const timeString = this.lastUpdateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const statusElement = document.querySelector('.status-text');
    if (statusElement) {
      statusElement.textContent = `Updated ${timeString}`;
    }
  }
  
  /**
   * Update active sources display
   */
  updateActiveSourcesDisplay() {
    const activeSources = this.getActiveSources();
    const sourceNames = [...new Set(activeSources.map(s => s.name))];
    
    const infoElement = document.getElementById('activeSourcesInfo');
    infoElement.textContent = `Personalized news from ${sourceNames.length} sources: ${sourceNames.slice(0, 3).join(', ')}${sourceNames.length > 3 ? '...' : ''}`;
  }
  
  /**
   * Open settings modal
   */
  openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.setAttribute('aria-hidden', 'false');
    
    // Populate settings
    this.populateSettingsModal();
    
    // Focus management
    const firstInput = modal.querySelector('input, button');
    if (firstInput) {
      firstInput.focus();
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log('⚙️ Settings modal opened');
  }
  
  /**
   * Close settings modal
   */
  closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to settings button
    document.getElementById('settingsBtn').focus();
    
    console.log('⚙️ Settings modal closed');
  }
  
  /**
   * Populate settings modal with current preferences
   */
  populateSettingsModal() {
    this.populateCategoryGrid();
    this.populateSourcesGrid();
    this.populateCustomCategorySelect();
    this.populateCustomLists();
    this.updateSelectionCounts();
  }
  
  /**
   * Populate category selection grid (consistent UI for built-in and custom)
   */
  populateCategoryGrid() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';
    
    // Built-in categories
    Object.entries(this.categoryMetadata).forEach(([key, metadata]) => {
      const isSelected = this.userPreferences.categories.includes(key);
      const item = this.createCategoryCheckboxItem(key, metadata.name, this.getCategoryDescription(key), isSelected, false);
      grid.appendChild(item);
    });
    
    // Custom categories
    this.userPreferences.customCategories.forEach((categoryName, index) => {
      const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '');
      const isSelected = this.userPreferences.categories.includes(categoryKey);
      const item = this.createCategoryCheckboxItem(categoryKey, categoryName, 'Custom news category', isSelected, true);
      grid.appendChild(item);
    });
    
    // Add event listeners to all checkboxes
    grid.querySelectorAll('.category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.validateCategorySelection();
        this.updateSelectionCounts();
        this.populateSourcesGrid();
      });
    });
  }
  
  /**
   * Create consistent checkbox item for categories (both built-in and custom)
   */
  createCategoryCheckboxItem(key, name, description, isSelected, isCustom) {
    const item = document.createElement('label');
    item.className = 'checkbox-item';
    
    if (isCustom) {
      item.setAttribute('data-custom', 'true');
    }
    
    item.innerHTML = `
      <input 
        type="checkbox" 
        class="category-checkbox" 
        value="${key}" 
        ${isSelected ? 'checked' : ''}
        aria-describedby="cat-${key}-desc"
      >
      <div class="checkbox-content">
        <div class="checkbox-label">${name}</div>
        <div id="cat-${key}-desc" class="checkbox-description">${description}</div>
      </div>
    `;
    
    return item;
  }
  
  /**
   * Get category description for accessibility
   */
  getCategoryDescription(category) {
    const descriptions = {
      breaking: 'Urgent news and developing stories',
      world: 'International news and global events',
      politics: 'Political news and government updates',
      business: 'Business news and market updates',
      technology: 'Tech news and innovation',
      sports: 'Sports news and scores'
    };
    
    return descriptions[category] || 'News category';
  }
  
  /**
   * Validate category selection limits
   */
  validateCategorySelection() {
    const checkedCategories = document.querySelectorAll('.category-checkbox:checked');
    const uncheckedCategories = document.querySelectorAll('.category-checkbox:not(:checked)');
    
    // Enforce maximum limit
    if (checkedCategories.length > this.maxCategoriesUser) {
      checkedCategories[checkedCategories.length - 1].checked = false;
      this.showNotification(`Maximum ${this.maxCategoriesUser} categories allowed`, 'warning');
      return;
    }
    
    // Enable/disable unchecked based on limit
    const atLimit = checkedCategories.length >= this.maxCategoriesUser;
    uncheckedCategories.forEach(checkbox => {
      checkbox.disabled = atLimit;
    });
    
    // Minimum 1 category required
    if (checkedCategories.length === 0) {
      this.showNotification('At least 1 category must be selected', 'warning');
    }
  }
  
  /**
   * Populate sources grid based on selected categories (consistent UI for built-in and custom)
   */
  populateSourcesGrid() {
    const grid = document.getElementById('sourcesGrid');
    grid.innerHTML = '';
    
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
      .map(cb => cb.value);
    
    selectedCategories.forEach(category => {
      const categorySection = document.createElement('div');
      categorySection.innerHTML = `
        <h4 style="margin-bottom: 1rem; font-weight: 600; color: var(--color-text-primary);">
          ${this.getCategoryDisplayName(category)} Sources
        </h4>
        <div class="category-sources"></div>
      `;
      
      const sourcesContainer = categorySection.querySelector('.category-sources');
      
      // Built-in sources for this category
      if (this.defaultSources[category]) {
        this.defaultSources[category].forEach(source => {
          const isSelected = this.userPreferences.sources[category]?.includes(source.id) || false;
          const item = this.createSourceCheckboxItem(source, category, isSelected, false);
          sourcesContainer.appendChild(item);
        });
      }
      
      // Custom sources for this category
      if (this.userPreferences.customSources[category]) {
        this.userPreferences.customSources[category].forEach(customSource => {
          const isSelected = true; // Custom sources are always selected if they exist
          const item = this.createSourceCheckboxItem(customSource, category, isSelected, true);
          sourcesContainer.appendChild(item);
        });
      }
      
      grid.appendChild(categorySection);
    });
    
    // Add event listeners to all source checkboxes
    grid.querySelectorAll('.source-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.validateSourceSelection(checkbox);
        this.updateSelectionCounts();
      });
    });
  }
  
  /**
   * Create consistent checkbox item for sources (both built-in and custom)
   */
  createSourceCheckboxItem(source, category, isSelected, isCustom) {
    const item = document.createElement('label');
    item.className = 'checkbox-item source-item';
    
    if (isCustom) {
      item.setAttribute('data-custom', 'true');
    }
    
    const sourceUrl = source.url || source.rss || '';
    const hostname = sourceUrl ? new URL(sourceUrl).hostname : 'Custom RSS';
    
    item.innerHTML = `
      <input 
        type="checkbox" 
        class="source-checkbox" 
        value="${source.id}" 
        data-category="${category}"
        ${isSelected ? 'checked' : ''}
        aria-describedby="src-${source.id}-desc"
      >
      <div class="checkbox-content">
        <div class="checkbox-label">
          ${source.name}
          ${source.verified ? ' ✓' : ''}
        </div>
        <div id="src-${source.id}-desc" class="checkbox-description">
          ${hostname}
        </div>
      </div>
    `;
    
    return item;
  }
  
  /**
   * Validate source selection limits per category
   */
  validateSourceSelection(changedCheckbox) {
    const category = changedCheckbox.dataset.category;
    const categorySources = document.querySelectorAll(`.source-checkbox[data-category="${category}"]:checked`);
    
    if (categorySources.length > this.maxSourcesPerCategory) {
      changedCheckbox.checked = false;
      this.showNotification(`Maximum ${this.maxSourcesPerCategory} sources per category`, 'warning');
    }
  }
  
  /**
   * Populate custom category select dropdown
   */
  populateCustomCategorySelect() {
    const select = document.getElementById('customSourceCategory');
    select.innerHTML = '<option value="">Select category</option>';
    
    // Add default categories
    Object.entries(this.categoryMetadata).forEach(([key, metadata]) => {
      select.innerHTML += `<option value="${key}">${metadata.name}</option>`;
    });
    
    // Add custom categories
    this.userPreferences.customCategories.forEach(category => {
      const key = category.toLowerCase().replace(/\s+/g, '');
      select.innerHTML += `<option value="${key}">${category}</option>`;
    });
  }
  
  /**
   * Populate custom categories and sources lists
   */
  populateCustomLists() {
    // Custom categories
    const categoriesList = document.getElementById('customCategoriesList');
    categoriesList.innerHTML = '';
    
    this.userPreferences.customCategories.forEach((category, index) => {
      const item = document.createElement('div');
      item.className = 'custom-item';
      item.innerHTML = `
        <div class="custom-item-info">
          <div class="custom-item-name">${category}</div>
        </div>
        <button 
          type="button" 
          class="btn btn--icon" 
          aria-label="Remove ${category}"
          onclick="newsApp.removeCustomCategory(${index})"
        >
          <svg class="icon__heroicon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      `;
      categoriesList.appendChild(item);
    });
    
    // Custom sources
    const sourcesList = document.getElementById('customSourcesList');
    sourcesList.innerHTML = '';
    
    Object.entries(this.userPreferences.customSources).forEach(([category, sources]) => {
      sources.forEach((source, index) => {
        const item = document.createElement('div');
        item.className = 'custom-item';
        item.innerHTML = `
          <div class="custom-item-info">
            <div class="custom-item-name">${source.name}</div>
            <div class="custom-item-details">${source.url} (${category})</div>
          </div>
          <button 
            type="button" 
            class="btn btn--icon" 
            aria-label="Remove ${source.name}"
            onclick="newsApp.removeCustomSource('${category}', ${index})"
          >
            <svg class="icon__heroicon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        `;
        sourcesList.appendChild(item);
      });
    });
  }
  
  /**
   * Update selection counts in modal
   */
  updateSelectionCounts() {
    const selectedCategories = document.querySelectorAll('.category-checkbox:checked').length;
    const selectedSources = document.querySelectorAll('.source-checkbox:checked').length;
    
    document.getElementById('selectedCategoriesCount').textContent = selectedCategories;
    document.getElementById('selectedSourcesCount').textContent = selectedSources;
  }
  
  /**
   * Add custom category
   */
  addCustomCategory() {
    const input = document.getElementById('customCategoryInput');
    const name = input.value.trim();
    
    if (!name) {
      this.showNotification('Please enter a category name', 'warning');
      input.focus();
      return;
    }
    
    if (this.userPreferences.customCategories.length >= 9) {
      this.showNotification('Maximum 9 custom categories allowed', 'warning');
      return;
    }
    
    if (this.userPreferences.customCategories.includes(name)) {
      this.showNotification('Category already exists', 'warning');
      input.focus();
      return;
    }
    
    this.userPreferences.customCategories.push(name);
    input.value = '';
    
    this.populateCustomLists();
    this.populateCustomCategorySelect();
    this.populateCategoryGrid(); // Refresh to show new custom category
    
    this.showNotification(`Added custom category: ${name}`, 'success');
  }
  
  /**
   * Remove custom category
   */
  removeCustomCategory(index) {
    const category = this.userPreferences.customCategories[index];
    
    if (confirm(`Remove custom category "${category}"?`)) {
      this.userPreferences.customCategories.splice(index, 1);
      
      // Also remove from user's selected categories
      const categoryKey = category.toLowerCase().replace(/\s+/g, '');
      this.userPreferences.categories = this.userPreferences.categories.filter(cat => cat !== categoryKey);
      
      // Remove associated custom sources
      delete this.userPreferences.customSources[categoryKey];
      
      this.populateCustomLists();
      this.populateCustomCategorySelect();
      this.populateCategoryGrid(); // Refresh to hide removed category
      
      this.showNotification(`Removed custom category: ${category}`, 'success');
    }
  }
  
  /**
   * Add custom RSS source
   */
  addCustomSource() {
    const nameInput = document.getElementById('customSourceName');
    const urlInput = document.getElementById('customSourceURL');
    const categorySelect = document.getElementById('customSourceCategory');
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const category = categorySelect.value;
    
    if (!name || !url || !category) {
      this.showNotification('Please fill all fields', 'warning');
      return;
    }
    
    if (!url.startsWith('https://')) {
      this.showNotification('RSS URL must use HTTPS', 'warning');
      urlInput.focus();
      return;
    }
    
    // Initialize category if needed
    if (!this.userPreferences.customSources[category]) {
      this.userPreferences.customSources[category] = [];
    }
    
    if (this.userPreferences.customSources[category].length >= this.maxSourcesPerCategory) {
      this.showNotification(`Maximum ${this.maxSourcesPerCategory} custom sources per category`, 'warning');
      return;
    }
    
    // Check for duplicates
    const exists = this.userPreferences.customSources[category].some(source => 
      source.name === name || source.url === url
    );
    
    if (exists) {
      this.showNotification('Source already exists', 'warning');
      return;
    }
    
    this.userPreferences.customSources[category].push({
      id: `custom-${Date.now()}`,
      name,
      url,
      verified: false,
      isCustom: true
    });
    
    // Clear inputs
    nameInput.value = '';
    urlInput.value = '';
    categorySelect.value = '';
    
    this.populateCustomLists();
    this.populateSourcesGrid(); // Refresh to show new custom source
    
    this.showNotification(`Added custom source: ${name}`, 'success');
  }
  
  /**
   * Remove custom source
   */
  removeCustomSource(category, index) {
    const source = this.userPreferences.customSources[category][index];
    
    if (confirm(`Remove custom source "${source.name}"?`)) {
      this.userPreferences.customSources[category].splice(index, 1);
      
      // Clean up empty categories
      if (this.userPreferences.customSources[category].length === 0) {
        delete this.userPreferences.customSources[category];
      }
      
      this.populateCustomLists();
      this.populateSourcesGrid(); // Refresh to hide removed source
      
      this.showNotification(`Removed custom source: ${source.name}`, 'success');
    }
  }
  
  /**
   * Save settings and apply changes
   */
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
    
    // Save to localStorage
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
  
  /**
   * Reset settings to defaults
   */
  resetSettings() {
    if (confirm('Reset all settings to default? This will remove custom categories and sources.')) {
      // Clear localStorage
      localStorage.removeItem('newsstream-preferences');
      
      // Reload preferences
      this.userPreferences = this.loadUserPreferences();
      
      // Repopulate modal
      this.populateSettingsModal();
      
      this.showNotification('Settings reset to defaults', 'success');
    }
  }
  
  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    
    const colors = {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-danger)',
      info: 'var(--color-primary)'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      z-index: 1001;
      max-width: 300px;
      animation: slideInRight 0.3s ease-out;
      font-size: 14px;
      font-weight: 500;
    `;
    
    notification.textContent = message;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 4000);
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌐 DOM loaded, initializing NewsStream...');
  window.newsApp = new NewsStreamApp();
});

// Handle visibility change for refresh
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.newsApp) {
    const timeSinceUpdate = Date.now() - (window.newsApp.lastUpdateTime?.getTime() || 0);
    if (timeSinceUpdate > 300000) { // 5 minutes
      console.log('🔄 Auto-refreshing due to page visibility change');
      window.newsApp.refreshNews();
    }
  }
});

// Handle errors globally
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});

console.log('📱 NewsStream script loaded successfully');
