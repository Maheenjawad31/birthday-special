/* =========================================================
   A MUSEUM MADE FOR YOU — MAIN SCRIPT
   ========================================================= */

   document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =======================================================
       ELEMENTS
       ======================================================= */

    const rooms = Array.from(document.querySelectorAll(".room"));

    const transitionLayer =
        document.getElementById("transition-layer");

    const audio =
        document.getElementById("ambient-audio");

    const audioToggle =
        document.getElementById("audio-toggle");

    const indicator =
        document.getElementById("exhibit-indicator");

    const indicatorCurrent =
        document.querySelector(
            ".exhibit-indicator__current"
        );

    let currentRoom = 1;
    let isTransitioning = false;


    /* =======================================================
       ROOM NAVIGATION
       ======================================================= */

    function getRoom(number) {
        const padded = String(number).padStart(2, "0");

        return (
            document.getElementById(`room-${padded}`) ||
            document.querySelector(
                `.room[data-room="${padded}"]`
            )
        );
    }


    function updateIndicator(number) {
        if (!indicatorCurrent) return;

        indicatorCurrent.textContent =
            String(number).padStart(2, "0");
    }


    function showRoom(number, instant = false) {
        const nextRoom = getRoom(number);

        if (
            !nextRoom ||
            isTransitioning ||
            number === currentRoom
        ) {
            return;
        }

        if (instant) {
            rooms.forEach((room) => {
                const active = room === nextRoom;

                room.classList.toggle(
                    "is-active",
                    active
                );

                room.setAttribute(
                    "aria-hidden",
                    active ? "false" : "true"
                );
            });

            currentRoom = number;
            updateIndicator(number);

            initializeRoom(number);

            return;
        }

        isTransitioning = true;

        if (transitionLayer) {
            transitionLayer.classList.add(
                "is-visible"
            );
        }

        setTimeout(() => {
            rooms.forEach((room) => {
                const active = room === nextRoom;

                room.classList.toggle(
                    "is-active",
                    active
                );

                room.setAttribute(
                    "aria-hidden",
                    active ? "false" : "true"
                );
            });

            currentRoom = number;

            updateIndicator(number);

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto"
            });

            initializeRoom(number);

            setTimeout(() => {
                if (transitionLayer) {
                    transitionLayer.classList.remove(
                        "is-visible"
                    );
                }

                setTimeout(() => {
                    isTransitioning = false;
                }, 500);

            }, 350);

        }, 650);
    }


    document.addEventListener("click", (event) => {
        const button =
            event.target.closest(
                "[data-next-room]"
            );

        if (!button) return;

        const nextRoomNumber =
            Number(button.dataset.nextRoom);

        if (!nextRoomNumber) return;

        event.preventDefault();

        showRoom(nextRoomNumber);
    });

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-prev-room]");
        if (!button) return;
        const prevRoomNumber = Number(button.dataset.prevRoom);
        if (!prevRoomNumber) return;
        event.preventDefault();
        showRoom(prevRoomNumber);
    });


    /* =======================================================
       KEYBOARD NAVIGATION
       ======================================================= */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeAllModals();
        }

        if (
            event.key === "ArrowRight" &&
            !isInputFocused() &&
            currentRoom < 8
        ) {
            showRoom(currentRoom + 1);
        }

        if (
            event.key === "ArrowLeft" &&
            !isInputFocused() &&
            currentRoom > 1
        ) {
            showRoom(currentRoom - 1);
        }
    });


    function isInputFocused() {
        const active =
            document.activeElement;

        if (!active) return false;

        return (
            active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.tagName === "SELECT"
        );
    }


    /* =======================================================
       AUDIO
       ======================================================= */

    let audioPlaying = false;

    if (audio) {
        audio.volume = 0.22;
    }


    function updateAudioButton() {
        if (!audioToggle) return;

        const label =
            audioToggle.querySelector(
                ".audio-control__label"
            );

        const icon =
            audioToggle.querySelector(
                ".audio-control__icon"
            );

        if (audioPlaying) {
            if (label) {
                label.textContent = "SOUND ON";
            }

            if (icon) {
                icon.textContent = "◉";
            }

            audioToggle.setAttribute(
                "aria-pressed",
                "true"
            );

        } else {

            if (label) {
                label.textContent = "SOUND OFF";
            }

            if (icon) {
                icon.textContent = "◌";
            }

            audioToggle.setAttribute(
                "aria-pressed",
                "false"
            );
        }
    }


    async function toggleAudio() {
        if (!audio) return;

        try {
            if (audio.paused) {
                await audio.play();
                audioPlaying = true;
            } else {
                audio.pause();
                audioPlaying = false;
            }

            updateAudioButton();

        } catch (error) {
            console.warn(
                "Ambient audio could not be started.",
                error
            );
        }
    }


    if (audioToggle) {
        audioToggle.addEventListener(
            "click",
            toggleAudio
        );
    }

    updateAudioButton();


    /* =======================================================
       ROOM 02 — PHOTO LIGHTBOX
       ======================================================= */

    const photoLightbox =
        document.getElementById(
            "photo-lightbox"
        );

    const lightboxImage =
        document.getElementById(
            "lightbox-image"
        );

    const lightboxTitle =
        document.getElementById(
            "lightbox-title"
        );

    const lightboxCaption =
        document.getElementById(
            "lightbox-caption"
        );

    const lightboxClose =
        document.getElementById(
            "lightbox-close"
        );


    function openPhotoLightbox(button) {
        if (!photoLightbox) return;

        const image =
            button.dataset.image || button.querySelector("img")?.getAttribute("src") || "";

        const title =
            button.dataset.title || "";

        const caption =
            button.dataset.caption || button.dataset.note || "";


        if (lightboxImage) {
            lightboxImage.classList.remove("image-missing");
            lightboxImage.style.visibility = "";
            lightboxImage.src = image;
            lightboxImage.alt = title;
        }

        if (lightboxTitle) {
            lightboxTitle.textContent = title;
        }

        if (lightboxCaption) {
            lightboxCaption.textContent =
                caption;
        }


        photoLightbox.classList.add(
            "is-open"
        );

        photoLightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        if (lightboxClose) {
            setTimeout(() => {
                lightboxClose.focus();
            }, 100);
        }
    }


    function closePhotoLightbox() {
        if (!photoLightbox) return;

        photoLightbox.classList.remove(
            "is-open"
        );

        photoLightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        if (lightboxImage) {
            lightboxImage.src = "";
        }
    }


    document
        .querySelectorAll(".photo-trigger")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {
                    openPhotoLightbox(button);
                }
            );

        });


    if (lightboxClose) {
        lightboxClose.addEventListener(
            "click",
            closePhotoLightbox
        );
    }


    if (photoLightbox) {
        photoLightbox.addEventListener(
            "click",
            closePhotoLightbox
        );

        const lightboxContent =
            photoLightbox.querySelector(
                ".lightbox__content"
            );

        if (lightboxContent) {
            lightboxContent.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();
                }
            );
        }
    }


    /* =======================================================
       ROOM 03 — DESK
       ======================================================= */

    const deskObjects =
        document.querySelectorAll(
            ".desk-object"
        );

    const deskProgress =
        document.getElementById(
            "desk-progress-text"
        );

    const deskContinue =
        document.getElementById(
            "desk-continue"
        );

    const discoveredDeskObjects =
        new Set();


    /* The Page 3 button should ALWAYS be available. */
    if (deskContinue) {
        deskContinue.classList.remove(
            "is-hidden"
        );
    }


    deskObjects.forEach((object) => {

        object.addEventListener(
            "click",
            () => {

                const type =
                    object.dataset.object;

                if (!type) return;

                discoveredDeskObjects.add(
                    type
                );

                object.classList.toggle("is-open");

                updateDeskProgress();
            }
        );

    });


    function updateDeskProgress() {

        const total =
            deskObjects.length;

        const found =
            discoveredDeskObjects.size;


        if (found >= total) {

            if (deskProgress) {
                deskProgress.textContent =
                    "THERE'S MORE.";
            }

        } else {

            if (deskProgress) {
                deskProgress.textContent =
                    `${found} / ${total} OBJECTS EXPLORED.`;
            }
        }
    }


    /* =======================================================
       ROOM 04 — THE NOTE GALAXY
       ======================================================= */

    const galaxyCanvas =
        document.getElementById(
            "galaxy-canvas"
        );

    const galaxy =
        document.getElementById(
            "galaxy-notes"
        );

    const galaxyStars =
        Array.from(
            document.querySelectorAll(
                ".galaxy-star"
            )
        );

    const enterGalaxy =
        document.getElementById(
            "enter-galaxy"
        );

    const galaxyProgress =
        document.getElementById(
            "galaxy-progress-count"
        );

    const noteModal =
        document.getElementById(
            "note-modal"
        );

    const noteModalClose =
        document.getElementById(
            "note-modal-close"
        );

    const noteModalIcon =
        document.getElementById(
            "note-modal-icon"
        );

    const noteModalCategory =
        document.getElementById(
            "note-modal-category"
        );

    const noteModalMessage =
        document.getElementById(
            "note-modal-message"
        );

    const galaxyComplete =
        document.getElementById(
            "galaxy-complete"
        );

    const discoveredNotes =
        new Set();

    let galaxyHasBeenEntered = false;


    /* -------------------------------------------------------
       GALAXY POSITIONING
       ------------------------------------------------------- */

    function positionGalaxyStars() {

        /* Claude's galaxy uses deliberate percentage-based positions.
           Keep those positions instead of replacing them with a generated pattern. */
        galaxyStars.forEach((star, index) => {
            if (!star.style.left && !star.style.top) return;
            star.style.setProperty("--star-delay", `${(index % 7) * 0.35}s`);
        });
    }


    /* -------------------------------------------------------
       ENTER THE NOTE GALAXY
       ------------------------------------------------------- */

       /* -------------------------------------------------------
   ENTER THE NOTE GALAXY
   ------------------------------------------------------- */

