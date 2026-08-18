/* ========================================
   SUPABASE
   ======================================== */
const supabaseUrl =
    "https://spgyrwiexbpsuzxovjex.supabase.co";
const supabaseKey =
    "sb_publishable_cJTtSTCWL3aQ2tI0F8RwLQ_YQJ8bFTT";
const supabaseClient =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );
console.log(
    "Supabase connected!"
);
console.log(
    "URL:",
    supabaseUrl
);
/* ========================================
   DOM ELEMENTS
   ======================================== */

const googleLoginButton =
    document.getElementById(
        "google-login"
    );
const logoutButton =
    document.getElementById(
        "logout-button"
    );
const userInfo =
    document.getElementById(
        "user-info"
    );
const notesContainer =
    document.getElementById(
        "notes"
    );
const noteCount =
    document.getElementById(
        "note-count"
    );
const refreshButton =
    document.getElementById(
        "refresh-button"
    );
const undoToast =
    document.getElementById(
        "undo-toast"
    );
const undoMessage =
    document.getElementById(
        "undo-message"
    );
const undoButton =
    document.getElementById(
        "undo-button"
    );
const deleteModal =
    document.getElementById(
        "delete-modal"
    );
const cancelDeleteButton =
    document.getElementById(
        "cancel-delete"
    );
const confirmDeleteButton =
    document.getElementById(
        "confirm-delete"
    );


const copyToast =
    document.getElementById(
        "copy-toast"
    );


/* ========================================
   STATE
   ======================================== */

let pendingDeleteNote =
    null;
let deletedNoteBackup =
    null;
let undoTimeout =
    null;
let copyToastTimeout =
    null;
/* ========================================
   GOOGLE LOGIN
   ======================================== */

googleLoginButton.addEventListener(
    "click",
    async () => {
        const {
            error
        } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/index.html"
            }
        });
        if (error) {
            console.error(
                "Google login error:",
                error
            );
            alert(
                "Could not sign in with Google."
            );
        }
    }
);


/* ========================================
   LOGOUT
   ======================================== */

logoutButton.addEventListener(
    "click",
    async () => {

        const {
            error
        } = await supabaseClient.auth.signOut();
        if (error) {
            console.error(
                "Logout error:",
                error
            );
            alert(
                "Could not log out."
            );
            return;
        }
        window.location.reload();

    }
);


/* ========================================
   CHECK AUTH
   ======================================== */

async function checkAuth() {

    const {
        data: {
            user
        },
        error
    } = await supabaseClient.auth.getUser();
    if (error) {
        console.error(
            "Auth error:",
            error
        );
    }
    if (user) {
        console.log(
            "Logged in:",
            user
        );
        googleLoginButton.hidden =
            true;
        logoutButton.hidden =
            false;
        userInfo.textContent =
            user.email || "Logged in";
        return user;
    }
    googleLoginButton.hidden =
        false;
    logoutButton.hidden =
        true;
    userInfo.textContent =
        "";
    return null;
}


/* ========================================
   LOAD NOTES
   ======================================== */

async function loadNotes() {

    refreshButton.classList.add(
        "loading"
    );
    notesContainer.innerHTML = `
        <div class="loading-state">
            Loading notes...
        </div>
    `;
    /*
       Get currently logged-in user.
    */

    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();
    /*
       User is not logged in.
    */
    if (
        userError ||
        !user
    ) {
        refreshButton.classList.remove(
            "loading"
        );
        notesContainer.innerHTML = `
            <div class="error-state">
                Please sign in to view your notes.
            </div>
        `;


        noteCount.textContent =
            "Not signed in";
        return;
    }
    /*
       Load only notes
       belonging to this user.
    */
    const {
        data,
        error
    } = await supabaseClient
        .from("notes")
        .select("*")
        .eq(
            "user_id",
            user.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );
    refreshButton.classList.remove(
        "loading"
    );
    if (error) {
        console.error(
            "Error loading notes:",
            error
        );
        notesContainer.innerHTML = `
            <div class="error-state">
                Could not load notes.
                <br><br>
                ${escapeHtml(error.message)}
            </div>
        `;
        noteCount.textContent =
            "Error loading notes";
        return;
    }
    renderNotes(
        data || []
    );

}

/* ========================================
   RENDER NOTES
   ======================================== */

function renderNotes(notes) {

    noteCount.textContent =
        `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;


    if (
        !notes ||
        notes.length === 0
    ) {

        notesContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ○
                </div>

                <div class="empty-state-text">
                    No notes yet.
                </div>

            </div>

        `;


        return;

    }


    notesContainer.innerHTML =
        notes
            .map(
                note =>
                    createNoteHTML(
                        note
                    )
            )
            .join("");
    initializeSwipeGestures();

}


