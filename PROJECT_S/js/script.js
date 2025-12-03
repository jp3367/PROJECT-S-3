// ===== CONSTANTS =====
const PLANET_CARD_CLASS = 'planet';
const ACTIVE_CLASS = 'active';
const MISSIONS_STORAGE_KEY = 'space_missions';
const MISSION_FORM_ID = 'mission-form';
const MISSIONS_LIST_ID = 'missions-list';
const EDIT_MODAL_ID = 'edit-modal';
const MIN_YEAR = 1957;
const MAX_YEAR = 2100;

// ===== PLANET CARD CLASS =====
/**
 * Class to handle planet card interactions
 */
class PlanetCard {
  constructor(element) {
    this.element = element;
    this.element.addEventListener('click', this.toggleActive.bind(this));
  }

  /**
   * Toggle active class on element
   */
  toggleActive() {
    this.element.classList.toggle(ACTIVE_CLASS);
  }
}

// ===== MISSION CLASS =====
/**
 * Class representing a space mission
 */
class Mission {
  constructor(name, destination, year, status) {
    this.id = Date.now() + Math.random();
    this.name = name;
    this.destination = destination;
    this.year = parseInt(year);
    this.status = status;
    this.createdAt = new Date().toISOString();
  }
}

// ===== MISSION MANAGER CLASS =====
/**
 * Class to manage CRUD operations for missions
 */
class MissionManager {
  constructor() {
    this.missions = this.loadMissions();
    this.form = document.getElementById(MISSION_FORM_ID);
    this.listContainer = document.getElementById(MISSIONS_LIST_ID);
    this.editingMissionId = null;
    this.initializeForm();
    this.createEditModal();
    this.renderMissions();
  }

  /**
   * Load missions from localStorage
   * @returns {Array} Array of missions
   */
  loadMissions() {
    const stored = localStorage.getItem(MISSIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultMissions();
  }

  /**
   * Get default missions
   * @returns {Array} Array of default missions
   */
  getDefaultMissions() {
    return [
      new Mission('Voyager 1', 'Espacio Interestelar', 1977, 'active'),
      new Mission('Apollo 11', 'Luna', 1969, 'completed'),
      new Mission('Mars 2020', 'Marte', 2020, 'active')
    ];
  }

  /**
   * Save missions to localStorage
   */
  saveMissions() {
    localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(this.missions));
  }