const room04 = getRoom(4);

function enterNoteGalaxy() {
    if (!room04) return;

    galaxyHasBeenEntered = true;

    /* Activate the actual Page 4 CSS state */
    room04.classList.add("galaxy-active");

    if (galaxyCanvas) {
        galaxyCanvas.classList.add("is-active");
    }

    if (galaxy) {
        galaxy.classList.add("is-revealed");
    }

    /* Reveal stars one by one */
    galaxyStars.forEach((star, index) => {
        setTimeout(() => {
            star.classList.add("is-visible");
        }, index * 65);
    });

    /* Recalculate positions after the galaxy becomes visible */
    setTimeout(() => {
        positionGalaxyStars();
    }, 100);

    setTimeout(() => {
        positionGalaxyStars();
    }, 600);
}

if (enterGalaxy) {
    enterGalaxy.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        enterNoteGalaxy();
    });
}


    /* -------------------------------------------------------
       STAR INTERACTIONS
       ------------------------------------------------------- */

    galaxyStars.forEach((star) => {

        star.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();


                /*
                 * If someone somehow clicks a star before
                 * pressing ENTER, activate the galaxy first.
                 */

                if (!galaxyHasBeenEntered) {
                    enterNoteGalaxy();
                }


                const note =
                    star.dataset.note ||
                    star.dataset.id ||
                    "";


                const category =
                    star.dataset.category ||
                    "NOTE";


                const icon =
                    star.dataset.icon ||
                    "○";


                const message =
                    star.dataset.message ||
                    "";


                if (note) {
                    discoveredNotes.add(
                        note
                    );
                } else {
                    discoveredNotes.add(
                        String(
                            galaxyStars.indexOf(
                                star
                            )
                        )
                    );
                }


                star.classList.add(
                    "is-discovered"
                );


                if (galaxyProgress) {

                    galaxyProgress.textContent =
                        `${discoveredNotes.size} / ${galaxyStars.length}`;

                }


                if (noteModalIcon) {
                    noteModalIcon.textContent =
                        icon;
                }


              

                if (noteModalMessage) {
                    noteModalMessage.textContent =
                        message;
                }


                openNoteModal();


                /*
                 * Once every note has been discovered,
                 * show the completion state.
                 */

                if (discoveredNotes.size >= 5 && discoveredNotes.size < galaxyStars.length) {
                    showGalaxyContinue();
                }

                if (discoveredNotes.size >= galaxyStars.length) {
                    showGalaxyComplete();
                }

            }
        );

    });


    /* -------------------------------------------------------
       NOTE MODAL
       ------------------------------------------------------- */

    function openNoteModal() {

        if (!noteModal) return;

        noteModal.classList.add(
            "is-open"
        );

        noteModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        if (noteModalClose) {
            setTimeout(() => {
                noteModalClose.focus();
            }, 100);
        }
    }


    function closeNoteModal() {

        if (!noteModal) return;

        noteModal.classList.remove(
            "is-open"
        );

        noteModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }


    if (noteModalClose) {

        noteModalClose.addEventListener(
            "click",
            closeNoteModal
        );

    }


    if (noteModal) {
        noteModal.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                event.stopPropagation();
                closeNoteModal();
            }
        );
    }


    function showGalaxyContinue() {
        if (!galaxyComplete) return;
        galaxyComplete.classList.add("is-unlocked");
        galaxyComplete.setAttribute("aria-hidden", "false");
    }


    function showGalaxyComplete() {
        if (!galaxyComplete) return;
        const title = document.getElementById("galaxy-complete-title");
        const sub = document.getElementById("galaxy-complete-sub");
        if (title) title.textContent = "YOU FOUND THEM ALL.";
        if (sub) sub.textContent = "TWENTY LITTLE THOUGHTS WERE WAITING FOR YOU.";
        galaxyComplete.classList.remove("is-unlocked");
        galaxyComplete.classList.add("is-visible", "is-active");
        galaxyComplete.setAttribute("aria-hidden", "false");
        galaxyComplete.addEventListener("click", function (event) {
            if (!event.target.closest(".galaxy-continue")) {
                galaxyComplete.classList.remove("is-visible", "is-active");
                galaxyComplete.setAttribute("aria-hidden", "true");
                galaxyComplete.classList.add("is-unlocked");
            }
        });
    }

    
    /* =======================================================
       ROOM 05 — FUTURE MEMORIES
       ======================================================= */

    const futureModal =
        document.getElementById(
            "future-modal"
        );

    const futureModalClose =
        document.getElementById(
            "future-modal-close"
        );

    const futureModalTitle =
        document.getElementById(
            "future-modal-title"
        );

    const futureModalText =
        document.getElementById(
            "future-modal-text"
        );

    const futureModalVisual =
        document.getElementById(
            "future-modal-visual"
        );


    const futureMemories = {

        "first-coffee": {
            title: "FIRST COFFEE",
            text: "One day, two cups on a small table.\nNo rush, no occasion — just the first coffee we finally get to share.",
            visual: "future-visual--coffee"
        },


        "first-trip": {
            title: "FIRST TRIP",
            text: "Two tickets, one suitcase, and somewhere neither of us has seen before.\nThe kind of trip that becomes a story before we even get home.",
            visual: "future-visual--trip"
        },


        "first-sunrise": {
            title: "FIRST SUNRISE",
            text: "A quiet horizon, two seats beside each other, and nowhere else to be.\nJust the first sunrise we choose to watch together.",
            visual: "future-visual--sunrise"
        },


        "rainy-day": {
            title: "A RANDOM RAINY DAY",
            text: "Rain against the window, two umbrellas by the door, and nowhere we need to be.\nThe sort of ordinary day I think I’d remember forever.",
            visual: "future-visual--rain"
        },


        "somewhere-new": {
            title: "SOMEWHERE NEW",
            text: "A road, a window, a seat beside you — and a destination we haven't named yet.\nSomewhere new sounds better when neither of us knows exactly where it ends.",
            visual: "future-visual--unknown"
        }

    };


    document
        .querySelectorAll(
            ".future-frame"
        )
        .forEach((frame) => {

            frame.addEventListener(
                "click",
                () => {

                    const memory =
                        futureMemories[
                            frame.dataset.memory
                        ];


                    if (!memory) return;


                    if (futureModalTitle) {
                        futureModalTitle.textContent =
                            memory.title;
                    }


                    if (futureModalText) {
                        futureModalText.textContent =
                            memory.text;
                    }


                    if (futureModalVisual) {

                        futureModalVisual.className =
                            `future-modal__visual ${memory.visual}`;

                    }


                    openFutureModal();

                }
            );

        });


    function openFutureModal() {

        if (!futureModal) return;

        futureModal.classList.add(
            "is-open"
        );

        futureModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        if (futureModalClose) {
            setTimeout(() => {
                futureModalClose.focus();
            }, 100);
        }
    }


    function closeFutureModal() {

        if (!futureModal) return;

        futureModal.classList.remove(
            "is-open"
        );

        futureModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }


    if (futureModalClose) {

        futureModalClose.addEventListener(
            "click",
            closeFutureModal
        );

    }


    if (futureModal) {

        const backdrop =
            futureModal.querySelector(
                ".future-modal__backdrop"
            );

        if (backdrop) {

            backdrop.addEventListener(
                "click",
                closeFutureModal
            );

        }

    }


    /* =======================================================
       ROOM 07 — ARCHIVE
       ======================================================= */

    const archiveLightbox = document.getElementById("archive-lightbox");
    const archiveLightboxClose = document.getElementById("archive-lightbox-close");
    const archiveLightboxImage = document.getElementById("archive-lightbox-img");
    const archiveEntryLabel = document.getElementById("archive-entry-label");
    const archiveEntryNote = document.getElementById("archive-entry-note");

    function openArchiveModal(button) {
        if (!archiveLightbox) return;

        const image = button.dataset.image || button.querySelector("img")?.getAttribute("src") || "";
        const entry = button.dataset.entry || "";
        const caption = button.dataset.caption || button.dataset.note || "";

        if (archiveLightboxImage) {
            archiveLightboxImage.classList.remove("image-missing");
            archiveLightboxImage.style.visibility = "";
            archiveLightboxImage.src = image;
            archiveLightboxImage.alt = entry;
        }
        if (archiveEntryLabel) archiveEntryLabel.textContent = entry;
        if (archiveEntryNote) archiveEntryNote.textContent = caption;

        archiveLightbox.classList.add("open");
        archiveLightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        if (archiveLightboxClose) {
            setTimeout(() => archiveLightboxClose.focus(), 50);
        }
    }

    function closeArchiveModal() {
        if (!archiveLightbox) return;
        archiveLightbox.classList.remove("open");
        archiveLightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        if (archiveLightboxImage) archiveLightboxImage.src = "";
    }

    document.querySelectorAll(".archive-item").forEach((photo) => {
        photo.addEventListener("click", () => openArchiveModal(photo));
    });

    if (archiveLightboxClose) archiveLightboxClose.addEventListener("click", closeArchiveModal);
    if (archiveLightbox) {
        archiveLightbox.addEventListener("click", (event) => {
            if (event.target === archiveLightbox) closeArchiveModal();
        });
    }

    /* =======================================================
       CLOSE ALL MODALS
       ======================================================= */

    function closeAllModals() {

        closePhotoLightbox();

        closeNoteModal();

        closeFutureModal();

        closeArchiveModal();

    }


    /* =======================================================
       IMAGE FALLBACKS
       ======================================================= */

    document
        .querySelectorAll("img")
        .forEach((image) => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-missing"
                    );

                    image.style.visibility =
                        "hidden";

                }
            );

        });


    /* =======================================================
       ROOM INITIALIZATION
       ======================================================= */

    function initializeRoom(number) {

        /*
         * Page 4 needs to calculate star positions after
         * its room becomes visible.
         */

        if (number === 4) {

            setTimeout(() => {
                positionGalaxyStars();
            }, 100);

            setTimeout(() => {
                positionGalaxyStars();
            }, 600);

        }


        /*
         * Page 9 final text sequence.
         */

        if (number === 8) {
            startFinalSequence();
        }
    }


    /* =======================================================
       FINAL ROOM — PAGE 09
       ======================================================= */

    let finalSequenceStarted = false;


    function startFinalSequence() {

        if (finalSequenceStarted) {
            return;
        }

        finalSequenceStarted = true;
        document.querySelector(".room--final")?.classList.add("final-sequence-started");


        const lines =
            Array.from(
                document.querySelectorAll(
                    ".final-line"
                )
            );


        if (lines.length === 0) {
            return;
        }


        lines.forEach((line) => {

            line.classList.remove(
                "is-visible"
            );

        });


        lines.forEach(
            (line, index) => {

                setTimeout(() => {

                    line.classList.add(
                        "is-visible"
                    );

                }, 50 + index * 1000);

            }
        );

    }


    /* =======================================================
       INITIAL STATE
       ======================================================= */

    rooms.forEach((room) => {

        const isFirst =
            room.id === "room-01" ||
            room.dataset.room === "01";

        room.classList.toggle(
            "is-active",
            isFirst
        );

        room.setAttribute(
            "aria-hidden",
            isFirst ? "false" : "true"
        );

    });


    currentRoom = 1;

    updateIndicator(
        currentRoom
    );


    /* =======================================================
       INITIAL PAGE 4 STAR POSITION
       ======================================================= */

    /*
     * Do this after the browser has painted the page.
     * This prevents hidden-room dimensions from producing
     * bad star positions.
     */

    requestAnimationFrame(() => {

        setTimeout(() => {
            positionGalaxyStars();
        }, 100);

    });


    window.addEventListener(
        "resize",
        () => {

            positionGalaxyStars();

        }
    );


    /* =======================================================
       PREVENT BACKGROUND SCROLLING WHEN MODAL IS OPEN
       ======================================================= */

    document.addEventListener(
        "wheel",
        (event) => {

            if (
                document.body.classList.contains(
                    "modal-open"
                )
            ) {
                event.preventDefault();
            }

        },
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchmove",
        (event) => {

            if (
                document.body.classList.contains(
                    "modal-open"
                )
            ) {
                event.preventDefault();
            }

        },
        {
            passive: false
        }
    );


    /* =======================================================
       FINAL READY STATE
       ======================================================= */

    document.body.classList.add(
        "museum-ready"
    );


    console.log(
        "A Museum Made For You — Exhibition ready."
    );

});