/* ========================================
   CREATE NOTE HTML
   ======================================== */

function createNoteHTML(note) {

    const title =
        note.page_title ||
        "Untitled note";


    const text =
        note.text ||
        "";


    const formattedDate =
        formatDate(
            note.created_at
        );


    const url =
        note.url
            ? createSafeUrl(
                note.url
            )
            : null;


    return `

        <div
            class="note-wrapper"
            data-note-id="${escapeHtml(
        String(note.id)
    )}"
        >

            <!-- Swipe Actions -->

            <div class="swipe-actions">

                <button
                    class="swipe-action copy-action"
                    data-action="copy"
                    type="button"
                >
                    Copy
                </button>


                <button
                    class="swipe-action delete-action"
                    data-action="delete"
                    type="button"
                >
                    Delete
                </button>

            </div>


            <!-- Note -->

            <article class="note">

                <div class="note-title">
                    ${escapeHtml(title)}
                </div>


                <div class="note-text">
                    ${escapeHtml(text)}
                </div>


                ${url
            ? `
                            <a
                                class="note-url"
                                href="${url}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ${escapeHtml(note.url)}
                            </a>
                        `
            : ""
        }


                <div class="note-date">
                    ${formattedDate}
                </div>

            </article>

        </div>

    `;

}


/* ========================================
   SWIPE GESTURES
   ======================================== */

function initializeSwipeGestures() {

    const wrappers =
        document.querySelectorAll(
            ".note-wrapper"
        );


    wrappers.forEach(
        wrapper => {

            const note =
                wrapper.querySelector(
                    ".note"
                );


            const deleteButton =
                wrapper.querySelector(
                    '[data-action="delete"]'
                );


            const copyButton =
                wrapper.querySelector(
                    '[data-action="copy"]'
                );


            let startX =
                0;


            let startY =
                0;


            let currentX =
                0;


            let isDragging =
                false;


            let isHorizontalSwipe =
                false;


            /*
               TOUCH START
            */

            note.addEventListener(
                "touchstart",
                event => {

                    startX =
                        event.touches[0].clientX;


                    startY =
                        event.touches[0].clientY;


                    currentX =
                        startX;


                    isDragging =
                        true;


                    isHorizontalSwipe =
                        false;


                    note.style.transition =
                        "none";

                },
                {
                    passive: true
                }
            );


            /*
               TOUCH MOVE
            */

            note.addEventListener(
                "touchmove",
                event => {

                    if (
                        !isDragging
                    ) {

                        return;

                    }


                    currentX =
                        event.touches[0].clientX;


                    const currentY =
                        event.touches[0].clientY;


                    const diffX =
                        currentX -
                        startX;


                    const diffY =
                        currentY -
                        startY;


                    if (
                        Math.abs(diffX) > 10 &&
                        Math.abs(diffX) >
                        Math.abs(diffY)
                    ) {

                        isHorizontalSwipe =
                            true;

                    }


                    if (
                        !isHorizontalSwipe
                    ) {

                        return;

                    }


                    /*
                       Only allow
                       swiping left.
                    */

                    if (
                        diffX < 0
                    ) {

                        const maxSwipe =
                            164;


                        const translateX =
                            Math.max(
                                diffX,
                                -maxSwipe
                            );


                        note.style.transform =
                            `translateX(${translateX}px)`;

                    }

                },
                {
                    passive: true
                }
            );


            /*
               TOUCH END
            */

            note.addEventListener(
                "touchend",
                () => {

                    if (
                        !isDragging
                    ) {

                        return;

                    }


                    isDragging =
                        false;


                    note.style.transition =
                        "transform 0.25s ease";


                    const diff =
                        currentX -
                        startX;


                    if (
                        diff < -70
                    ) {

                        note.style.transform =
                            "translateX(-164px)";

                    } else {

                        note.style.transform =
                            "translateX(0)";

                    }

                }
            );


            /*
               COPY
            */

            copyButton.addEventListener(
                "click",
                async () => {

                    const noteId =
                        wrapper.dataset.noteId;


                    await copyNote(
                        noteId
                    );

                }
            );


            /*
               DELETE
            */

            deleteButton.addEventListener(
                "click",
                () => {

                    const noteId =
                        wrapper.dataset.noteId;


                    pendingDeleteNote = {

                        id:
                            noteId,

                        wrapper:
                            wrapper

                    };


                    openDeleteModal();

                }
            );

        }
    );

}


