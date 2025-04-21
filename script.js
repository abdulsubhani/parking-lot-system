// Parking System Class
class ParkingSystem {
    constructor(totalSlots = 0) {
      this.totalSlots = totalSlots;
      this.availableSlots = totalSlots;
      this.parkingData = {};
      this.initialize();
    }
  
    initialize() {
      const savedData = localStorage.getItem('parkingData');
      const savedTotal = localStorage.getItem('totalSlots');
      
      if (savedData && savedTotal) {
        this.parkingData = JSON.parse(savedData);
        this.totalSlots = parseInt(savedTotal);
        this.calculateAvailableSlots();
      }
    }
  
    setTotalSlots(totalSlots) {
      if (totalSlots <= 0) {
        return false;
      }
  
      if (totalSlots < this.totalSlots) {
        for (let i = totalSlots + 1; i <= this.totalSlots; i++) {
          if (this.parkingData[i]) {
            return false;
          }
        }
      }
  
      this.totalSlots = totalSlots;
      this.calculateAvailableSlots();
      this.saveData();
      return true;
    }
  
    calculateAvailableSlots() {
      const occupiedCount = Object.keys(this.parkingData).length;
      this.availableSlots = this.totalSlots - occupiedCount;
    }
  
    parkVehicle(registrationNumber) {
      if (!registrationNumber || this.isVehicleParked(registrationNumber)) {
        return false;
      }
  
      if (this.availableSlots <= 0) {
        return false;
      }
  
      let slotNumber;
      for (let i = 1; i <= this.totalSlots; i++) {
        if (!this.parkingData[i]) {
          slotNumber = i;
          break;
        }
      }
  
      if (!slotNumber) {
        return false;
      }
  
      const parkingInfo = {
        registrationNumber: registrationNumber,
        slotNumber: slotNumber,
        entryTime: new Date().toISOString()
      };
  
      this.parkingData[slotNumber] = parkingInfo;
      this.availableSlots--;
      this.saveData();
      
      return parkingInfo;
    }
  
    isVehicleParked(registrationNumber) {
      for (const slot in this.parkingData) {
        if (this.parkingData[slot].registrationNumber.toLowerCase() === registrationNumber.toLowerCase()) {
          return true;
        }
      }
      return false;
    }
  
    findVehicleByRegistration(registrationNumber) {
      for (const slot in this.parkingData) {
        if (this.parkingData[slot].registrationNumber.toLowerCase() === registrationNumber.toLowerCase()) {
          return this.parkingData[slot];
        }
      }
      return null;
    }
  
    removeVehicle(registrationNumber) {
      if (!registrationNumber) {
        return false;
      }
  
      const vehicleInfo = this.findVehicleByRegistration(registrationNumber);
      
      if (!vehicleInfo) {
        return false;
      }
  
      const { slotNumber } = vehicleInfo;
      const removedVehicle = { ...this.parkingData[slotNumber] };
      
      delete this.parkingData[slotNumber];
      this.availableSlots++;
      this.saveData();
      
      return removedVehicle;
    }
  
    getAllParkedVehicles() {
      return Object.values(this.parkingData).sort((a, b) => a.slotNumber - b.slotNumber);
    }
  
    getSlotStatus(slotNumber) {
      return this.parkingData[slotNumber] ? 'occupied' : 'available';
    }
  
    getSlotDetails(slotNumber) {
      const status = this.getSlotStatus(slotNumber);
      const details = {
        slotNumber,
        status
      };
  
      if (status === 'occupied') {
        details.vehicleInfo = this.parkingData[slotNumber];
      }
  
      return details;
    }
  
    getAllSlots() {
      const slots = [];
      for (let i = 1; i <= this.totalSlots; i++) {
        slots.push(this.getSlotDetails(i));
      }
      return slots;
    }
  
    resetSystem() {
      this.parkingData = {};
      this.availableSlots = this.totalSlots;
      this.saveData();
    }
  
    saveData() {
      localStorage.setItem('parkingData', JSON.stringify(this.parkingData));
      localStorage.setItem('totalSlots', this.totalSlots.toString());
    }
  