/* =========================================================
   SECRET BIRTHDAY LOCK SCREEN — ADDED FEATURE ONLY
   ========================================================= */

// Change this one value to change the secret code.
const SECRET_CODE = "3115";

document.addEventListener("DOMContentLoaded", () => {
    const secretLock = document.getElementById("secret-lock-screen");
    const secretLockForm = document.getElementById("secret-lock-form");
    const secretLockInput = document.getElementById("secret-lock-code");
    const secretLockError = document.getElementById("secret-lock-error");

    if (!secretLock || !secretLockForm || !secretLockInput) return;

    secretLockInput.focus();

    secretLockForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (secretLockInput.value === SECRET_CODE) {
            secretLockError.textContent = "";
            secretLock.classList.add("is-unlocking");

            const birthdayMusic = document.getElementById("birthdayMusic");

birthdayMusic.play().catch(error => {
    console.log("Music playback failed:", error);
});

            const burst = document.createElement("div");
            burst.setAttribute("aria-hidden", "true");
            burst.className = "secret-lock-burst";

            ["♡", "✦", "♡", "✧", "·", "♡", "✦", "·"].forEach((symbol, index) => {
                const piece = document.createElement("span");
                piece.textContent = symbol;
                piece.style.setProperty("--burst-angle", `${index * 45}deg`);
                burst.appendChild(piece);
            });

            secretLock.appendChild(burst);

            window.setTimeout(() => {
                secretLock.remove();
            }, 800);
        } else {
            secretLockError.textContent = "Hmm... that's not it ♡ Try again!";
            secretLockError.classList.remove("is-wrong");

            void secretLockError.offsetWidth;

            secretLockError.classList.add("is-wrong");
            secretLockInput.classList.remove("is-wrong");

            void secretLockInput.offsetWidth;

            secretLockInput.classList.add("is-wrong");
            secretLockInput.select();
        }
    });
});