  /**
   * Create edit modal
   */
  createEditModal() {
    const existingModal = document.getElementById(EDIT_MODAL_ID);
    if (existingModal) return;

    const modal = document.createElement('div');
    modal.id = EDIT_MODAL_ID;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h3>Editar Misión</h3>
        <form id="edit-mission-form" class="mission-form" onsubmit="return false;">
          <div class="form-group">
            <label for="edit-mission-name">Nombre de la Misión:</label>
            <input type="text" id="edit-mission-name" name="missionName" required>
            <span class="error-message" id="edit-name-error"></span>
          </div>
          
          <div class="form-group">
            <label for="edit-mission-destination">Destino:</label>
            <input type="text" id="edit-mission-destination" name="missionDestination" required>
            <span class="error-message" id="edit-destination-error"></span>
          </div>
          
          <div class="form-group">
            <label for="edit-mission-year">Año de Lanzamiento:</label>
            <input type="number" id="edit-mission-year" name="missionYear" min="1957" max="2100" required>
            <span class="error-message" id="edit-year-error"></span>
          </div>
          
          <div class="form-group">
            <label for="edit-mission-status">Estado:</label>
            <select id="edit-mission-status" name="missionStatus" required>
              <option value="">Selecciona un estado</option>
              <option value="active">Activa</option>
              <option value="completed">Completada</option>
              <option value="planned">Planificada</option>
            </select>
            <span class="error-message" id="edit-status-error"></span>
          </div>
          
          <button type="submit" class="btn-primary">Guardar Cambios</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Close modal handlers
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.closeEditModal());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeEditModal();
      }
    });

    // Edit form submit
    const editForm = document.getElementById('edit-mission-form');
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleEditSubmit(e);
      return false;
    });
  }

  /**
   * Open edit modal
   * @param {number} id - Mission ID
   */
  openEditModal(id) {
    const mission = this.missions.find(m => m.id === id);
    if (!mission) return;

    this.editingMissionId = id;
    
    document.getElementById('edit-mission-name').value = mission.name;
    document.getElementById('edit-mission-destination').value = mission.destination;
    document.getElementById('edit-mission-year').value = mission.year;
    document.getElementById('edit-mission-status').value = mission.status;

    // Clear errors
    ['edit-name-error', 'edit-destination-error', 'edit-year-error', 'edit-status-error'].forEach(id => {
      document.getElementById(id).textContent = '';
    });

    const modal = document.getElementById(EDIT_MODAL_ID);
    modal.style.display = 'block';
  }

  /**
   * Close edit modal
   */
  closeEditModal() {
    const modal = document.getElementById(EDIT_MODAL_ID);
    modal.style.display = 'none';
    this.editingMissionId = null;
  }

  /**
   * Initialize form event listeners
   */
  initializeForm() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleSubmit(e);
        return false;
      });
    }
  }

  /**
   * Validate form field
   * @param {string} value - Field value
   * @param {string} errorElementId - Error element ID
   * @param {string} errorMessage - Error message
   * @returns {boolean} Is valid
   */
  validateField(value, errorElementId, errorMessage) {
    const errorElement = document.getElementById(errorElementId);
    if (!value || value.trim() === '') {
      errorElement.textContent = errorMessage;
      return false;
    }
    errorElement.textContent = '';
    return true;
  }

  /**
   * Validate year field
   * @param {number} year - Year value
   * @param {string} errorElementId - Error element ID
   * @returns {boolean} Is valid
   */
  validateYear(year, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    
    if (!year || isNaN(year)) {
      errorElement.textContent = 'El año es requerido';
      return false;
    }
    
    if (year < MIN_YEAR || year > MAX_YEAR) {
      errorElement.textContent = `El año debe estar entre ${MIN_YEAR} y ${MAX_YEAR}`;
      return false;
    }
    
    errorElement.textContent = '';
    return true;
  }

  /**
   * Validate entire form
   * @param {Object} formData - Form data
   * @param {string} prefix - Prefix for error IDs
   * @returns {boolean} Is valid
   */
  validateForm(formData, prefix = '') {
    const NAME_VALID = this.validateField(
      formData.name, 
      `${prefix}name-error`, 
      'El nombre es requerido'
    );
    
    const DESTINATION_VALID = this.validateField(
      formData.destination, 
      `${prefix}destination-error`, 
      'El destino es requerido'
    );
    
    const YEAR_VALID = this.validateYear(formData.year, `${prefix}year-error`);
    
    const STATUS_VALID = this.validateField(
      formData.status, 
      `${prefix}status-error`, 
      'El estado es requerido'
    );
    
    return NAME_VALID && DESTINATION_VALID && YEAR_VALID && STATUS_VALID;
  }

  /**
   * Handle form submission (CREATE)
   * @param {Event} event - Submit event
   */
  handleSubmit(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const formData = {
      name: document.getElementById('mission-name').value,
      destination: document.getElementById('mission-destination').value,
      year: document.getElementById('mission-year').value,
      status: document.getElementById('mission-status').value
    };
    
    console.log('Form submitted with data:', formData); // Debug
    
    if (this.validateForm(formData)) {
      this.createMission(
        formData.name,
        formData.destination,
        formData.year,
        formData.status
      );
      this.form.reset();
      
      // Show success message
      console.log('Mission created successfully!');
    } else {
      console.log('Form validation failed');
    }
    
    return false;
  }

  /**
   * Handle edit form submission (UPDATE)
   * @param {Event} event - Submit event
   */
  handleEditSubmit(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const formData = {
      name: document.getElementById('edit-mission-name').value,
      destination: document.getElementById('edit-mission-destination').value,
      year: document.getElementById('edit-mission-year').value,
      status: document.getElementById('edit-mission-status').value
    };
    
    if (this.validateForm(formData, 'edit-')) {
      this.updateMission(
        this.editingMissionId,
        formData.name,
        formData.destination,
        formData.year,
        formData.status
      );
      this.closeEditModal();
    }
    
    return false;
  }

  /**
   * Create new mission (CREATE)
   * @param {string} name - Mission name
   * @param {string} destination - Mission destination
   * @param {number} year - Launch year
   * @param {string} status - Mission status
   */
  createMission(name, destination, year, status) {
    const mission = new Mission(name, destination, year, status);
    this.missions.push(mission);
    this.saveMissions();
    this.renderMissions();
  }

  /**
   * Update existing mission (UPDATE)
   * @param {number} id - Mission ID
   * @param {string} name - Mission name
   * @param {string} destination - Mission destination
   * @param {number} year - Launch year
   * @param {string} status - Mission status
   */
  updateMission(id, name, destination, year, status) {
    const mission = this.missions.find(m => m.id === id);
    if (mission) {
      mission.name = name;
      mission.destination = destination;
      mission.year = parseInt(year);
      mission.status = status;
      this.saveMissions();
      this.renderMissions();
    }
  }

  /**
   * Delete mission (DELETE)
   * @param {number} id - Mission ID
   */
  deleteMission(id) {
    this.missions = this.missions.filter(mission => mission.id !== id);
    this.saveMissions();
    this.renderMissions();
  }

  /**
   * Get status class for styling
   * @param {string} status - Mission status
   * @returns {string} CSS class
   */
  getStatusClass(status) {
    const STATUS_CLASSES = {
      'active': 'status-active',
      'completed': 'status-completed',
      'planned': 'status-planned'
    };
    return STATUS_CLASSES[status] || 'status-planned';
  }

  /**
   * Get status text in Spanish
   * @param {string} status - Mission status
   * @returns {string} Status text
   */
  getStatusText(status) {
    const STATUS_TEXTS = {
      'active': 'Activa',
      'completed': 'Completada',
      'planned': 'Planificada'
    };
    return STATUS_TEXTS[status] || status;
  }

  /**
   * Render all missions (READ)
   */
  renderMissions() {
    if (!this.listContainer) {
      console.error('List container not found!');
      return;
    }
    
    console.log('Rendering missions:', this.missions); // Debug
    
    if (this.missions.length === 0) {
      this.listContainer.innerHTML = '<p style="color: #aaa; text-align: center;">No hay misiones registradas</p>';
      return;
    }
    
    this.listContainer.innerHTML = this.missions
      .map(mission => `
        <div class="mission-card animate-in">
          <h4>${this.escapeHtml(mission.name)}</h4>
          <p><strong>Destino:</strong> ${this.escapeHtml(mission.destination)}</p>
          <p><strong>Año:</strong> ${mission.year}</p>
          <span class="mission-status ${this.getStatusClass(mission.status)}">
            ${this.getStatusText(mission.status)}
          </span>
          <div class="mission-actions">
            <button class="btn-edit" data-id="${mission.id}">Editar</button>
            <button class="btn-delete" data-id="${mission.id}">Eliminar</button>
          </div>
        </div>
      `)
      .join('');
    
    // Add event listeners to edit buttons
    this.listContainer.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = parseFloat(e.target.dataset.id);
        this.openEditModal(id);
      });
    });

    // Add event listeners to delete buttons
    this.listContainer.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = parseFloat(e.target.dataset.id);
        if (confirm('¿Estás seguro de eliminar esta misión?')) {
          this.deleteMission(id);
        }
      });
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ===== SCROLL ANIMATIONS =====
/**
 * Class to handle scroll animations
 */
