// Global Variables
const notesGrid = document.querySelector('.notes-grid');
const addNoteButton = document.querySelector('.add-note-button');
const noteModal = document.querySelector('.note-modal');
const closeButton = document.querySelector('.close-button');
const saveNoteButton = document.getElementById('save-note');
const deleteNoteButton = document.getElementById('delete-note');
const noteTitleInput = document.getElementById('note-title');
const noteTaglineInput = document.getElementById('note-tagline');
const noteBodyInput = document.getElementById('note-body');

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref,set, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase Setup
const firebaseConfig = {
    apiKey: "AIzaSyD2J-ae5sKMkW4i0vMVt3lKBiIm1d__11M",
    authDomain: "mynotekeep-16d3d.firebaseapp.com",
    databaseURL: "https://mynotekeep-16d3d-default-rtdb.firebaseio.com",
    projectId: "mynotekeep-16d3d",
    storageBucket: "mynotekeep-16d3d.appspot.com",
    messagingSenderId: "734095970534",
    appId: "1:734095970534:web:d97553279d6d5f279dab27"
  };
  const app = initializeApp(firebaseConfig); // Initialize Firebase
  const database = getDatabase(app); // Get the database instance

  const notesRef = ref(database, 'notes');

// Data Storage (Firebase Realtime Database)
let notes = []; // Array to store notes (for rendering)
let currentPage = 1; // Current page for pagination
let notesPerPage = 6; // Number of notes per page

// Load Notes (from Firebase)
loadNotes();

// Function to load notes
function loadNotes() {
    onValue(notesRef, (snapshot) => { // Use onValue to listen for changes
        notes = []; 
        snapshot.forEach((childSnapshot) => {
          const noteData = childSnapshot.val();
          if (noteData.title) { // Only add if a title exists
            noteData.id = childSnapshot.key; 
            notes.push(noteData); 
          }
        });
        renderNotes();
      });
  }

// Function to render notes
function renderNotes() {
  notesGrid.innerHTML = ''; // Clear existing notes

  // Filter notes for the current page
  const startIndex = (currentPage - 1) * notesPerPage;
  const endIndex = startIndex + notesPerPage;
  const displayedNotes = notes.slice(startIndex, endIndex);

  // Create note elements for each displayed note
  displayedNotes.forEach((note) => {
    const noteElement = document.createElement('div');
    noteElement.classList.add('note');
    noteElement.dataset.noteId = note.id; // Assign the Firebase ID

    const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = new Date(note.createdAt).toLocaleTimeString('en-US');

    // Add title, tagline, and body content
    noteElement.innerHTML = `
           <div class="note-inner-grid">
            <p class="note-date">${formattedDate}</p>
              <p class="note-time">${formattedTime}</p></div>
            <h3 class="note-title">${note.title}</h3>
            
            <p class="note-tagline">${note.tagline}</p>
            <p class="note-body">${note.body}</p>
            <i class="pinned-icon ${note.pinned ? 'active' : ''}"></i>
        `;

    // Add event listener for clicking on a note
    noteElement.addEventListener('click', () => {
      openNoteModal(note);
    });

    // Add event listener for pinning/unpinning
    const pinnedIcon = noteElement.querySelector('.pinned-icon');
    pinnedIcon.addEventListener('click', () => {
      togglePin(note.id);
    });

    notesGrid.appendChild(noteElement);
  });

  updatePagination(); // Update pagination buttons after rendering
}

// Function to open the note modal
function openNoteModal(note) {
  noteModal.classList.remove('hidden');
  noteTitleInput.value = note.title;
  noteTaglineInput.value = note.tagline;
  noteBodyInput.value = note.body;

  // Store the note ID for saving/deleting
  deleteNoteButton.dataset.noteId = note.id; 

  // Update the delete button based on the note
  if (note.id) {
    deleteNoteButton.textContent = 'Delete';
  } else {
    deleteNoteButton.textContent = 'Cancel';
  }
}

// Function to close the note modal
function closeNoteModal() {
  noteModal.classList.add('hidden');
  // Clear inputs
  noteTitleInput.value = '';
  noteTaglineInput.value = '';
  noteBodyInput.value = '';
}

// Function to toggle pinning
function togglePin(noteId) {
  notesRef.child(noteId).update({ pinned: !notes.find((note) => note.id === noteId).pinned });
}

// Function to save a note
function saveNote() {
  const title = noteTitleInput.value.trim();
  const tagline = noteTaglineInput.value.trim();
  const body = noteBodyInput.value.trim();
  const createdAt = new Date();
  const noteId = deleteNoteButton.dataset.noteId; // Get note ID from the delete button

  if (noteId) {
    // Update existing note
    update(ref(database, 'notes/' + noteId), {
      title,
      tagline,
      body,
      createdAt,
    });
  } else {
    // Create new note
    const newNoteRef = push(ref(database, 'notes'));
    set(newNoteRef, { 
      title,
      tagline,
      body,
      createdAt,
      pinned: false,
    });
  }

  closeNoteModal(); 
}

// Function to delete a note
function deleteNote() {
    const noteId = deleteNoteButton.dataset.noteId; 
    if (noteId) {
      // Delete the note from Firebase
      remove(ref(database, 'notes/' + noteId)); 
      closeNoteModal();
    } else {
      closeNoteModal(); 
    }
  }

// Pagination Functions
function updatePagination() {
    const totalPages = Math.ceil(notes.length / notesPerPage);
  
    // Create pagination buttons
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = ''; 
  
    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
      currentPage--;
      renderNotes();
    });
    pagination.appendChild(prevButton);
  
    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.addEventListener('click', () => {
        currentPage = i;
        renderNotes();
      });
      if (i === currentPage) {
        button.classList.add('active');
      }
      pagination.appendChild(button);
    }
  
    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
      currentPage++;
      renderNotes();
    });
    pagination.appendChild(nextButton);
  }

// Event Listeners
addNoteButton.addEventListener('click', () => {
  openNoteModal();
});

closeButton.addEventListener('click', closeNoteModal);
saveNoteButton.addEventListener('click', saveNote);
deleteNoteButton.addEventListener('click', deleteNote);

// Initialize Pagination (Load Notes)
renderNotes();