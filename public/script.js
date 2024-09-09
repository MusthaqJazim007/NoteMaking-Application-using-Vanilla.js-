//script for storing in localstorage in the web browser , change the scriptfb.js to script.js in index.html code.
//

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

// Data Storage (In-Memory, use a backend for persistent storage)
let notes = []; // Array to store notes
let currentPage = 1; // Current page for pagination
let notesPerPage = 6; // Number of notes per page

// Load Notes (from local storage or backend, placeholder here)
loadNotes(); 

// Function to load notes
function loadNotes() {
    // Fetch notes from local storage or backend
     notes = JSON.parse(localStorage.getItem('notes')) || []; 

    renderNotes();
}

// Function to render notes
function renderNotes() {
    notesGrid.innerHTML = ''; // Clear existing notes

    // Filter notes for the current page
    const startIndex = (currentPage - 1) * notesPerPage;
    const endIndex = startIndex + notesPerPage;
    const displayedNotes = notes.slice(startIndex, endIndex);

    // Create note elements for each displayed note
    displayedNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.dataset.noteId = index; // Assign a unique ID to each note

        const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        const formattedTime = new Date(note.createdAt).toLocaleTimeString('en-US'); 

        // Add date and time to the note element

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
            openNoteModal(note, index);
        });

        // Add event listener for pinning/unpinning
        const pinnedIcon = noteElement.querySelector('.pinned-icon');
        pinnedIcon.addEventListener('click', () => {
            togglePin(index);
        });

        notesGrid.appendChild(noteElement);
    });

    updatePagination(); // Update pagination buttons after rendering
}

// Function to open the note modal
function openNoteModal(note, noteId) {
    noteModal.classList.remove('hidden');
    noteTitleInput.value = note.title;
    noteTaglineInput.value = note.tagline;
    noteBodyInput.value = note.body;

    // Store the note ID for saving/deleting
    deleteNoteButton.dataset.noteId = noteId; 

    // Update the delete button based on the note
    if (note.id) {
        deleteNoteButton.textContent = "Delete";
    } else {
        deleteNoteButton.textContent = "Cancel";
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
function togglePin(index) {
    notes[index].pinned = !notes[index].pinned;
    renderNotes();
    // Update notes in local storage or backend
    localStorage.setItem('notes', JSON.stringify(notes)); 
}

// Function to save a note
function saveNote() {
    const title = noteTitleInput.value.trim();
    const tagline = noteTaglineInput.value.trim();
    const body = noteBodyInput.value.trim();

    const createdAt = new Date();

    // Check if the note is new or being edited
    const noteId = deleteNoteButton.dataset.noteId; // Get note ID from the delete button
    if (noteId >= 0) {
        // Update existing note
        notes[noteId] = {
            title: title,
            tagline: tagline,
            body: body,
            createdAt: createdAt,
            pinned: notes[noteId].pinned
        };
    } else {
        // Create new note
        const newNote = {
            title: title,
            tagline: tagline,
            body: body,
            createdAt: createdAt,

            pinned: false
        };
        notes.push(newNote);
    }

    // Save notes in local storage or backend
    localStorage.setItem('notes', JSON.stringify(notes));

    closeNoteModal(); // Close the modal
    renderNotes(); // Re-render the notes grid
}

// Function to delete a note
function deleteNote() {
    const noteId = deleteNoteButton.dataset.noteId; // Get note ID from the delete button
    if (noteId >= 0) {
        notes.splice(noteId, 1); // Remove the note from the array
        // Update notes in local storage or backend
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        closeNoteModal();
    } else {
        closeNoteModal(); // Just close the modal if "Cancel" was clicked
    }
}

// Pagination Functions
function updatePagination() {
    const totalPages = Math.ceil(notes.length / notesPerPage);

    // Create pagination buttons
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = ''; // Clear existing buttons
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