    getStats() {
      return {
        totalSlots: this.totalSlots,
        availableSlots: this.availableSlots,
        occupiedSlots: this.totalSlots - this.availableSlots
      };
    }
  }
  
  // UI Elements
  const setupSection = document.getElementById('setupSection');
  const parkingDashboard = document.getElementById('parkingDashboard');
  const setupForm = document.getElementById('setupForm');
  const parkForm = document.getElementById('parkForm');
  const removeForm = document.getElementById('removeForm');
  const slotsVisualization = document.getElementById('slotsVisualization');
  const availableCountElement = document.getElementById('availableCount');
  const occupiedCountElement = document.getElementById('occupiedCount');
  const parkedList = document.getElementById('parkedList');
  const noVehiclesMsg = document.getElementById('noVehiclesMsg');
  const resetSystemBtn = document.getElementById('resetSystem');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const notificationContainer = document.getElementById('notificationContainer');
  
  // Initialize parking system
  let parkingSystem;
  
  // Check if system is already initialized
  document.addEventListener('DOMContentLoaded', () => {
    const savedTotal = localStorage.getItem('totalSlots');
    
    if (savedTotal) {
      parkingSystem = new ParkingSystem();
      showParkingDashboard();
      updateUI();
    } else {
      showSetupSection();
    }
  });
  
  // Setup Form Submission
  setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const totalSlots = parseInt(document.getElementById('totalSlots').value);
    
    if (totalSlots <= 0) {
      showNotification('Please enter a valid number of slots', 'error');
      return;
    }
    
    parkingSystem = new ParkingSystem(totalSlots);
    showParkingDashboard();
    updateUI();
    showNotification(`Parking system initialized with ${totalSlots} slots`, 'success');
  });
  
  // Park Vehicle Form Submission
  parkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const registrationInput = document.getElementById('vehicleReg');
    const registrationNumber = registrationInput.value.trim();
    
    if (!registrationNumber) {
      showNotification('Please enter a registration number', 'error');
      return;
    }
    
    const result = parkingSystem.parkVehicle(registrationNumber);
    
    if (result) {
      showNotification(`Vehicle ${registrationNumber} parked at slot ${result.slotNumber}`, 'success');
      registrationInput.value = '';
      updateUI();
    } else {
      if (parkingSystem.isVehicleParked(registrationNumber)) {
        showNotification(`Vehicle with registration ${registrationNumber} is already parked`, 'error');
      } else if (parkingSystem.availableSlots <= 0) {
        showNotification('No parking slots available', 'error');
      } else {
        showNotification('Failed to park vehicle', 'error');
      }
    }
  });
  
  // Remove Vehicle Form Submission
  removeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const registrationInput = document.getElementById('removeReg');
    const registrationNumber = registrationInput.value.trim();
    
    if (!registrationNumber) {
      showNotification('Please enter a registration number', 'error');
      return;
    }
    
    const result = parkingSystem.removeVehicle(registrationNumber);
    
    if (result) {
      showNotification(`Vehicle ${registrationNumber} removed from slot ${result.slotNumber}`, 'success');
      registrationInput.value = '';
      updateUI();
    } else {
      showNotification(`No vehicle found with registration ${registrationNumber}`, 'error');
    }
  });
  
  // Reset System Button
  resetSystemBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the parking system? All data will be lost.')) {
      parkingSystem.resetSystem();
      showSetupSection();
      showNotification('Parking system has been reset', 'info');
    }
  });
  
  // Tab Navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
      
      if (tabId === 'viewParked') {
        updateParkedVehiclesList();
      }
    });
  });
  
  // Show setup section
  function showSetupSection() {
    setupSection.style.display = 'block';
    parkingDashboard.style.display = 'none';
  }
  
  // Show parking dashboard
  function showParkingDashboard() {
    setupSection.style.display = 'none';
    parkingDashboard.style.display = 'block';
  }
  
  // Update slot visualization
  function updateSlotVisualization() {
    slotsVisualization.innerHTML = '';
    
    const slots = parkingSystem.getAllSlots();
    
    slots.forEach(slot => {
      const slotElement = document.createElement('div');
      slotElement.className = `slot ${slot.status}`;
      
      const slotNumberElement = document.createElement('div');
      slotNumberElement.className = 'slot-number';
      slotNumberElement.textContent = slot.slotNumber;
      
      const slotStatusElement = document.createElement('div');
      slotStatusElement.className = 'slot-status';
      slotStatusElement.textContent = slot.status;
      
      slotElement.appendChild(slotNumberElement);
      slotElement.appendChild(slotStatusElement);
      
      if (slot.status === 'occupied') {
        slotElement.title = `Occupied by: ${slot.vehicleInfo.registrationNumber}`;
        
        slotElement.addEventListener('click', () => {
          if (confirm(`Remove vehicle ${slot.vehicleInfo.registrationNumber} from slot ${slot.slotNumber}?`)) {
            parkingSystem.removeVehicle(slot.vehicleInfo.registrationNumber);
            updateUI();
            showNotification(`Vehicle ${slot.vehicleInfo.registrationNumber} removed from slot ${slot.slotNumber}`, 'success');
          }
        });
      }
      
      slotsVisualization.appendChild(slotElement);
    });
  }
  
  // Update stats display
  function updateStatsDisplay() {
    const stats = parkingSystem.getStats();
    availableCountElement.textContent = stats.availableSlots;
    occupiedCountElement.textContent = stats.occupiedSlots;
  }
  
  // Update parked vehicles list
  function updateParkedVehiclesList() {
    const tableBody = parkedList.querySelector('tbody');
    tableBody.innerHTML = '';
    
    const vehicles = parkingSystem.getAllParkedVehicles();
    
    if (vehicles.length === 0) {
      parkedList.style.display = 'none';
      noVehiclesMsg.style.display = 'block';
      return;
    }
    
    parkedList.style.display = 'table';
    noVehiclesMsg.style.display = 'none';
    
    vehicles.forEach(vehicle => {
      const row = document.createElement('tr');
      
      const slotCell = document.createElement('td');
      slotCell.textContent = vehicle.slotNumber;
      
      const regCell = document.createElement('td');
      regCell.textContent = vehicle.registrationNumber;
      
      const timeCell = document.createElement('td');
      const entryTime = new Date(vehicle.entryTime);
      timeCell.textContent = formatDateTime(entryTime);
      
      const actionCell = document.createElement('td');
      actionCell.className = 'action-cell';
      
      const removeButton = document.createElement('button');
      removeButton.className = 'action-btn';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        parkingSystem.removeVehicle(vehicle.registrationNumber);
        updateUI();
        showNotification(`Vehicle ${vehicle.registrationNumber} removed from slot ${vehicle.slotNumber}`, 'success');
      });
      
      actionCell.appendChild(removeButton);
      
      row.appendChild(slotCell);
      row.appendChild(regCell);
      row.appendChild(timeCell);
      row.appendChild(actionCell);
      
      tableBody.appendChild(row);
    });
  }
  
  // Format date and time
  function formatDateTime(date) {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month:  'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  // Update the entire UI
  function updateUI() {
    updateStatsDisplay();
    updateSlotVisualization();
    updateParkedVehiclesList();
  }