class ScrollAnimator {
  constructor() {
    this.initializeObserver();
  }

  /**
   * Initialize Intersection Observer
   */
  initializeObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, options);

    // Observe sections
    const sections = document.querySelectorAll('.solar-system, .neptune-section, .missions-section, .about-section');
    sections.forEach(section => {
      observer.observe(section);
    });

    // Observe planet cards individually
    const planets = document.querySelectorAll('.planet');
    planets.forEach(planet => {
      observer.observe(planet);
    });

    // Observe mission cards
    const missionCards = document.querySelectorAll('.mission-card');
    missionCards.forEach(card => {
      observer.observe(card);
    });
  }
}

// ===== SMOOTH SCROLL =====
/**
 * Enable smooth scroll for navigation links
 */
function enableSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = document.querySelector('.main-header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== INITIALIZATION =====
/**
 * Initialize all planets on the page
 */
function initializePlanets() {
  const planets = document.querySelectorAll(`.${PLANET_CARD_CLASS}`);
  planets.forEach(planet => new PlanetCard(planet));
}

/**
 * Initialize the application
 */
function initializeApp() {
  initializePlanets();
  
  // Only initialize MissionManager if form exists
  if (document.getElementById(MISSION_FORM_ID)) {
    new MissionManager();
  }
  
  new ScrollAnimator();
  enableSmoothScroll();
  
  console.log('PROJECT S initialized successfully');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);