/* ========================================
   OPEN DELETE MODAL
   ======================================== */

function openDeleteModal() {

    deleteModal.classList.add(
        "visible"
    );


    deleteModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* ========================================
   CLOSE DELETE MODAL
   ======================================== */

function closeDeleteModal() {

    deleteModal.classList.remove(
        "visible"
    );


    deleteModal.setAttribute(
        "aria-hidden",
        "true"
    );


    pendingDeleteNote =
        null;

}


/* ========================================
   CONFIRM DELETE
   ======================================== */

async function confirmDelete() {

    if (
        !pendingDeleteNote
    ) {

        return;

    }


    const noteId =
        pendingDeleteNote.id;


    const wrapper =
        pendingDeleteNote.wrapper;


    closeDeleteModal();


    /*
       Get current user.
    */

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        alert(
            "Please sign in first."
        );

        return;

    }


    /*
       Get note for Undo.
       The user_id filter ensures
       we only access our own note.
    */

    const {
        data: note,
        error: fetchError
    } = await supabaseClient

        .from("notes")

        .select("*")

        .eq(
            "id",
            noteId
        )

        .eq(
            "user_id",
            user.id
        )

        .single();


    if (fetchError) {

        console.error(
            "Fetch note error:",
            fetchError
        );


        return;

    }


    deletedNoteBackup =
        note;


    /*
       Animate note away.
    */

    if (wrapper) {

        wrapper.style.transition =
            "opacity 0.25s ease, transform 0.25s ease";


        wrapper.style.opacity =
            "0";


        wrapper.style.transform =
            "translateX(-100%)";

    }


    /*
       Delete only this user's note.
    */

    const {
        error
    } = await supabaseClient

        .from("notes")

        .delete()

        .eq(
            "id",
            noteId
        )

        .eq(
            "user_id",
            user.id
        );


    if (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Could not delete this note."
        );


        loadNotes();


        return;

    }


    /*
       Show Undo.
    */

    showUndoToast();


    setTimeout(
        () => {

            loadNotes();

        },
        300
    );

}


/* ========================================
   UNDO DELETE
   ======================================== */

async function undoDelete() {

    if (
        !deletedNoteBackup
    ) {

        return;

    }


    clearTimeout(
        undoTimeout
    );


    const noteToRestore =
        deletedNoteBackup;


    deletedNoteBackup =
        null;


    hideUndoToast();


    /*
       Make sure the note
       belongs to current user.
    */

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        return;

    }


    /*
       Restore note.
    */

    const {
        error
    } = await supabaseClient

        .from("notes")

        .insert({

            id:
                noteToRestore.id,

            user_id:
                user.id,

            text:
                noteToRestore.text,

            url:
                noteToRestore.url,

            page_title:
                noteToRestore.page_title,

            created_at:
                noteToRestore.created_at,

            archived:
                noteToRestore.archived

        });


    if (error) {

        console.error(
            "Undo delete error:",
            error
        );


        alert(
            "Could not restore the note."
        );


        return;

    }


    loadNotes();

}


/* ========================================
   UNDO TOAST
   ======================================== */

function showUndoToast() {

    undoMessage.textContent =
        "Note deleted";


    undoToast.classList.add(
        "visible"
    );


    undoToast.setAttribute(
        "aria-hidden",
        "false"
    );


    clearTimeout(
        undoTimeout
    );


    undoTimeout =
        setTimeout(
            () => {

                hideUndoToast();


                deletedNoteBackup =
                    null;

            },
            5000
        );

}


/* ========================================
   HIDE UNDO TOAST
   ======================================== */

function hideUndoToast() {

    undoToast.classList.remove(
        "visible"
    );


    undoToast.setAttribute(
        "aria-hidden",
        "true"
    );

}
/* ========================================
   COPY NOTE
   ======================================== */

async function copyNote(
    noteId
) {
    /*
       Get current user.
    */
    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {
        return;
    }
    /*
       Get only this user's note.
    */
    const {
        data: note,
        error
    } = await supabaseClient
        .from("notes")
        .select(
            "text, url"
        )
        .eq(
            "id",
            noteId
        )
        .eq(
            "user_id",
            user.id
        )
        .single();
    if (error) {
        console.error(
            "Copy error:",
            error
        );
        return;
    }
    let copyText =
        note.text || "";
    if (
        note.url
    ) {
        copyText +=
            "\n\n" +
            note.url;
    }
    try {
        await navigator.clipboard.writeText(copyText);
        showCopyToast();
    } catch (
    error
    ) {
        console.error(
            "Clipboard error:",
            error
        );
        /*
           Fallback for older browsers.
        */
        const textarea =
            document.createElement(
                "textarea"
            );
        textarea.value = copyText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(
            textarea
        );
        textarea.select();
        document.execCommand(
            "copy"
        );
        textarea.remove();
        showCopyToast();
    }
}
/* ========================================
   COPY TOAST
   ======================================== */