/* =========================================================
   FINAL SONG REVEAL — full-song player on the closing page
   Uses the existing "birthdayMusic" background audio element
   as-is (same file, same normal playback throughout the
   museum) and only fades it out + pauses it at the moment the
   visitor asks to hear the complete song, so the two never
   overlap.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const trigger = document.getElementById("final-song-trigger");
    const player = document.getElementById("final-song-player");
    const audio = document.getElementById("final-song-audio");
    const playPauseButton = document.getElementById("final-song-playpause");
    const progress = document.getElementById("final-song-progress");
    const progressFill = document.getElementById("final-song-progress-fill");
    const currentTimeEl = document.getElementById("final-song-current");
    const durationEl = document.getElementById("final-song-duration");
    const backgroundMusic = document.getElementById("birthdayMusic");

    if (!trigger || !player || !audio || !playPauseButton || !progress) {
        return;
    }

    function fadeOutAndPause(el, duration) {
        return new Promise((resolve) => {
            if (!el || el.paused) {
                resolve();
                return;
            }

            const startVolume = el.volume;

            if (startVolume <= 0) {
                el.pause();
                resolve();
                return;
            }

            const steps = 20;
            const stepTime = duration / steps;
            const volumeStep = startVolume / steps;
            let currentStep = 0;

            const fade = setInterval(() => {
                currentStep += 1;
                el.volume = Math.max(0, startVolume - volumeStep * currentStep);

                if (currentStep >= steps) {
                    clearInterval(fade);
                    el.pause();
                    el.volume = startVolume;
                    resolve();
                }
            }, stepTime);
        });
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");
        return `${mins}:${secs}`;
    }

    function setPlayingState(isPlaying) {
        playPauseButton.classList.toggle("is-playing", isPlaying);
        playPauseButton.setAttribute(
            "aria-label",
            isPlaying ? "Pause the full song" : "Play the full song"
        );
    }

    function playFullSong() {
        audio.play().catch((error) => {
            console.log("Full song playback failed:", error);
        });
    }

    let playerRevealed = false;

    trigger.addEventListener("click", () => {
        if (!playerRevealed) {
            playerRevealed = true;
            player.hidden = false;

            // Force a reflow so the reveal transition plays.
            void player.offsetWidth;

            player.classList.add("is-visible");
        }

        fadeOutAndPause(backgroundMusic, 700).then(playFullSong);
    });

    playPauseButton.addEventListener("click", () => {
        if (audio.paused) {
            playFullSong();
        } else {
            audio.pause();
        }
    });

    audio.addEventListener("play", () => {
        setPlayingState(true);
    });

    audio.addEventListener("pause", () => {
        setPlayingState(false);
    });

    audio.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
        currentTimeEl.textContent = formatTime(audio.currentTime);

        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${percent}%`;
            progress.setAttribute("aria-valuenow", String(Math.round(percent)));
        }
    });

    audio.addEventListener("ended", () => {
        setPlayingState(false);
        audio.currentTime = 0;
        progressFill.style.width = "0%";
        progress.setAttribute("aria-valuenow", "0");
    });

    function seekFromClientX(clientX) {
        if (!audio.duration) {
            return;
        }
        const rect = progress.getBoundingClientRect();
        const ratio = Math.min(
            1,
            Math.max(0, (clientX - rect.left) / rect.width)
        );
        audio.currentTime = ratio * audio.duration;
    }

    progress.addEventListener("click", (event) => {
        seekFromClientX(event.clientX);
    });

    progress.addEventListener("keydown", (event) => {
        if (!audio.duration) {
            return;
        }
        if (event.key === "ArrowRight") {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        } else if (event.key === "ArrowLeft") {
            audio.currentTime = Math.max(0, audio.currentTime - 5);
        }
    });
});