function showCopyToast() {
    copyToast.classList.add(
        "visible"
    );
    copyToast.setAttribute(
        "aria-hidden",
        "false"
    );
    clearTimeout(
        copyToastTimeout
    );
    copyToastTimeout =
        setTimeout(
            () => {
                copyToast.classList.remove(
                    "visible"
                );
                copyToast.setAttribute(
                    "aria-hidden",
                    "true"
                );
            },
            1800
        );

}


/* ========================================
   DATE FORMAT
   ======================================== */

function formatDate(
    dateString
) {
    if (
        !dateString
    ) {
        return "";
    }
    const date =
        new Date(
            dateString
        );
    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }
    return new Intl.DateTimeFormat(
        "en-US",
        {
            month:
                "short",
            day:
                "numeric",
            year:
                "numeric",
            hour:
                "2-digit",
            minute:
                "2-digit"
        }
    ).format(
        date
    );
}


/* ========================================
   SAFE URL
   ======================================== */

function createSafeUrl(
    url
) {
    try {
        let normalizedUrl =
            url.trim();
        if (
            !normalizedUrl.startsWith(
                "http://"
            ) &&
            !normalizedUrl.startsWith(
                "https://"
            )
        ) {
            normalizedUrl =
                "https://" +
                normalizedUrl;

        }
        const parsedUrl =
            new URL(
                normalizedUrl
            );
        if (
            parsedUrl.protocol !==
            "http:" &&
            parsedUrl.protocol !==
            "https:"
        ) {
            return null;
        }
        return escapeHtml(
            parsedUrl.href
        );
    } catch {
        return null;
    }
}
/* ========================================
   HTML ESCAPE
   ======================================== */

function escapeHtml(
    value
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }
    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



refreshButton.addEventListener(
    "click",
    loadNotes
);


undoButton.addEventListener(
    "click",
    undoDelete
);

confirmDeleteButton.addEventListener(
    "click",
    confirmDelete
);

cancelDeleteButton.addEventListener(
    "click",
    closeDeleteModal
);
/* ========================================
   CLICK OUTSIDE MODAL
   ======================================== */
deleteModal.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            deleteModal
        ) {
            closeDeleteModal();
        }
    }
);
/* ========================================
   ESCAPE KEY
   ======================================== */
document.addEventListener(
    "keydown",
    event => {
        if (
            event.key ===
            "Escape"
        ) {
            closeDeleteModal();
        }
    }
);
/* ========================================
   AUTH STATE CHANGES
   ======================================== */
supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {
        console.log(
            "Auth event:",
            event
        );
        if (
            session &&
            session.user
        ) {
            googleLoginButton.hidden =
                true;
            logoutButton.hidden =
                false;
            userInfo.textContent =
                session.user.email ||
                "Logged in";
            await loadNotes();
        } else {
            googleLoginButton.hidden =
                false;
            logoutButton.hidden =
                true;
            userInfo.textContent =
                "";
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">
                        Please sign in to view your notes.
                    </div>
                </div>
            `;
            noteCount.textContent =
                "Not signed in";
        }
    }
);
/* ========================================
   SAVE NOTE FROM SAFARI SHORTCUT
   ======================================== */
async function saveSharedNote() {
    const hash = window.location.hash;
    if (!hash.startsWith("#save=")) {
        return;
    }
    const text = decodeURIComponent(
        hash.substring("#save=".length)
    ).trim();
    if (!text) {
        return;
    }
    console.log(
        "Text received from Shortcut:",
        text
    );
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
        console.error(
            "No logged-in user.",
            userError
        );
        alert(
            "Please sign in to Click & Save first."
        );
        return;
    }
    const {
        error
    } = await supabaseClient
        .from("notes")
        .insert({
            user_id: user.id,
            text: text,
            url: null,
            page_title: "Saved from Safari"
        });
    if (error) {
        console.error(
            "Could not save shared note:",
            error
        );
        alert(
            "Could not save the note."
        );
        return;
    }
    console.log(
        "Safari note saved successfully!"
    );
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname +
        window.location.search
    );
    await loadNotes();
}
/* ========================================
   INITIALIZATION
   ======================================== */
async function initializeApp() {
    const user =
        await checkAuth();
    if (user) {
        await loadNotes();
        await saveSharedNote();
    }
}
initializeApp();